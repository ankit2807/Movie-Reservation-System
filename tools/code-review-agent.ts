#!/usr/bin/env node

import fs from "fs";
import path from "path";
import https from "https";

interface ReviewConfig {
  include: string[];
  exclude: string[];
  extensions: string[];
  maxDepth: number;
  output: string;
  reviewCategories: string[];
  maxFilesPerBatch: number;
  model: string;
}

interface ReviewFinding {
  file: string;
  line: number;
  severity: "error" | "warning" | "info" | string;
  category: string;
  issue: string;
  suggestion: string;
  codeSnippet: string;
}

interface FileSummary {
  positives: string[];
  rating: string;
}

interface BatchReviewResponse {
  reviews?: Array<{
    file: string;
    findings?: Array<{
      line?: number;
      severity?: string;
      category?: string;
      issue?: string;
      suggestion?: string;
      codeSnippet?: string;
    }>;
    positives?: string[];
    overallRating?: string;
  }>;
}

interface SynthesisResponse {
  overallScore?: number;
  grade?: string;
  executiveSummary?: string;
  topPriorities?: string[];
  architecture?: string;
  securityPosture?: string;
  strengths?: string[];
  recommendations?: string[];
}

interface GeminiApiResponse {
  error?: { message?: string };
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
}

const ROOT = fs.existsSync(path.resolve(__dirname, "..", "package.json"))
  ? path.resolve(__dirname, "..")
  : path.resolve(__dirname, "..", "..");

const CONFIG_PATH = path.join(ROOT, "tools", ".codereviewrc.json");

function loadEnv(): void {
  try {
    const envPath = path.join(ROOT, ".env");
    const content = fs.readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.substring(0, eqIdx).trim();
      const val = trimmed.substring(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    // .env file not found — fine, user can set env vars directly
  }
}

const DEFAULT_CONFIG: ReviewConfig = {
  include: ["controller", "routes", "models", "utils", "client/src", "."],
  exclude: ["node_modules", "dist", "build", ".git", "public", "client/node_modules", "tools"],
  extensions: [".ts", ".tsx", ".css"],
  maxDepth: 6,
  output: "CODE_REVIEW_REPORT.md",
  reviewCategories: [
    "security",
    "performance",
    "best-practices",
    "code-quality",
    "react-patterns",
    "error-handling",
  ],
  maxFilesPerBatch: 5,
  model: "gemini-2.5-flash",
};

function loadConfig(): ReviewConfig {
  try {
    const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
    return { ...DEFAULT_CONFIG, ...(JSON.parse(raw) as Partial<ReviewConfig>) };
  } catch {
    return DEFAULT_CONFIG;
  }
}

function discoverFiles(config: ReviewConfig, focusDir: string | null): string[] {
  const files: string[] = [];
  const excludeSet = new Set(config.exclude);
  const extSet = new Set(config.extensions);

  function walk(dir: string, depth: number): void {
    if (depth > config.maxDepth) return;
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (excludeSet.has(entry.name)) continue;
      if (entry.name.startsWith(".")) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full, depth + 1);
      } else if (entry.isFile() && extSet.has(path.extname(entry.name))) {
        files.push(full);
      }
    }
  }

  if (focusDir) {
    const target = path.resolve(ROOT, focusDir);
    if (fs.existsSync(target)) walk(target, 0);
  } else {
    for (const inc of config.include) {
      const target = path.resolve(ROOT, inc);
      if (fs.existsSync(target)) {
        const stat = fs.statSync(target);
        if (stat.isDirectory()) walk(target, 0);
        else if (stat.isFile() && extSet.has(path.extname(target))) files.push(target);
      }
    }
  }

  return [...new Set(files)];
}

function callGemini(apiKey: string, model: string, prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const parsed = new URL(url);

    const body = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 8192,
      },
    });

    const options: https.RequestOptions = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk: Buffer | string) => {
        data += String(chunk);
      });
      res.on("end", () => {
        try {
          const json = JSON.parse(data) as GeminiApiResponse;
          if (json.error) {
            reject(new Error(`Gemini API Error: ${json.error.message || "Unknown error"}`));
            return;
          }
          const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!text) {
            reject(new Error("Empty response from Gemini API"));
            return;
          }
          resolve(text);
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : String(e);
          reject(new Error(`Failed to parse Gemini response: ${msg}`));
        }
      });
    });

    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

class CodeReviewAgent {
  private readonly config: ReviewConfig;
  private readonly apiKey: string;
  private readonly verbose: boolean;
  public findings: ReviewFinding[];
  public filesSummaries: Record<string, FileSummary>;
  private overallContext: string;

