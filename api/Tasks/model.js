const knex = require("../../config/knex");

class TasksModel {
  constructor(id) {
    this.tableName = "tasks";
    this.id = id;
  }

  async create(data) {
    return knex(this.tableName)
      .insert(Object.assign(data))
      .returning("*")
      .then(rows => rows[0]);
  }

  async find(data) {
    data["isDeleted"] = false;
    return knex(this.tableName).where(data).orderBy("created_at", "desc");
  }

  async findOne(data) {
    data["isDeleted"] = false;
    return knex(this.tableName)
      .select(knex.raw(`tasks.*, sites.name AS "site_name"`))
      .leftJoin("sites", "tasks.site_id", "=", "sites.id")
      .where(data)
      .orderBy("created_at", "desc")
      .first();
  }

  async update(data) {
    return knex(this.tableName)
      .where({ id: this.id })
      .update(data)
      .returning("*")
      .then(rows => rows[0]);
  }

  async hardDelete() {
    return knex(this.tableName).where({ id: this.id }).del();
  }
}

module.exports = TasksModel;
