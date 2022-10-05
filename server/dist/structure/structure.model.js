"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StructureScheme = void 0;
const mongoose = require("mongoose");
exports.StructureScheme = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    index: {
        type: Number,
        required: true,
        default: 0,
    },
    description: {
        type: String,
        required: false,
        default: ''
    },
    shift: {
        type: Number,
        required: true,
        default: 0,
    },
    opening: {
        type: Boolean,
        required: true,
        default: false,
    },
    manager: {
        type: Boolean,
        required: true,
        default: false,
    },
    pull: {
        type: Boolean,
        required: true,
        default: false,
    }
});
//# sourceMappingURL=structure.model.js.map