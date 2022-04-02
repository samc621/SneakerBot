export const seed = (knex) => {
  const sites = [
    { id: 1, name: 'nike' },
    { id: 2, name: 'footsites' },
    { id: 3, name: 'shopify' },
    { id: 4, name: 'demandware' },
    { id: 5, name: 'supremenewyork' }
  ];

  return knex('sites')
    .insert(sites)
    .onConflict('id')
    .ignore()
    .returning('*')
    .then((rows) => rows);
};

export default seed;
