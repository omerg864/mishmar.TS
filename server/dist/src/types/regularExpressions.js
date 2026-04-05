"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.password_regex = exports.email_regex = void 0;
exports.email_regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{1,})+$/;
exports.password_regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,24}$/;
//# sourceMappingURL=regularExpressions.js.map