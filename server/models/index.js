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
const TokenBlacklist = require("./TokenBlacklist")(sequelize);
const FileRecord = require("./FileRecord")(sequelize);

// Define associations
User.hasMany(Service, { foreignKey: "seller_id", as: "services" });
User.hasMany(Order, { foreignKey: "buyer_id", as: "purchases" });
User.hasMany(Order, { foreignKey: "seller_id", as: "sales" });

Service.belongsTo(User, { foreignKey: "seller_id", as: "seller" });
Service.hasMany(Order, { foreignKey: "service_id" });

Order.belongsTo(User, { foreignKey: "buyer_id", as: "buyer" });
Order.belongsTo(User, { foreignKey: "seller_id", as: "seller" });
Order.belongsTo(Service, { foreignKey: "service_id", as: "service" });
Order.hasOne(Contract, { foreignKey: "order_id", as: "contract" });

Contract.belongsTo(Order, { foreignKey: "order_id", as: "order" });
Contract.belongsTo(User, { foreignKey: "buyer_id", as: "buyer" });
Contract.belongsTo(User, { foreignKey: "seller_id", as: "seller" });

Subscription.belongsTo(User, { foreignKey: "buyer_id", as: "buyer" });
Subscription.belongsTo(User, { foreignKey: "seller_id", as: "seller" });
Subscription.belongsTo(Service, { foreignKey: "service_id", as: "service" });

SubscriptionPack.belongsTo(Service, {
  foreignKey: "service_id",
  as: "service",
});
SubscriptionPack.belongsTo(User, { foreignKey: "seller_id", as: "seller" });

Service.hasMany(Subscription, { foreignKey: "service_id" });
Service.hasMany(SubscriptionPack, { foreignKey: "service_id" });

Download.belongsTo(User, { foreignKey: "user_id", as: "user" });
Download.belongsTo(Order, { foreignKey: "order_id", as: "order" });
Download.belongsTo(SubscriptionPack, {
  foreignKey: "subscription_pack_id",
  as: "pack",
});

User.hasMany(Download, { foreignKey: "user_id" });
Order.hasMany(Download, { foreignKey: "order_id" });
SubscriptionPack.hasMany(Download, { foreignKey: "subscription_pack_id" });

Dispute.belongsTo(Order, { foreignKey: "order_id", as: "order" });
Dispute.belongsTo(User, { foreignKey: "raised_by_user_id", as: "raisedBy" });
Dispute.belongsTo(User, {
  foreignKey: "resolved_by_admin_id",
  as: "resolvedBy",
});

Order.hasMany(Dispute, { foreignKey: "order_id" });
User.hasMany(Dispute, {
  foreignKey: "raised_by_user_id",
  as: "raisedDisputes",
});

Transaction.belongsTo(User, { foreignKey: "buyer_id", as: "buyer" });
Transaction.belongsTo(User, { foreignKey: "seller_id", as: "seller" });
Transaction.belongsTo(Order, { foreignKey: "order_id", as: "order" });

User.hasMany(Transaction, { foreignKey: "buyer_id", as: "buyerTransactions" });
User.hasMany(Transaction, {
  foreignKey: "seller_id",
  as: "sellerTransactions",
});
Order.hasMany(Transaction, { foreignKey: "order_id" });

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
  TokenBlacklist,
  FileRecord,
};
