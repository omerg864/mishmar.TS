"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sanitizeMiddleware = (req, res, next) => {
    const body = req.body;
    for (const key in body) {
        if (Object.hasOwnProperty.call(body, key)) {
            const value = sanitizeValue(key, body[key]);
            body[key] = value;
        }
    }
    const params = req.params;
    for (const key in params) {
        if (Object.hasOwnProperty.call(params, key)) {
            const value = sanitizeValue(key, params[key]);
            params[key] = value;
        }
    }
    const query = req.query;
    for (const key in query) {
        if (Object.hasOwnProperty.call(query, key)) {
            const value = sanitizeValue(key, query[key]);
            query[key] = value;
        }
    }
    next();
};
const sanitizeValue = (key, value) => {
    if (typeof value !== 'string' || key === 'email') {
        return value;
    }
    value = value.replace(/\$/g, '');
    return value;
};
exports.default = sanitizeMiddleware;
//# sourceMappingURL=sanitize.middleware.js.map