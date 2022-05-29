const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const OrderItems = sequelize.define("orderItems", {
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    quantity: Sequelize.INTEGER
});
module.exports = OrderItems;