"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleScheme = void 0;
const mongoose = require("mongoose");
exports.ScheduleScheme = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    num_weeks: {
        type: Number,
        required: true,
        default: 2
    },
    weeks: [{
            type: mongoose.Schema.Types.Map,
            required: true,
            default: new Map()
        }],
    publish: {
        type: Boolean,
        default: false,
        required: true
    }
});
//# sourceMappingURL=schedule.model.js.map