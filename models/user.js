const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    resetToken: String,
    resetTokenExpiration: Date,
    cart: {
        items: [{
            productId: {
                type: Schema.Types.ObjectId,
                ref: "Product",
                required: true
            },
            quantity: {
                type: Number,
                required: true
            }
        }],
    }
});

userSchema.methods.addToCart = function(product){
    const cartProductIndex = this.cart.items.findIndex(cp=>{
                    return cp.productId.toString() === product._id.toString();
                })
                let newQuantity = 1;
                let cartItems = [...this.cart.items];
                if(cartProductIndex >=0 ){
                    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
                    cartItems[cartProductIndex].quantity = newQuantity
                }else{
                    cartItems.push({
                        productId: product._id,
                        quantity: newQuantity
                    })
                }
                const updatedCart = {
                    items: cartItems
                }
                this.cart = updatedCart;
               return  this.save();

}
userSchema.methods.deleteCart = function(cartId){
    const updatedCart = this.cart.items.filter(cartProd=>{
    return cartProd.productId.toString() !== cartId.toString();
        });
        this.cart.items = updatedCart;
        return this.save();

}
userSchema.methods.clearCart = function(){
    this.cart = { items: [] };
    return this.save();
}
module.exports = mongoose.model("User", userSchema);

// const getDb  = require("../util/database").getDb;
// const mongoDb = require("mongoDb"); 
// class User{
//     constructor(name, mail, cart, id){
//         this.name = name;
//et        this.mail = mail;
//         this.cart = cart;
//         this._id = id;
//     }
//     save(){
//         let db = getDb();
//         return db.collection("users").insertOne(this).then(user=>{
//             console.log("product add to cart");
//             return user;
//         }).cstch(err=>{
//             console.log(err);
//         });
//     }
//     addToOrder(){
//         let db = getDb();
//         return this.getCart().then(product=>{
//             let orders = {
//                 items: product,
//                 user: {
//                     _id: new mongoDb.ObjectId(this._id),
//                     name: this.name
//                 }
//             }
//             return db.collection("orders").insertOne(orders);
//         })
//         .then(order=>{
//             this.cart = { items: [] }; 
//             return db.collection("users").updateOne({_id: new mongoDb.ObjectId(this._id)}, {$set: {items: []}})
//         })
//     }
//     getAllOrders(){
//         let db = getDb();
//         return db.collection("orders").find({"user._id": new mongoDb.ObjectId(this._id)}).toArray().then(order=>{
//             console.log(order);
//         }).catch(err=>{
//             console.log(err);
//         })
//     }
//     addToCart(product){
//         const cartProductIndex = this.cart.items.findIndex(cp=>{
//             return cp.productId.toString() === product._id.toString();
//         })
//         let newQuantity = 1;
//         let cartItems = [...this.cart.items];
//         if(cartProductIndex >=0 ){
//             newQuantity = this.cart.items[cartProductIndex].quantity + 1;
//             cartItems[cartProductIndex].quantity = newQuantity
//         }else{
//             cartItems.push({
//                 productId: new mongoDb.ObjectId(product._id),
//                 quantity: newQuantity
//             })
//         }
//         const updatedCart = {
//             items: cartItems
//         }
//         // let updatedCart = {items: [{productId: new mongoDb.ObjectId(product._id), quantity: 1}]};
//         let db = getDb();
//         // let updatedCart = {items: [{productId: new mongoDb.ObjectId(product.id), quantity: newQuantity}]};
//         return db.collection("users").updateOne({ _id: new mongoDb.ObjectId(this._id) }, { $set: {cart: updatedCart} });
//     }
//     getCart(){
//         const productId = this.cart.items.map(i=>{
//             return i.productId;
//         })
//         let db = getDb();
//         return db.collection("products").find({ _id: { $in: productId } }).toArray().then(product=>{
//             return product.map(p=>{
//                 return {
//                     ...p,
//                     quantity: this.cart.items.find(i=>{
//                         return i.productId.toString() === p._id.toString();
//                     }).quantity
//                 }
//             })
//         })
//     }
//     deleteCart(cartId){
//         const updatedCart = this.cart.items.filter(cartProd=>{
//             return cartProd.productId.toString() !== cartId.toString();
//         });

//         let db = getDb();
//         return db.collection("users").updateOne({_id: new mongoDb.ObjectId(this._id)}, {$set: {cart: {items: updatedCart}}});
//     }
//     static findById(prodId){
//          let db = getDb();
//          return db.collection("users").find({ _id: new mongoDb.ObjectId(prodId) }).next().then(user=>{
//              console.log(user);
//              return user;
//          }).catch(err=>{
//              console.log(err);
//          });
//     }
// }

// module.exports = User;