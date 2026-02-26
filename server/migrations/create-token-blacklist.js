"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("token_blacklists", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      token: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    try {
      await queryInterface.addIndex("token_blacklists", ["expires_at"]);
    } catch (err) {
      if (err.original?.code !== "ER_DUP_KEYNAME") throw err;
    }
  },

  async down(queryInterface) {
    await queryInterface.dropTable("token_blacklists");
  },
};
