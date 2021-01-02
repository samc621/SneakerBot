const knex = require("../../config/knex");

class ProxiesModel {
  constructor(id) {
    this.tableName = "proxies";
    this.id = id;
  }

  async create(data) {
    return knex(this.tableName)
      .insert(Object.assign(data))
      .returning("*")
      .then(rows => rows[0]);
  }

  async find(data) {
    data["is_deleted"] = false;
    return knex(this.tableName).where(data).orderBy("created_at", "desc");
  }

  async findOne(data) {
    data["is_deleted"] = false;
    return knex(this.tableName)
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

module.exports = ProxiesModel;
