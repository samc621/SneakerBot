export const up = (knex) => {
  return knex.schema.createTable('tasks', (table) => {
    table.increments();
    table.integer('site_id').unsigned().notNullable();
    table.foreign('site_id').references('sites.id');
    table.string('url').notNullable();
    table.integer('style_index').notNullable();
    table.decimal('size').notNullable();
    table.integer('shipping_speed_index').notNullable();
    table.integer('billing_address_id').unsigned().notNullable();
    table.foreign('billing_address_id').references('addresses.id');
    table.integer('shipping_address_id').unsigned().notNullable();
    table.foreign('shipping_address_id').references('addresses.id');
    table.string('notification_email_address');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.boolean('is_deleted').defaultTo(false);
  });
};

export const down = (knex) => {
  return knex.schema.dropTable('tasks');
};
