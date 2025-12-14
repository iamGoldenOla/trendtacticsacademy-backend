"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = __importDefault(require("../models/User"));
dotenv_1.default.config();
const email = process.argv[2];
if (!email) {
    console.error('Usage: ts-node findUserByEmail.ts <email>');
    process.exit(1);
}
const MONGO_URI = process.env.MONGO_URI || '';
if (!MONGO_URI) {
    console.error('MONGO_URI not set in environment variables.');
    process.exit(1);
}
(async () => {
    try {
        await mongoose_1.default.connect(MONGO_URI);
        const user = await User_1.default.findOne({ email });
        if (user) {
            console.log('User found:', user);
        }
        else {
            console.log('User not found for email:', email);
        }
        await mongoose_1.default.disconnect();
    }
    catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
})();
