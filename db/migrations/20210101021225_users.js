export const up = (knex) => {
    return knex.schema.createTable('users', (table) => {
      table.increments();
      table.string('name').notNullable();
      table.string('email_address').notNullable();
      table.string('username').notNullable();
      table.string('password').notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      table.boolean('is_deleted').defaultTo(false);
    });
  };
  
  export const down = (knex) => {
    return knex.schema.dropTable('users');
  };
  