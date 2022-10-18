"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventScheme = void 0;
const mongoose = require("mongoose");
exports.EventScheme = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    users: [
        {
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: true
        }
    ]
});
//# sourceMappingURL=event.model.js.map