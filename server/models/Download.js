const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Download = sequelize.define(
    "Download",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      order_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "orders",
          key: "id",
        },
      },
      subscription_pack_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "subscription_packs",
          key: "id",
        },
      },
      file_url: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      ip_address: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
    },
    {
      tableName: "downloads",
      timestamps: true,
      createdAt: "downloaded_at",
      updatedAt: false,
    }
  );

  return Download;
};
