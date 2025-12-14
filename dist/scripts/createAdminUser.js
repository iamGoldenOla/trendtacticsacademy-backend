"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = __importDefault(require("../models/User"));
const password_1 = require("../utils/password");
dotenv_1.default.config();
const adminUsers = [
    { name: 'Admin User', email: 'admin@trendtacticsacademy.com', password: 'AdminPassword123' },
    { name: 'Support', email: 'support@trendtactics.academy', password: 'AdminPassword123' },
    { name: 'Gmail Admin', email: 'trendtacticsacademy@gmail.com', password: 'AdminPassword123' },
    { name: 'Hello Academy', email: 'hello@trendtactics.academy', password: 'AdminPassword123' },
    { name: 'Hello Academy.com', email: 'hello@trendtacticsacademy.com', password: 'AdminPassword123' },
    { name: 'Support Academy.com', email: 'support@trendtacticsacademy.com', password: 'AdminPassword123' },
    { name: 'Info Academy', email: 'info@trendtactics.academy', password: 'AdminPassword123' },
    { name: 'Info Academy.com', email: 'info@trendtacticsacademy.com', password: 'AdminPassword123' },
    { name: 'Connect Academy', email: 'connect@trendtactics.academy', password: 'AdminPassword123' },
    { name: 'Connect Academy.com', email: 'connect@trendtacticsacademy.com', password: 'AdminPassword123' }
];
const MONGO_URI = process.env.MONGO_URI || '';
if (!MONGO_URI) {
    console.error('MONGO_URI not set in environment variables.');
    process.exit(1);
}
(async () => {
    try {
        await mongoose_1.default.connect(MONGO_URI);
        for (const admin of adminUsers) {
            const userExists = await User_1.default.findOne({ email: admin.email });
            if (userExists) {
                console.log('User already exists with this email:', admin.email);
                continue;
            }
            const hashedPassword = await (0, password_1.hashPassword)(admin.password);
            const user = await User_1.default.create({
                name: admin.name,
                email: admin.email,
                password: hashedPassword,
                role: 'admin'
            });
            console.log('Admin user created:', user.email);
        }
        await mongoose_1.default.disconnect();
        console.log('Done creating admin users.');
    }
    catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
})();
