"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostScheme = void 0;
const mongoose = require("mongoose");
exports.PostScheme = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    }
});
//# sourceMappingURL=post.model.js.map