const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Transaction = sequelize.define(
    "Transaction",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      order_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "orders",
          key: "id",
        },
      },
      subscription_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "subscriptions",
          key: "id",
        },
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
      type: {
        type: DataTypes.ENUM(
          "purchase",
          "subscription_payment",
          "refund",
          "payout",
        ),
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      platform_fee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      stripe_payment_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      stripe_transfer_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("pending", "completed", "failed", "refunded"),
        defaultValue: "pending",
      },
    },
    {
      tableName: "transactions",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        { fields: ["order_id"] },
        { fields: ["buyer_id"] },
        { fields: ["seller_id"] },
        { fields: ["stripe_payment_id"] },
        { fields: ["type"] },
        { fields: ["status"] },
        { fields: ["created_at"] },
      ],
    },
  );

  return Transaction;
};
