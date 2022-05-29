const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const productSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
});
module.exports = mongoose.model("Product", productSchema)
// const getDb = require("../util/database").getDb;
// const mongoDb = require("mongodb");
// class Product{
//     constructor(title, price, imageUrl, description, id, userId){
//         this.title = title;
//         this.price = price;
//         this.imageUrl = imageUrl;
//         this.description = description;
//         this._id = id ? new mongoDb.ObjectId(id) : null;
//         this.userId = userId;
//     }
//     save(){
//         let db = getDb();
//         let dbOp;
//         if(this._id){
//             dbOp =  db.collection("products").updateOne({_id: this._id}, { $set: this});
//         }
//         else{
//             dbOp =  db.collection("products").insertOne(this);
//         }
        
//        return dbOp.then(result=>{
//             console.log(result);
//         }).catch(err=>{
//             console.log(err);
//         })
//     }
     
//     static fetchAll(){
//         let db  = getDb();
//         return db.collection("products").find().toArray().then(product=>{
//             console.log(product);
//             return product;
//         }).catch(err=>{
//             console.log(err);
//         });
//     }
//     static findById(prodId){
//         let db = getDb();
//         return db.collection("products").find({ _id: new mongoDb.ObjectId(prodId) }).next().then(product=>{
//             console.log(product);
//             return product;
//         }).catch(err=>{
//             console.log(err);
//         })
//     }
//     static deleteById(prodId){
//         let db = getDb();
//         return db.collection("products").deleteOne({ _id: new mongoDb.ObjectId(prodId) }).then(product=>{
//             console.log("Product deleted");
//             return product;
//         }).catch(err=>{
//             console.log(err);
//         })
//     }
// }
// module.exports = Product;