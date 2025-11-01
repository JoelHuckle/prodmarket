const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Order = sequelize.define(
    "Order",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      order_number: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
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
      status: {
        type: DataTypes.ENUM(
          "pending",
          "awaiting_upload",
          "in_progress",
          "awaiting_delivery",
          "delivered",
          "completed",
          "cancelled",
          "refunded",
          "disputed"
        ),
        defaultValue: "pending",
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      platform_fee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      seller_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      stripe_payment_intent_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      stripe_transfer_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      escrow_status: {
        type: DataTypes.ENUM("held", "released", "refunded"),
        allowNull: true,
      },
      buyer_files: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      seller_files: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      delivery_deadline: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      completed_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      cancelled_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "orders",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return Order;
};
