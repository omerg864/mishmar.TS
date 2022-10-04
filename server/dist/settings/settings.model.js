"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsScheme = void 0;
const mongoose = require("mongoose");
exports.SettingsScheme = new mongoose.Schema({
    submit: {
        required: true,
        type: Boolean,
        default: false,
    },
    officer: {
        required: false,
        type: String,
        default: "",
    },
    title: {
        required: false,
        type: String,
        default: "",
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
    }
});
//# sourceMappingURL=settings.model.js.map