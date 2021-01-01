exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex("sites")
    .del()
    .then(function () {
      // Inserts seed entries
      return knex("sites").insert([
        { id: 1, name: "nike" },
        { id: 2, name: "footsites" }
      ]);
    });
};
