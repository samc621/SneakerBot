import knex from '../../db/index.js';

class TasksModel {
  constructor(id) {
    this.tableName = 'tasks';
    this.id = id;
  }

  async create(data) {
    return knex(this.tableName)
      .insert(Object.assign(data))
      .returning('*')
      .then((rows) => rows[0]);
  }

  async find(data) {
    return knex(this.tableName)
      .select(knex.raw(`tasks.*, sites.name AS "site_name"`))
      .leftJoin('sites', 'tasks.site_id', '=', 'sites.id')
      .whereRaw(knex.raw('tasks.is_deleted = false'))
      .where(data)
      .orderBy('tasks.created_at', 'desc');
  }

  async findOne(data) {
    return knex(this.tableName)
      .select(knex.raw(`tasks.*, sites.name AS "site_name"`))
      .leftJoin('sites', 'tasks.site_id', '=', 'sites.id')
      .whereRaw(knex.raw('tasks.is_deleted = false'))
      .where(data)
      .orderBy('tasks.created_at', 'desc')
      .first();
  }

  async update(data) {
    return knex(this.tableName)
      .where({ id: this.id })
      .update(data)
      .returning('*')
      .then((rows) => rows[0]);
  }

  async hardDelete() {
    return knex(this.tableName).where({ id: this.id }).del();
  }
}

export default TasksModel;
