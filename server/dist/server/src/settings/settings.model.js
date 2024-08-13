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
exports.SettingsScheme = void 0;
const mongoose = __importStar(require("mongoose"));
exports.SettingsScheme = new mongoose.Schema({
    submit: {
        type: Boolean,
        default: false,
    },
    officer: {
        required: false,
        type: String,
        default: '',
    },
    pin_code: {
        required: false,
        type: String,
        default: '1234',
    },
    title: {
        required: false,
        type: String,
        default: '',
    },
    max_seq_nights: {
        required: false,
        type: Number,
        default: 2,
    },
    max_seq_noon: {
        required: false,
        type: Number,
        default: 2,
    },
    base_pay: {
        required: false,
        type: Number,
        default: 40,
    },
    base_pay2: {
        required: false,
        type: Number,
        default: 40.6,
    },
    base_pay3: {
        required: false,
        type: Number,
        default: 46,
    },
    travel: {
        required: false,
        type: Number,
        default: 18,
    },
    extra_travel: {
        required: false,
        type: Number,
        default: 18,
    },
    small_eco: {
        required: false,
        type: Number,
        default: 13.5,
    },
    big_eco: {
        required: false,
        type: Number,
        default: 19.7,
    },
    extra_eco: {
        required: false,
        type: Number,
        default: 33.9,
    },
});
//# sourceMappingURL=settings.model.js.map