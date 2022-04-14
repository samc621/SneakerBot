import knex from '../../db/index.js';

class AddressesModel {
  constructor(id) {
    this.tableName = 'addresses';
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
      .where({ is_deleted: false, ...data })
      .orderBy('created_at', 'desc');
  }

  async findOne(data) {
    return knex(this.tableName)
      .where({ is_deleted: false, ...data })
      .orderBy('created_at', 'desc')
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

export default AddressesModel;
