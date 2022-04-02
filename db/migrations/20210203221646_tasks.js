export const up = (knex) => {
  return knex.schema.alterTable('tasks', (table) => {
    table.boolean('auto_solve_captchas').defaultTo(true);
  });
};

export const down = () => {};
