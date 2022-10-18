"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsScheme = void 0;
const mongoose = require("mongoose");
exports.SettingsScheme = new mongoose.Schema({
    submit: {
        type: Boolean,
        default: false,
    },
    officer: {
        required: false,
        type: String,
        default: "",
    },
    pin_code: {
        required: false,
        type: String,
        default: "1234",
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