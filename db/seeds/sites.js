exports.seed = (knex) => {
  const sites = [
    { id: 1, name: 'nike' },
    { id: 2, name: 'footsites' },
    { id: 3, name: 'shopify' }
  ];

  return knex('sites')
    .then((rows) => {
      sites.forEach((site) => {
        if (!rows.map((row) => row.name).includes(site.name)) {
          return knex('sites').insert(site);
        }
        return null;
      });
    });
};
