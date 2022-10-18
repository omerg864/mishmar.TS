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
    weeks: [[
            {
                shift: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Structure",
                    required: true
                },
                days: [
                    {
                        type: String,
                        default: ""
                    }
                ]
            },
        ]],
    publish: {
        type: Boolean,
        default: false,
        required: true
    },
});
//# sourceMappingURL=schedule.model.js.map