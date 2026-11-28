declare module "express-mongo-sanitize" {
  import type { RequestHandler } from "express";

  interface MongoSanitizeOptions {
    replaceWith?: string;
    allowDots?: boolean;
    dryRun?: boolean;
    onSanitize?: (params: { req: unknown; key: string }) => void;
  }

  function mongoSanitize(options?: MongoSanitizeOptions): RequestHandler;
  export = mongoSanitize;
}
