const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const SubscriptionPack = sequelize.define(
    "SubscriptionPack",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      service_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "services",
          key: "id",
        },
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
        allowNull: true,
      },
      file_urls: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      file_size_mb: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      uploaded_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "subscription_packs",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return SubscriptionPack;
};
