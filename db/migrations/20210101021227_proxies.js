export const up = (knex) => {
  return knex.schema.createTable('proxies', (table) => {
    table.increments();
    table.string('ip_address').notNullable();
    table.integer('port');
    table.string('protocol').notNullable();
    table.string('username');
    table.string('password');
    table.boolean('has_been_used').defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.boolean('is_deleted').defaultTo(false);
  });
};

export const down = (knex) => {
  return knex.schema.dropTable('proxies');
};
