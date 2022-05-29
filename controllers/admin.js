const Product = require("../models/products");
const { validationResult } = require("express-validator");
const fileHelper = require("../util/file");

exports.getAddProduct = (req, res, next) => {
  
    res.render('admin/editProduct', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      hasError: false,
      errorMessage: null,
      prod: {
        title: "",
        imageUrl: "",
        price: "",
        description: ""
      },
      validationError: []
      
    });
  };
  
  exports.postAddProduct = (req, res, next) => {
    const { title, price, description } = req.body;
    const imageUrl = req.file;
    console.log(imageUrl);
    if(!imageUrl){
      return res.status(422).render('admin/editProduct', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false,
        hasError: true,
        prod: {
          title: title,
          imageUrl: imageUrl,
          price: price,
          description: description
        },
        errorMessage: "The attached file is not an image",
        validationError: []
        
      });
    }

    const error = validationResult(req);
    if(!error.isEmpty()){
      return res.status(422).render('admin/editProduct', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false,
        hasError: true,
        prod: {
          title: title,
          price: price,
          description: description
        },
        errorMessage: error.array()[0].msg,
        validationError: error.array()
        
      });
    }
    const image = imageUrl.path;
   const product = new Product({title: title, imageUrl: image, price: price, description: description, userId: req.user});
   product.save().then(product=>{
     console.log("One document has been added");
    
    res.redirect("/admin/admin-product");
   }).catch(err=>{
     console.log(err);
   });
  };

  exports.getEditAdminProduct = (req, res, next)=>{
   const editMode = req.query.edit;
   if(!editMode){
     return res.redirect("/");
   }
   const prodId = req.params.productId;
   Product.findById(prodId).then(product=>{
    if(!product){
      return res.redirect("/");
    }
   res.render("admin/editProduct", {
     path: "/admin/edit-product",
     pageTitle: "Edit Product",
     editing: editMode,
     prod: product,
     hasError: false,
     validationError: []
     
   })}).catch(err=>{
     console.log(err);
   })
  }
  exports.postEditAdminProduct = (req, res, next)=>{
    const prodId = req.body.productId;
    const {title, price, description } = req.body;
    const imageUrl = req.file;
    const error = validationResult(req);
    if(!error.isEmpty()){
      return res.status(422).render('admin/editProduct', {
        pageTitle: 'Edit Product',
        path: '/admin/add-product',
        editing: true,
        hasError: true,
        product: {
          title: title,
          price: price,
          description: description,
          _id: prodId
        },
        errorMessage: error.array()[0].msg,
        validationError: error.array()
        
      });
    }
    const image = imageUrl.path;
    Product.findById(prodId).then(products=>{
      if(products.userId.toString() !== req.user._id.toString()){
        return res.redirect("/");
      }
      products.title = title;
      if(image){
        fileHelper.deleteFile(products.imageUrl);
        console.log("product deleted");
        products.imageUrl = image;
      }
      products.price = price;
      products.description = description; 
      return products.save()
    }).catch(err=>{
     console.log(err);
   });
  }

  exports.deleteAdminProduct = (req, res, next)=>{
    // const prodId = req.params.productId;
    // Product.findById(prodId).then(product=>{
    //   if(!product){
    //     return next(new Error("Product not found"));
    //   }
    //   fileHelper.deleteFile(product.imageUrl);
    //   return Product.deleteOne({ _id: prodId, userId: req.user._id }).then(result=>{
    //     console.log("the product has been deleted");
    //     res.status(200).json({
    //       message: "Product deleted succesfully"
    //     })
    //   })
    // }).catch(err=>{
    //   res.status(500).json({
    //     message: "Sorry the product cannot be deldeted"
    //   })
    // });
    const prodId = req.params.productId;
    Product.findById(prodId)
      .then(product => {
        if (!product) {
          return next(new Error('Product not found.'));
        }
        fileHelper.deleteFile(product.imageUrl);
        return Product.deleteOne({ _id: prodId, userId: req.user._id });
      })
      .then(() => {
        console.log('DESTROYED PRODUCT');
        res.status(200).json({ message: 'Success!' });
      })
      .catch(err => {
        res.status(500).json({ message: 'Deleting product failed.' });
      });
  }
exports.getAdminProduct = (req, res, next)=>{
     Product.find({ userId: req.user._id })//.select("title name -_id").populate("userId", "name")
     .then(product=>{
      console.log(product);
      res.render('admin/adminProductList', {
        prod: product,
        pageTitle: 'Shop',
        path: '/admin/admin-product',
        isAuthenticated: req.session.isLoggedIn
      })
    }).catch(err=>{
      console.log(err);
    });
}  