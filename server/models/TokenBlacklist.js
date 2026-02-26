const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const TokenBlacklist = sequelize.define(
    "TokenBlacklist",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      token: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      tableName: "token_blacklists",
      timestamps: false,
    },
  );

  return TokenBlacklist;
};
