"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCodename = void 0;
const faker_1 = require("@faker-js/faker");
const generateCodename = () => {
    const adjective = faker_1.faker.word.adjective();
    const noun = faker_1.faker.animal.type(); // Generates random animals like Falcon, Wolf, Tiger
    return `The ${adjective.charAt(0).toUpperCase() + adjective.slice(1)} ${noun.charAt(0).toUpperCase() + noun.slice(1)}`;
};
exports.generateCodename = generateCodename;
