"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.dropTable("file_records").catch(() => {});
    await queryInterface.createTable("file_records", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      file_key: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      original_name: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      mime_type: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      size: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      uploaded_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      scan_status: {
        type: Sequelize.ENUM("pending", "clean", "flagged"),
        defaultValue: "pending",
      },
      virustotal_id: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.addIndex("file_records", ["file_key"]);
    await queryInterface.addIndex("file_records", ["uploaded_by"]);
    await queryInterface.addIndex("file_records", ["scan_status"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("file_records");
  },
};
