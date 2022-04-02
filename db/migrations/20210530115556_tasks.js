export const up = (knex) => {
  return knex.schema.alterTable('tasks', (table) => {
    table.string('product_code').nullable();
  });
};
export const down = () => {};
