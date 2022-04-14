export const up = (knex) => {
  knex.raw(`ALTER TABLE tasks ALTER COLUMN size TYPE varchar (255);`);
};

export const down = () => {};