  constructor(config: ReviewConfig, apiKey: string, verbose: boolean) {
    this.config = config;
    this.apiKey = apiKey;
    this.verbose = verbose;
    this.findings = [];
    this.filesSummaries = {};
    this.overallContext = "";
  }

  log(msg: string): void {
    if (this.verbose) console.log(`   ${msg}`);
  }

  buildContext(files: string[]): void {
    const structure = files.map((f) => path.relative(ROOT, f)).join("\n");
    this.overallContext = `
PROJECT: Movie Reservation System
TECH STACK: TypeScript, Node.js/Express backend, React/Vite frontend, MongoDB/Mongoose, Redux Toolkit, Stripe
STRUCTURE:
${structure}
    `.trim();
  }

  async reviewBatch(batch: string[]): Promise<BatchReviewResponse> {
    const filesContent = batch
      .map((fp) => {
        try {
          const content = fs.readFileSync(fp, "utf-8");
          const relPath = path.relative(ROOT, fp);
          return `\n--- FILE: ${relPath} ---\n${content}\n--- END FILE ---`;
        } catch {
          return "";
        }
      })
      .filter(Boolean)
      .join("\n");

    const prompt = `You are a senior full-stack TypeScript code reviewer. Review the following code files from a Movie Reservation System (TypeScript Node.js/Express + React/Vite + MongoDB).

PROJECT CONTEXT:
${this.overallContext}

REVIEW CATEGORIES:
${this.config.reviewCategories.join(", ")}

INSTRUCTIONS:
1. Analyze each file for issues across ALL review categories
2. Be specific — reference exact line numbers and code snippets
3. Prioritize actionable feedback
4. Note both problems AND good practices

OUTPUT FORMAT — respond ONLY with valid JSON (no markdown fences):
{
  "reviews": [
    {
      "file": "relative/path/to/file.ts",
      "findings": [
        {
          "line": 42,
          "severity": "error|warning|info",
          "category": "security|performance|best-practices|code-quality|react-patterns|error-handling",
          "issue": "Clear description of the issue",
          "suggestion": "Specific fix or improvement",
          "codeSnippet": "the problematic code"
        }
      ],
      "positives": ["What the file does well"],
      "overallRating": "A|B|C|D|F"
    }
  ]
}

CODE TO REVIEW:
${filesContent}`;

    const response = await callGemini(this.apiKey, this.config.model, prompt);

    let cleaned = response.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    try {
      return JSON.parse(cleaned) as BatchReviewResponse;
    } catch (e: unknown) {
      this.log(`⚠️  Failed to parse AI response, retrying with extraction...`);
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as BatchReviewResponse;
      }
      const msg = e instanceof Error ? e.message : String(e);
      throw new Error(`Could not parse AI response: ${msg}`);
    }
  }

  processReviewResult(result: BatchReviewResponse): void {
    if (!result?.reviews) return;

    for (const review of result.reviews) {
      this.filesSummaries[review.file] = {
        positives: review.positives || [],
        rating: review.overallRating || "N/A",
      };

      if (review.findings) {
        for (const finding of review.findings) {
          this.findings.push({
            file: review.file,
            line: finding.line || 0,
            severity: finding.severity || "info",
            category: finding.category || "code-quality",
            issue: finding.issue || "",
            suggestion: finding.suggestion || "",
            codeSnippet: finding.codeSnippet || "",
          });
        }
      }
    }
  }

  async synthesize(): Promise<SynthesisResponse> {
    const findingSummary = this.findings
      .map((f) => `[${f.severity}] ${f.file}:${f.line} — ${f.issue}`)
      .join("\n");

    const prompt = `You are a senior architect summarizing a code review for a Movie Reservation System (TypeScript Node.js/Express + React + MongoDB).

Here are all findings from the review:

${findingSummary}

File ratings: ${JSON.stringify(this.filesSummaries, null, 2)}

Provide a JSON response (no markdown fences) with:
{
  "overallScore": 0-100,
  "grade": "A|B|C|D|F",
  "executiveSummary": "2-3 sentence high-level assessment",
  "topPriorities": ["top 3-5 things to fix first"],
  "architecture": "Brief assessment of code architecture",
  "securityPosture": "Brief security assessment",
  "strengths": ["What the codebase does well"],
  "recommendations": ["Strategic recommendations for improvement"]
}`;

    const response = await callGemini(this.apiKey, this.config.model, prompt);
    let cleaned = response.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    try {
      return JSON.parse(cleaned) as SynthesisResponse;
    } catch {
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]) as SynthesisResponse;
      return {
        overallScore: 70,
        grade: "C",
        executiveSummary: "Review completed. See detailed findings below.",
        topPriorities: [],
        strengths: [],
        recommendations: [],
      };
    }
  }

  async run(files: string[]): Promise<string> {
    console.log("\n🤖 Agent starting review...\n");

    console.log("👁️  Step 1/4 — Observing codebase structure...");
    this.buildContext(files);
    this.log(`Built context with ${files.length} files`);

    console.log("🧠 Step 2/4 — Analyzing code with AI...\n");
    const batchSize = this.config.maxFilesPerBatch || 5;
    const batches: string[][] = [];
    for (let i = 0; i < files.length; i += batchSize) {
      batches.push(files.slice(i, i + batchSize));
    }

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      const batchFiles = batch.map((f) => path.relative(ROOT, f)).join(", ");
      console.log(`   📦 Batch ${i + 1}/${batches.length}: ${batchFiles}`);

      try {
        const result = await this.reviewBatch(batch);
        this.processReviewResult(result);
        console.log(`   ✅ Batch ${i + 1} complete — ${this.findings.length} findings so far`);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.log(`   ⚠️  Batch ${i + 1} failed: ${msg}`);
      }

      if (i < batches.length - 1) {
        await new Promise<void>((r) => setTimeout(r, 1000));
      }
    }

    console.log("\n📊 Step 3/4 — Synthesizing overall assessment...");
    let synthesis: SynthesisResponse;
    try {
      synthesis = await this.synthesize();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`   ⚠️  Synthesis failed: ${msg}`);
      synthesis = {
        overallScore: 70,
        grade: "C",
        executiveSummary: "Review completed with partial analysis.",
        topPriorities: [],
        strengths: [],
        recommendations: [],
      };
    }

    console.log("📝 Step 4/4 — Generating report...\n");
    return this.generateReport(files.length, synthesis);
  }

  generateReport(filesScanned: number, synthesis: SynthesisResponse): string {
    const now = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    const errors = this.findings.filter((f) => f.severity === "error").length;
    const warnings = this.findings.filter((f) => f.severity === "warning").length;
    const infos = this.findings.filter((f) => f.severity === "info").length;

    const score = synthesis.overallScore || 70;
    const filled = Math.round(score / 5);
    const empty = 20 - filled;

    let md = "";

    md += `# 🤖 AI Code Review Report\n\n`;
    md += `> Generated on **${now}** by AI Code Review Agent v2.0.0\n`;
    md += `> Model: **${this.config.model}** | Files: **${filesScanned}** | Findings: **${this.findings.length}**\n\n`;

    md += `## 📊 Executive Summary\n\n`;

    const scoreEmoji = score >= 90 ? "🟢" : score >= 70 ? "🟡" : score >= 50 ? "🟠" : "🔴";
    md += `| Metric | Value |\n|--------|-------|\n`;
    md += `| **Health Score** | ${scoreEmoji} **${score}/100** (Grade: **${synthesis.grade || "N/A"}**) |\n`;
    md += `| **Files Reviewed** | ${filesScanned} |\n`;
    md += `| **Total Findings** | ${this.findings.length} |\n`;
    md += `| 🔴 Errors | ${errors} |\n`;
    md += `| 🟡 Warnings | ${warnings} |\n`;
    md += `| 🔵 Info | ${infos} |\n\n`;

    md += `**Health:** ${"█".repeat(filled)}${"░".repeat(empty)} ${score}%\n\n`;

    if (synthesis.executiveSummary) {
      md += `> ${synthesis.executiveSummary}\n\n`;
    }

    if (synthesis.architecture) {
      md += `## 🏗️ Architecture Assessment\n\n${synthesis.architecture}\n\n`;
    }

    if (synthesis.securityPosture) {
      md += `## 🔒 Security Posture\n\n${synthesis.securityPosture}\n\n`;
    }

    if (synthesis.topPriorities?.length) {
      md += `## 🎯 Top Priorities\n\n`;
      synthesis.topPriorities.forEach((p, i) => {
        md += `${i + 1}. ${p}\n`;
      });
      md += `\n`;
    }

    if (synthesis.strengths?.length) {
      md += `## 💪 Strengths\n\n`;
      synthesis.strengths.forEach((s) => {
        md += `- ✅ ${s}\n`;
      });
      md += `\n`;
    }

    md += `## 📋 Detailed Findings\n\n`;

    const categoryIcons: Record<string, string> = {
      security: "🔒",
      performance: "⚡",
      "best-practices": "✅",
      "code-quality": "🧹",
      "react-patterns": "⚛️",
      "error-handling": "🛡️",
    };

    const byCategory: Record<string, ReviewFinding[]> = {};
    for (const f of this.findings) {
      const cat = f.category || "code-quality";
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(f);
    }

    for (const [cat, catFindings] of Object.entries(byCategory)) {
      const icon = categoryIcons[cat] || "📌";
      md += `### ${icon} ${cat.charAt(0).toUpperCase() + cat.slice(1)} — ${catFindings.length} issue(s)\n\n`;

      const byFile: Record<string, ReviewFinding[]> = {};
      for (const f of catFindings) {
        if (!byFile[f.file]) byFile[f.file] = [];
        byFile[f.file].push(f);
      }

      for (const [file, fileFindings] of Object.entries(byFile)) {
        md += `#### 📄 \`${file}\`\n\n`;

        for (const f of fileFindings) {
          const sevIcon = f.severity === "error" ? "🔴" : f.severity === "warning" ? "🟡" : "🔵";
          md += `- ${sevIcon} **Line ${f.line}**: ${f.issue}\n`;
          if (f.codeSnippet) md += `  \`\`\`\n  ${f.codeSnippet}\n  \`\`\`\n`;
          if (f.suggestion) md += `  💡 *Fix:* ${f.suggestion}\n`;
          md += `\n`;
        }
      }
    }

    md += `## 📁 File Ratings\n\n`;
    md += `| File | Rating | Highlights |\n|------|--------|------------|\n`;
    for (const [file, summary] of Object.entries(this.filesSummaries)) {
      const positives = (summary.positives || []).slice(0, 2).join("; ") || "—";
      md += `| \`${file}\` | **${summary.rating}** | ${positives} |\n`;
    }
    md += `\n`;

    if (synthesis.recommendations?.length) {
      md += `## 🚀 Strategic Recommendations\n\n`;
      synthesis.recommendations.forEach((r, i) => {
        md += `${i + 1}. ${r}\n`;
      });
      md += `\n`;
    }

    md += `---\n\n`;
    md += `*Generated by [AI Code Review Agent](tools/code-review-agent.ts) — `;
    md += `powered by Google Gemini*\n`;

    return md;
  }
}

