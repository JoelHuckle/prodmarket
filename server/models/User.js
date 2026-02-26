// ========================================
// models/User.js
// ========================================
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password_hash: {
        type: DataTypes.STRING(255),
        allowNull: true, // ✅ Allow null for OAuth users
      },
      username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      display_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      bio: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      avatar_url: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      is_seller: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      is_admin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: "Admin privileges for platform management",
      },
      stripe_account_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      stripe_customer_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      instagram_handle: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      google_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
        comment: "Google OAuth ID",
      },
      verification_token: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      verification_token_expires: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      reset_token: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      reset_token_expires: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "users",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return User;
};
