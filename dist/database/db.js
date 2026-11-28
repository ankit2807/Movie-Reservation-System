"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
mongoose_1.default.set("strictQuery", true);
const connection = async () => {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) {
            throw new Error("MONGO_URI environment variable is not defined");
        }
        await mongoose_1.default.connect(uri);
        console.log("Database connected");
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Could not connect to database:", message);
        throw error;
    }
};
exports.default = connection;
//# sourceMappingURL=db.js.map