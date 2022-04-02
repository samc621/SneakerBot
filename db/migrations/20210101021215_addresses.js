export const up = (knex) => {
  return knex.schema.createTable('addresses', (table) => {
    table.increments();
    table
      .enu('type', ['billing', 'shipping'], {
        useNative: true,
        enumName: 'address_types'
      })
      .notNullable();
    table.string('first_name').notNullable();
    table.string('last_name').notNullable();
    table.string('address_line_1').notNullable();
    table.string('address_line_2').notNullable();
    table.string('city').notNullable();
    table.string('state').notNullable();
    table.string('postal_code').notNullable();
    table.string('country').notNullable();
    table.string('email_address').notNullable();
    table.string('phone_number').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.boolean('is_deleted').defaultTo(false);
  });
};

export const down = (knex) => {
  return knex.schema.dropTable('addresses').then(() => {
    return knex.raw('DROP TYPE address_types');
  })
};
