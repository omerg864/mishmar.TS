"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = __importStar(require("mongoose"));
const bcrypt = __importStar(require("bcryptjs"));
const dotenv = __importStar(require("dotenv"));
const path = __importStar(require("path"));
const user_model_1 = require("../src/user/user.model");
const settings_model_1 = require("../src/settings/settings.model");
dotenv.config({ path: path.resolve(__dirname, '../.env.production') });
async function setup() {
    const uri = process.env.MONGODB;
    if (!uri) {
        console.error('MONGODB URI not found in .env.production');
        process.exit(1);
    }
    try {
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');
        const UserModel = mongoose.model('User', user_model_1.UserScheme);
        const SettingsModel = mongoose.model('Settings', settings_model_1.SettingsScheme);
        const adminExists = await UserModel.findOne({ username: 'admin' });
        if (!adminExists) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('admin', salt);
            await UserModel.create({
                name: 'Admin',
                username: 'admin',
                email: 'admin@mishmar.com',
                password: hashedPassword,
                role: ['ADMIN'],
            });
            console.log('Admin user created');
        }
        else {
            console.log('Admin user already exists');
        }
        const settingsExists = await SettingsModel.findOne();
        if (!settingsExists) {
            await SettingsModel.create({});
            console.log('Settings document created with default values');
        }
        else {
            console.log('Settings document already exists');
        }
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
    catch (error) {
        console.error('Error during setup:', error);
        process.exit(1);
    }
}
setup();
//# sourceMappingURL=setup-db.js.map