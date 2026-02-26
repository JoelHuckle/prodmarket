// migrations/add-is-admin-to-users.js
"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const columns = await queryInterface.describeTable("users");
    if (!columns.is_admin) {
      await queryInterface.addColumn("users", "is_admin", {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        comment: "Admin privileges for platform management",
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("users", "is_admin");
  },
};
