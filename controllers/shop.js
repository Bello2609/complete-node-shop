const PDFDocument = require("pdfkit");
const dotenv = require("dotenv");
dotenv.config();
const Product = require("../models/products");
const User = require("../models/user");
const Order = require("../models/order");
const path = require("path");
const fs = require("fs");
const products = require("../models/products");
const stripe = require('stripe')(process.env.stripe_key);
const ITEMS_PER_PAGE = 2;
let totalItems;


exports.getProduct = (req, res, next) => {
  const page = +req.query.page || 1;
  Product.find()
  .countDocuments()
  .then(numProduct=>{
    totalItems = numProduct;
    return  Product.find()
    .skip((page - 1) * ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE)
  }).then(products=>{
    
    res.render('shop/index', {
      prod: products,
      pageTitle: 'Shop',
      path: '/',
      currentPage: page,
      totalProduct: totalItems,
      hasNextPage: ITEMS_PER_PAGE * page < totalItems,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
      
    });
  }).catch(err=>{
    console.log(err);
  });
};
exports.getEachProduct = (req, res, next)=>{
  const prodId = req.params.productId;
 Product.findById(prodId).then(product=>{
   
  res.render("shop/product-details",{
    prod: product,
    pageTitle: "Product Details",
    path: "/product-list",
    isAuthenticated: req.session.isLoggedIn
  });
 }).catch(err=>{
   console.log(err);
 });
}
exports.getProductList = (req, res, next)=>{
  const page = +req.query.page || 1;
  Product.find()
  .countDocuments()
  .then(numProduct=>{
    totalItems = numProduct;
    return  Product.find()
    .skip((page - 1) * ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE)
  }).then(products=>{
    
    res.render('shop/product-list', {
      prod: products,
      pageTitle: 'Shop',
      path: '/',
      currentPage: page,
      totalProduct: totalItems,
      hasNextPage: ITEMS_PER_PAGE * page < totalItems,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
      
    });
  }).catch(err=>{
    console.log(err);
  });
}
exports.getCart = (req, res, next)=>{
  req.user.populate("cart.items.productId").execPopulate().then(user=>{
    const product = user.cart.items;
      res.render("shop/cart",{
               path: "/cart",
               pageTitle: "Cart",
               prod: product,
               isAuthenticated: req.session.isLoggedIn
            })
   
  }).catch(err=>{
    console.log(err);
  });
}
exports.postCart = (req, res, next)=>{
  const cartId = req.body.productId;
  Product.findById(cartId).then(product=>{
    console.log("product added to cart");
    return req.user.addToCart(product);
  }).then(result=>{
    res.redirect("/cart");
  }).catch(err=>{
    console.log(err);
  })  
}
exports.deleteCartProduct = (req, res, next)=>{
  const prodId = req.body.productId;
  req.user.deleteCart(prodId).then(cart=>{
    console.log("cart has been updated");
    res.redirect("/cart")
  }).catch(err=>{
    console.log(err);
  });
}
exports.getOrder = (req, res, next)=>{
  Order.find({"user.userId": req.user._id }).then(order=>{
    console.log(order);
    res.render("shop/orders",{
      path: "/order",
      pageTitle: "My Order",
      orders: order,
      isAuthenticated: req.session.isLoggedIn
    })
  }).catch(err=>{
    console.log(err);
  });
}
exports.getCheckout = (req, res, next)=>{
  req.user.populate("cart.items.productId").execPopulate().then(user=>{
    console.log(user.cart.items);
    const product = user.cart.items;
    let total = 0;
    product.forEach(p=>{
      total += p.quantity * p.productId.price
    });
      res.render("shop/checkout",{
               path: "/checkout",
               pageTitle: "Checkout",
               prod: product,
               totalSum: total
            })
   
  }).catch(err=>{
    console.log(err);
  });
}
exports.sendError = (req, res, next)=>{
  res.status(404).render("404", 
  {
    pageTitle: "page not found",
    isAuthenticated: req.session.isLoggedIn
  }
  );
};
exports.postOrder = (req, res, next)=>{
  let totalSum = 0;
  req.user.populate("cart.items.productId").execPopulate().then(user=>{
    user.cart.items.forEach(p => {
      totalSum += p.quantity * p.productId.price
    });
    console.log(user.cart.items);
    const product = user.cart.items.map(i=>{
      return {
        quantity: i.quantity,
        product: { ...i.productId._doc }
      }
    })
    
    const order = new Order({
      user: {
        email: req.user.email,
        userId: req.user
      },
      products: product
    });
    
    return order.save();
  }).then(order=>{
    console.log(order);
    // This is your test secret API key.
    let title = order.products.forEach(p=>{
      p.product.title
    })
    console.log(title);
    
    const session = stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: title
            },
            unit_amount: totalSum * 100,
          },
          quantity: order.quantity,
          metadata: {
            order_id: order._id.toString()
          }
        },
      ],
      mode: 'payment',
      success_url: 'https://example.com/success',
    cancel_url: 'https://example.com/cancel',
    });
    return  req.user.clearCart();
    
  }).then(result=>{
    res.redirect("/order");
  }).catch(err=>{
    console.log(err);
  });
 
}
exports.getInvoice = (req, res, next)=>{
  const orderId = req.params.orderId;
  User.findById(orderId).then(order=>{
    if(!order){
      return new Error("no order is found");
    }
    if(order.user.userId.toString() !== req.user._id.toString()){
      return new Error("Unauthorised"); 
    }
    const invoiceName = "invoice-" + orderId + ".pdf";
    const invoicePath = path.join("data", "invoices", invoiceName);
    const PDFDoc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename"' + invoiceName + '"');
    PDFDoc.pipe(fs.createWriteStream(invoicePath));
    PDFDoc.pipe(res);
    PDFDoc.text("Hello world this is just a pratice", {
      underline: true
    });
    PDFDoc.text("__________________");
    let totalPrice = 0;
    order.products.forEach(prod=>{
      totalPrice += prod.quantity * prod.product.price
      PDFDoc.text(prod.product.title + 
        "-" + 
        prod.product.quantity 
        + "x" + "$" 
        + 
        prod.price)
    })
    PDFDoc.text("Total Price: " + totalPrice);
    PDFDoc.end();
    
  }).catch(err=>{
    console.log(err);
  });
}
