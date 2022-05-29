const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const CartItems = sequelize.define("cartItems", {
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    quantity: Sequelize.INTEGER
});
module.exports = CartItems;