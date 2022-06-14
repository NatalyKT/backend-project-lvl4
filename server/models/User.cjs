// @ts-check

const objectionUnique = require("objection-unique");
const BaseModel = require("./BaseModel.cjs");
const encrypt = require("../lib/secure.cjs");

const unique = objectionUnique({ fields: ["email"] });

module.exports = class User extends unique(BaseModel) {
  static get tableName() {
    return "users";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["firstName", "lastName", "email", "password"],
      properties: {
        id: { type: "integer" },
        firstName: { type: "string", minLength: 1 },
        lastName: { type: "string", minLength: 1 },
        email: { type: "string", pattern: "^\\S+@\\S+\\.\\S+$" },
        password: { type: "string", minLength: 3 },
      },
    };
  }

  static get relationMappings() {
    return {
      createdTasks: {
        relation: BaseModel.HasManyRelation,
        modelClass: "Task.cjs",
        join: {
          from: "users.id",
          to: "tasks.creatorId",
        },
      },
      assignedTasks: {
        relation: BaseModel.HasManyRelation,
        modelClass: "Task.cjs",
        join: {
          from: "users.id",
          to: "tasks.executorId",
        },
      },
    };
  }

  set password(value) {
    this.passwordDigest = encrypt(value);
  }

  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  verifyPassword(password) {
    return encrypt(password) === this.passwordDigest;
  }
};
