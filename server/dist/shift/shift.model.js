"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShiftScheme = void 0;
const mongoose = require("mongoose");
exports.ShiftScheme = new mongoose.Schema({
    weekend_night: {
        type: Number,
        default: 0,
        min: 0,
        required: false,
    },
    weekend_day: {
        type: Number,
        default: 0,
        min: 0,
        required: false,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    scheduleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Schedule",
        required: true,
    },
    weeks: [{
            type: mongoose.Schema.Types.Map,
            default: new Map(),
            required: false,
        }]
});
//# sourceMappingURL=shift.model.js.map