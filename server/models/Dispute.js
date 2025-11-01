const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Dispute = sequelize.define(
    "Dispute",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "orders",
          key: "id",
        },
      },
      raised_by_user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      reason: {
        type: DataTypes.ENUM(
          "not_delivered",
          "wrong_files",
          "quality_issue",
          "other"
        ),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      evidence_urls: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("open", "under_review", "resolved", "closed"),
        defaultValue: "open",
      },
      admin_notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      resolution: {
        type: DataTypes.ENUM(
          "refund_buyer",
          "release_to_seller",
          "partial_refund"
        ),
        allowNull: true,
      },
      resolved_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      resolved_by_admin_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
      },
    },
    {
      tableName: "disputes",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return Dispute;
};
