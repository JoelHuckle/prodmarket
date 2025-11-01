require("dotenv").config();
const { Sequelize } = require("sequelize");
const config = require("../config/database");

const env = process.env.NODE_ENV || "development";
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port || 3306,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging || false,
  }
);

// Import all models
const User = require("./User")(sequelize);
const Service = require("./Service")(sequelize);
const Order = require("./Order")(sequelize);
const Contract = require("./Contract")(sequelize);
const Subscription = require("./Subscription")(sequelize);
const SubscriptionPack = require("./SubscriptionPack")(sequelize);
const Download = require("./Download")(sequelize);
const Transaction = require("./Transaction")(sequelize);
const Dispute = require("./Dispute")(sequelize);

// Define associations
User.hasMany(Service, { foreignKey: "seller_id", as: "services" });
User.hasMany(Order, { foreignKey: "buyer_id", as: "purchases" });
User.hasMany(Order, { foreignKey: "seller_id", as: "sales" });

Service.belongsTo(User, { foreignKey: "seller_id", as: "seller" });
Service.hasMany(Order, { foreignKey: "service_id" });

Order.belongsTo(User, { foreignKey: "buyer_id", as: "buyer" });
Order.belongsTo(User, { foreignKey: "seller_id", as: "seller" });
Order.belongsTo(Service, { foreignKey: "service_id", as: "service" });

module.exports = {
  sequelize,
  User,
  Service,
  Order,
  Contract,
  Subscription,
  SubscriptionPack,
  Download,
  Transaction,
  Dispute,
};
