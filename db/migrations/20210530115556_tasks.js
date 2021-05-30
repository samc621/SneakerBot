exports.up = (knex) => knex.schema.alterTable("tasks", (table) => {
    table.string("product_code").nullable();
});

exports.down = () => { };
