#!/usr/bin/env node

/**
 * ╔══════════════════════════════════════════════════╗
 * ║   🤖 AI Code Review Agent v2.0.0                 ║
 * ║   Powered by Google Gemini — Intelligent Reviews  ║
 * ╚══════════════════════════════════════════════════╝
 *
 * A true AI agent that reads your codebase, understands context,
 * and provides intelligent code review feedback.
 *
 * Usage:
 *   GEMINI_API_KEY=your_key node tools/code-review-agent.js
 *   npm run review                (after setting GEMINI_API_KEY in .env)
 *
 * Flags:
 *   --verbose    Show detailed progress
 *   --json       Also output a JSON report
 *   --focus=DIR  Only review files in a specific directory
 */

const fs = require("fs");
const path = require("path");
const https = require("https");

// ─── Configuration ───────────────────────────────────────────────────────────

const ROOT = path.resolve(__dirname, "..");
const CONFIG_PATH = path.join(__dirname, ".codereviewrc.json");

// Load .env manually (zero-dependency)
function loadEnv() {
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

const DEFAULT_CONFIG = {
    include: ["controller", "routes", "models", "utils", "client/src", "."],
    exclude: ["node_modules", "dist", "build", ".git", "public", "client/node_modules", "tools"],
    extensions: [".js", ".jsx", ".css"],
    maxDepth: 6,
    output: "CODE_REVIEW_REPORT.md",
    reviewCategories: ["security", "performance", "best-practices", "code-quality", "react-patterns", "error-handling"],
    maxFilesPerBatch: 5,
    model: "gemini-2.0-flash",
};

function loadConfig() {
    try {
        const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
        return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
    } catch {
        return DEFAULT_CONFIG;
    }
}

// ─── File Discovery ──────────────────────────────────────────────────────────

function discoverFiles(config, focusDir) {
    const files = [];
    const excludeSet = new Set(config.exclude);
    const extSet = new Set(config.extensions);

    function walk(dir, depth) {
        if (depth > config.maxDepth) return;
        let entries;
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

// ─── Gemini API Client ──────────────────────────────────────────────────────

function callGemini(apiKey, model, prompt) {
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

        const options = {
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
            res.on("data", (chunk) => (data += chunk));
            res.on("end", () => {
                try {
                    const json = JSON.parse(data);
                    if (json.error) {
                        reject(new Error(`Gemini API Error: ${json.error.message}`));
                        return;
                    }
                    const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (!text) {
                        reject(new Error("Empty response from Gemini API"));
                        return;
                    }
                    resolve(text);
                } catch (e) {
                    reject(new Error(`Failed to parse Gemini response: ${e.message}`));
                }
            });
        });

        req.on("error", reject);
        req.write(body);
        req.end();
    });
}

// ─── Agent Core ──────────────────────────────────────────────────────────────

/**
 * The Agent operates in a loop:
 *
 *   1. OBSERVE  — Read files and understand the codebase context
 *   2. THINK   — Send code to Gemini for intelligent review
 *   3. ACT     — Collect findings and decide what to review next
 *   4. REPORT  — Synthesize all findings into a final report
 */

class CodeReviewAgent {
    constructor(config, apiKey, verbose) {
        this.config = config;
        this.apiKey = apiKey;
        this.verbose = verbose;
        this.findings = [];
        this.filesSummaries = {};
        this.overallContext = "";
    }

    log(msg) {
        if (this.verbose) console.log(`   ${msg}`);
    }

    // ── Step 1: Observe — Build codebase context ──

    buildContext(files) {
        const structure = files.map((f) => path.relative(ROOT, f)).join("\n");
        this.overallContext = `
PROJECT: Movie Reservation System
TECH STACK: Node.js/Express backend, React/Vite frontend, MongoDB/Mongoose, Redux Toolkit
STRUCTURE:
${structure}
    `.trim();
    }

    // ── Step 2: Think — Ask AI to review code batches ──

