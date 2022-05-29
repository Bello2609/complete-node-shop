const express = require("express");
const bodyParser = require("body-parser");
const path  = require("path");
const session = require("express-session");
const error = require("./controllers/shop");
const MongoDBStore = require("connect-mongodb-session")(session);
const app = express();
const csrf = require("csurf");
const flash  = require("connect-flash");
const multer = require("multer");
const shopController = require("./controllers/shop");
const routeProtect = require("./routeProtect/routeProtect");
const dotenv = require("dotenv");
dotenv.config();

const MONGODB_URI = process.env.monodb_key

const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: "session"
});
//this will filter the image being uploaded
const fileFilter= (req, file, cb)=>{
    if(file.mimetype === "image/png" || file.mimetype === "image/jpg" || file.mimetype === "image/jpeg"){
        cb(null, true);
    }else{
        cb(null, false);
    }
}
//this will specifie where to store and the destination of the image
const fileStrorage = multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null, "imageUrl");
    },
    filename: (req, file, cb)=>{
        cb(null, new Date().toISOString() + "-" + file.originalname);
    }
})
app.use(bodyParser.urlencoded({extended: false}));
// mongoose
const mongoose = require("mongoose");
//routes
const adminRoutes = require("./routes/admin");
const shopRouter = require("./routes/shop");
const authRouter = require("./routes/auth");
//model
const User = require("./models/user");


// csrf token
const csurfProtection = csrf();
//session
app.use(session({
    secret: "my secret is very brutal and very stupid",
    resave: false,
    saveUninitialized: false,
    store: store
}));

app.use(multer({ storage: fileStrorage , fileFilter: fileFilter}).single("imageUrl"));

app.use(flash());

app.use((req, res, next)=>{
    if(!req.session.user){
        return next();
    }
    User.findById(req.session.user._id).then(user => {
        if(!user){
            return next();
        }
        req.user = user
        next();
    }).catch(err=>{
        throw new Error(err);
    });
});

app.use((req, res, next)=>{
    res.locals.isAuthenticated = req.session.isLoggedIn;
    
    next();
})
app.set("view engine", "ejs");
app.set("views", "views");
app.use(express.static(path.join(__dirname, "public")));
app.use("/imageUrl", express.static(path.join(__dirname, "imageUrl")));

app.post("/create-order", routeProtect, shopController.postOrder);

app.use(csurfProtection);

app.use((req, res, next)=>{
    res.locals.csrf = req.csrfToken();
    next();
});

//the routing for other pags
app.use(authRouter);
app.use(shopRouter);
app.use("/admin", adminRoutes);

app.use(error.sendError);
mongoose.connect(MONGODB_URI, { useUnifiedTopology: true, useNewUrlParser: true })
.then(res=>{
    console.log(res);
    app.listen(4400, ()=>{
        console.log("the server is now running at port 4400");
    });
}).catch(err=>{
    console.log(err);
})