"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("users", "verification_token", {
      type: Sequelize.STRING(255),
      allowNull: true,
      defaultValue: null,
    });
    await queryInterface.addColumn("users", "verification_token_expires", {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null,
    });
    await queryInterface.addColumn("users", "reset_token", {
      type: Sequelize.STRING(255),
      allowNull: true,
      defaultValue: null,
    });
    await queryInterface.addColumn("users", "reset_token_expires", {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("users", "verification_token");
    await queryInterface.removeColumn("users", "verification_token_expires");
    await queryInterface.removeColumn("users", "reset_token");
    await queryInterface.removeColumn("users", "reset_token_expires");
  },
};
