"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateConfirmationCode = void 0;
const generateConfirmationCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase(); // Example: "A1B2C3"
};
exports.generateConfirmationCode = generateConfirmationCode;
