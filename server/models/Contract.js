const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Contract = sequelize.define(
    "Contract",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: "orders",
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
      collaboration_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      contract_terms: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      buyer_agreed_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      seller_agreed_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      contract_pdf_url: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
    },
    {
      tableName: "contracts",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return Contract;
};
