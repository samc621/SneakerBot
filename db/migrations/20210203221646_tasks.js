exports.up = (knex) => knex.schema.alterTable("tasks", (table) => {
    table.boolean("auto_solve_captchas").defaultTo(true);
});

exports.down = () => { };