    async reviewBatch(batch) {
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

        const prompt = `You are a senior full-stack code reviewer. Review the following code files from a Movie Reservation System (Node.js/Express + React/Vite + MongoDB).

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
      "file": "relative/path/to/file.js",
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

        // Parse JSON from response (handle markdown code fences if present)
        let cleaned = response.trim();
        if (cleaned.startsWith("```")) {
            cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
        }

        try {
            return JSON.parse(cleaned);
        } catch (e) {
            this.log(`⚠️  Failed to parse AI response, retrying with extraction...`);
            // Try to extract JSON from the response
            const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error(`Could not parse AI response: ${e.message}`);
        }
    }

    // ── Step 3: Act — Process findings ──

    processReviewResult(result) {
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

    // ── Step 4: Synthesize — Get overall assessment ──

    async synthesize() {
        const findingSummary = this.findings
            .map((f) => `[${f.severity}] ${f.file}:${f.line} — ${f.issue}`)
            .join("\n");

        const prompt = `You are a senior architect summarizing a code review for a Movie Reservation System (Node.js/Express + React + MongoDB).

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
            return JSON.parse(cleaned);
        } catch {
            const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
            if (jsonMatch) return JSON.parse(jsonMatch[0]);
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

    // ── Main Agent Loop ──

    async run(files) {
        console.log("\n🤖 Agent starting review...\n");

        // Step 1: Observe
        console.log("👁️  Step 1/4 — Observing codebase structure...");
        this.buildContext(files);
        this.log(`Built context with ${files.length} files`);

        // Step 2 & 3: Think + Act (batched)
        console.log("🧠 Step 2/4 — Analyzing code with AI...\n");
        const batchSize = this.config.maxFilesPerBatch || 5;
        const batches = [];
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
            } catch (err) {
                console.log(`   ⚠️  Batch ${i + 1} failed: ${err.message}`);
            }

            // Small delay between batches to respect rate limits
            if (i < batches.length - 1) {
                await new Promise((r) => setTimeout(r, 1000));
            }
        }

        // Step 4: Synthesize
        console.log("\n📊 Step 3/4 — Synthesizing overall assessment...");
        let synthesis;
        try {
            synthesis = await this.synthesize();
        } catch (err) {
            console.log(`   ⚠️  Synthesis failed: ${err.message}`);
            synthesis = {
                overallScore: 70,
                grade: "C",
                executiveSummary: "Review completed with partial analysis.",
                topPriorities: [],
                strengths: [],
                recommendations: [],
            };
        }

        // Step 5: Report
        console.log("📝 Step 4/4 — Generating report...\n");
        return this.generateReport(files.length, synthesis);
    }

    // ── Report Generator ──

    generateReport(filesScanned, synthesis) {
        const now = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
        const errors = this.findings.filter((f) => f.severity === "error").length;
        const warnings = this.findings.filter((f) => f.severity === "warning").length;
        const infos = this.findings.filter((f) => f.severity === "info").length;

        const score = synthesis.overallScore || 70;
        const filled = Math.round(score / 5);
        const empty = 20 - filled;

        let md = "";

        // ── Header ──
        md += `# 🤖 AI Code Review Report\n\n`;
        md += `> Generated on **${now}** by AI Code Review Agent v2.0.0\n`;
        md += `> Model: **${this.config.model}** | Files: **${filesScanned}** | Findings: **${this.findings.length}**\n\n`;

        // ── Executive Summary ──
        md += `## 📊 Executive Summary\n\n`;

        const scoreEmoji = score >= 90 ? "🟢" : score >= 70 ? "🟡" : score >= 50 ? "🟠" : "🔴";
        md += `| Metric | Value |\n|--------|-------|\n`;
        md += `| **Health Score** | ${scoreEmoji} **${score}/100** (Grade: **${synthesis.grade}**) |\n`;
        md += `| **Files Reviewed** | ${filesScanned} |\n`;
        md += `| **Total Findings** | ${this.findings.length} |\n`;
        md += `| 🔴 Errors | ${errors} |\n`;
        md += `| 🟡 Warnings | ${warnings} |\n`;
        md += `| 🔵 Info | ${infos} |\n\n`;

        md += `**Health:** ${"█".repeat(filled)}${"░".repeat(empty)} ${score}%\n\n`;

        if (synthesis.executiveSummary) {
            md += `> ${synthesis.executiveSummary}\n\n`;
        }

        // ── Architecture Assessment ──
        if (synthesis.architecture) {
            md += `## 🏗️ Architecture Assessment\n\n${synthesis.architecture}\n\n`;
        }

        // ── Security Assessment ──
        if (synthesis.securityPosture) {
            md += `## 🔒 Security Posture\n\n${synthesis.securityPosture}\n\n`;
        }

        // ── Top Priorities ──
        if (synthesis.topPriorities?.length) {
            md += `## 🎯 Top Priorities\n\n`;
            synthesis.topPriorities.forEach((p, i) => {
                md += `${i + 1}. ${p}\n`;
            });
            md += `\n`;
        }

        // ── Strengths ──
        if (synthesis.strengths?.length) {
            md += `## 💪 Strengths\n\n`;
            synthesis.strengths.forEach((s) => {
                md += `- ✅ ${s}\n`;
            });
            md += `\n`;
        }

        // ── Detailed Findings by Category ──
        md += `## 📋 Detailed Findings\n\n`;

        const categoryIcons = {
            security: "🔒",
            performance: "⚡",
            "best-practices": "✅",
            "code-quality": "🧹",
            "react-patterns": "⚛️",
            "error-handling": "🛡️",
        };

        const byCategory = {};
        for (const f of this.findings) {
            const cat = f.category || "code-quality";
            if (!byCategory[cat]) byCategory[cat] = [];
            byCategory[cat].push(f);
        }

        for (const [cat, catFindings] of Object.entries(byCategory)) {
            const icon = categoryIcons[cat] || "📌";
            md += `### ${icon} ${cat.charAt(0).toUpperCase() + cat.slice(1)} — ${catFindings.length} issue(s)\n\n`;

            // Group by file
            const byFile = {};
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

        // ── File Ratings ──
        md += `## 📁 File Ratings\n\n`;
        md += `| File | Rating | Highlights |\n|------|--------|------------|\n`;
        for (const [file, summary] of Object.entries(this.filesSummaries)) {
            const positives = (summary.positives || []).slice(0, 2).join("; ") || "—";
            md += `| \`${file}\` | **${summary.rating}** | ${positives} |\n`;
        }
        md += `\n`;

        // ── Recommendations ──
        if (synthesis.recommendations?.length) {
            md += `## 🚀 Strategic Recommendations\n\n`;
            synthesis.recommendations.forEach((r, i) => {
                md += `${i + 1}. ${r}\n`;
            });
            md += `\n`;
        }

        // ── Footer ──
        md += `---\n\n`;
        md += `*Generated by [AI Code Review Agent](tools/code-review-agent.js) — `;
        md += `powered by Google Gemini*\n`;

        return md;
    }
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
    loadEnv();

    const verbose = process.argv.includes("--verbose");
    const jsonOutput = process.argv.includes("--json");
    const focusArg = process.argv.find((a) => a.startsWith("--focus="));
    const focusDir = focusArg ? focusArg.split("=")[1] : null;

    console.log("\n╔══════════════════════════════════════════════════╗");
    console.log("║   🤖 AI Code Review Agent v2.0.0                 ║");
    console.log("║   Powered by Google Gemini                        ║");
    console.log("╚══════════════════════════════════════════════════╝");

    // Check API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("\n❌ GEMINI_API_KEY not found!\n");
        console.error("Set it in one of these ways:");
        console.error("  1. Add GEMINI_API_KEY=your_key to your .env file");
        console.error("  2. Run: GEMINI_API_KEY=your_key npm run review");
        console.error("\nGet a free API key at: https://aistudio.google.com/apikey\n");
        process.exit(1);
    }

    // Load config
    const config = loadConfig();
    if (verbose) console.log("\n📋 Config:", JSON.stringify(config, null, 2));

    // Discover files
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

    // Run the agent
    const agent = new CodeReviewAgent(config, apiKey, verbose);
    const report = await agent.run(files);

    // Write outputs
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

main().catch((err) => {
    console.error("\n❌ Agent failed:", err.message);
    process.exit(1);
});
