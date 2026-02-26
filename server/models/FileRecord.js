const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const FileRecord = sequelize.define(
    "FileRecord",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      file_key: {
        type: DataTypes.STRING(500),
        allowNull: false,
        unique: true,
      },
      original_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      mime_type: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      size: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      uploaded_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
      },
      // pending = awaiting scan, clean = passed, flagged = malware detected
      scan_status: {
        type: DataTypes.ENUM("pending", "clean", "flagged"),
        defaultValue: "pending",
      },
      virustotal_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: "VirusTotal analysis ID for polling results",
      },
    },
    {
      tableName: "file_records",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        { fields: ["file_key"] },
        { fields: ["uploaded_by"] },
        { fields: ["scan_status"] },
      ],
    },
  );

  return FileRecord;
};
