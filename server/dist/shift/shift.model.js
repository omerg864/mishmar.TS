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
    notes: {
        type: String,
        default: "",
    },
    weeks: [{
            morning: [{
                    type: Boolean,
                    default: false,
                }],
            noon: [{
                    type: Boolean,
                    default: false,
                }],
            night: [{
                    type: Boolean,
                    default: false
                }],
            pull: [{
                    type: Boolean,
                    default: true,
                }],
            reinforcement: [{
                    type: Boolean,
                    default: false,
                }],
            notes: [{
                    type: String,
                    default: "",
                }]
        }]
}, { timestamps: true });
//# sourceMappingURL=shift.model.js.map