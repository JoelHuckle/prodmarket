const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Service = sequelize.define(
    "Service",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      seller_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      title: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM(
          "collaboration",
          "subscription",
          "loop_pack",
          "drum_kit",
          "preset_kit"
        ),
        allowNull: false,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      delivery_time_days: {
        type: DataTypes.INTEGER,
        defaultValue: 14,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      file_urls: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      file_size_mb: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      preview_url: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      tags: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      total_sales: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      tableName: "services",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return Service;
};
