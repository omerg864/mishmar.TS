"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserScheme = void 0;
const mongoose = require("mongoose");
exports.UserScheme = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    nickname: {
        type: String,
        default: ""
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    friday_noon: {
        type: Number,
        default: 0,
        required: false
    },
    weekend_night: {
        type: Number,
        default: 0,
        required: false
    },
    weekend_day: {
        type: Number,
        default: 0,
        required: false
    },
    role: [
        { type: String,
            enum: ["ADMIN", "SITE_MANAGER", "SHIFT_MANAGER", "USER", "EXTRA"],
            default: ["USER"]
        }
    ]
});
//# sourceMappingURL=user.model.js.map