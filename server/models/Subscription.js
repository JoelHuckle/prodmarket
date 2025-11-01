const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Subscription = sequelize.define(
    "Subscription",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      buyer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
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
      service_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "services",
          key: "id",
        },
      },
      stripe_subscription_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      status: {
        type: DataTypes.ENUM("active", "cancelled", "past_due", "paused"),
        defaultValue: "active",
      },
      current_period_start: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      current_period_end: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      cancelled_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "subscriptions",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return Subscription;
};
