export const up = (knex) => {
  return knex.schema.alterTable('tasks', (table) => {
    table.integer('style_index').nullable().alter();
    table.string('size').nullable().alter();
    table.integer('shipping_speed_index').nullable().alter();
  });
};

export const down = () => {};