async function main(): Promise<void> {
  loadEnv();

  const verbose = process.argv.includes("--verbose");
  const jsonOutput = process.argv.includes("--json");
  const focusArg = process.argv.find((a) => a.startsWith("--focus="));
  const focusDir = focusArg ? focusArg.split("=")[1] : null;

  console.log("\n╔══════════════════════════════════════════════════╗");
  console.log("║   🤖 AI Code Review Agent v2.0.0                 ║");
  console.log("║   Powered by Google Gemini                        ║");
  console.log("╚══════════════════════════════════════════════════╝");

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("\n❌ GEMINI_API_KEY not found!\n");
    console.error("Set it in one of these ways:");
    console.error("  1. Add GEMINI_API_KEY=your_key to your .env file");
    console.error("  2. Run: GEMINI_API_KEY=your_key npm run review");
    console.error("\nGet a free API key at: https://aistudio.google.com/apikey\n");
    process.exit(1);
  }

  const config = loadConfig();
  if (verbose) console.log("\n📋 Config:", JSON.stringify(config, null, 2));

  console.log("\n📂 Scanning files...");
  const files = discoverFiles(config, focusDir);
  console.log(`   Found ${files.length} files to review`);

  if (files.length === 0) {
    console.log("\n⚠️  No files found. Check your .codereviewrc.json config.");
    process.exit(0);
  }

  if (verbose) {
    for (const f of files) console.log(`   📄 ${path.relative(ROOT, f)}`);
  }

  const agent = new CodeReviewAgent(config, apiKey, verbose);
  const report = await agent.run(files);

  const reportPath = path.join(ROOT, config.output);
  fs.writeFileSync(reportPath, report);
  console.log(`📝 Report saved to: ${reportPath}`);

  if (jsonOutput) {
    const jsonPath = path.join(ROOT, "code-review-report.json");
    const jsonData = {
      generatedAt: new Date().toISOString(),
      filesScanned: files.length,
      totalFindings: agent.findings.length,
      findings: agent.findings,
      fileRatings: agent.filesSummaries,
    };
    fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2));
    console.log(`📝 JSON report saved to: ${jsonPath}`);
  }

  console.log("\n✅ AI code review complete!\n");
}

main().catch((err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err);
  console.error("\n❌ Agent failed:", msg);
  process.exit(1);
});
