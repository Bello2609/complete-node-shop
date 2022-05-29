const User = require("../models/user");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const MailMessage = require("nodemailer/lib/mailer/mail-message");
const crypto = require("crypto");
const { validationResult } = require("express-validator");
const dotenv = require("dotenv");
dotenv.config();

const transporter = nodemailer.createTransport(sendgridTransport({
  auth: {
    api_key: process.env.twillo_api_key
  }
}))

exports.getLogin = (req, res, next)=>{
  let message = req.flash("error");
  if(message.length > 0){
    message = message[0]
  }
  else{
    message = null;
  }
    res.render("auth/login", {
      pageTitle: "Kindly sign in",
      path: "/login",
      errorMessage: message,
      oldInput: {
        email: "",
        password: ""
      },
      validationErrors: []
      
    })
  }
  
exports.postLogin = (req, res, next)=>{
  const { email, password } = req.body;
  const error = validationResult(req);
  if(!error.isEmpty()){
    return res.status(422).render("auth/login", {
      pageTitle: "Kindly sign in",
      path: "/login",
      errorMessage: error.array()[0].msg,
      oldInput: {
        email: email,
        password: password
      },
      validationErrors: error.array()
    })
  }
   User.findOne({email: email}).then(user=>{
      if(!user){
        return res.status(422).render("auth/login", {
          pageTitle: "Kindly sign in",
          path: "/login",
          errorMessage: "Invalid email or password",
          oldInput: {
            email: email,
            password: password
          },
          validationErrors: []
        });
      }
      bcrypt.compare(password, user.password).then(doMatch => {
        if(doMatch){
          req.session.user = user;
          req.session.isLoggedIn = true;
          return req.session.save(err=>{
            console.log(err);
            res.redirect("/");
          });
        }
        return res.status(422).render("auth/login", {
          pageTitle: "Kindly sign in",
          path: "/login",
          errorMessage: "Your passsword is incorrect",
          oldInput: {
            email: email,
            password: password
          },
          validationErrors: []
        })
      }).catch(err=>{
          console.log(err);
          res.redirect("/login");
      });

}).catch(err=>{
    console.log(err);
});
}
exports.postLogout = (req, res, next)=>{
  req.session.destroy(err=>{
    console.log(err);
    res.redirect("/");
  })
}

exports.getSignup = (req, res, next)=>{
  let message = req.flash("error");
  if(message.length > 0){
    message = message[0]
  }
  else{
    message = null;
  }
  res.render("auth/signup", {
    pageTitle: "Sign up",
    path: "/signup",
    errorMessage: message,
    oldInput: {
      email: "",
      password: "",
      confirm: ""
    },
    validationErrors: []
  })
}

exports.postSignup = (req, res, next)=>{
  const { email, password, confirmPassword } = req.body;
  const error = validationResult(req);
  if(!error.isEmpty()){
    console.log(error.array());
    return res.status(422).render("auth/signup", {
      pageTitle: "Sign Out",
      path: "/signup",
      errorMessage: error.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
        confirm: confirmPassword
      },
      validationErrors: error.array()
    })
  }
  bcrypt.hash(password, 12).
    then(hashPassword=>{
      const user = new User({
        email: email,
        password: hashPassword,
        cart: { items:[] }
      });
      return user.save();
    }).then(results=>{
      res.redirect("/login");
      return transporter.sendMail({
        to: email,
        from: "bellohadi82@gmail.com",
        subject: "You have scuccesfully created your account",
        html: "<h4>welcome you have created new account</h4>"
      })
      .catch(err=>{
        console.log(err);
      })
    });
}

exports.getReset = (req, res, next)=>{
  let message = req.flash("error");
  if(message.length > 0){
    message = message[0]
  }
  else{
    message = null;
  }
  res.render("auth/reset", {
    pageTitle: "reset your password",
    path: "/reset password",
    errorMessage: message
  });
}
exports.postReset = (req, res, next)=>{
    crypto.randomBytes(12, (err, buffer)=>{
      if(err){
        console.log(err);
        return res.redirect("/reset");
      }
      const token = buffer.toString("hex");
      User.findOne({email: req.body.email}).then(user=>{
        if(!user){
          req.flash("error", "your email is not registered with this account");
          return res.redirect("/reset");
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      }).then(tok=>{
        res.redirect("/");
        transporter.sendMail({
          to: req.body.email,
          from: "bellohadi82@gmail.com",
          subject: "Password Reset",
          html: `
                <p>You requested for password reset</p>
                <p>click on this <a href="http://localhost:4400/reset/${token}">link</a> to reset your password and it will expre after one day</p>
          `
        })
      }).catch(err=>{
        console.log(err);
      })
    })
}
exports.getNewPassword = (req, res, next)=>{
  const token = req.params.token;
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } }).then(user=>{
    let message = req.flash("error");
    if(message.length > 0){
      message = message[0]
    }
    else{
      message = null;
    }
    res.render("auth/new-password", {
      pageTitle: "New Password",
      path: "/new password",
      errorMessage: message,
      userId: user._id.toString(),
      resetToken: token
    });
  }).catch(err=>{
    console.log(err);
  });
}
exports.postNewPassword = (req, res, next)=>{
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const token = req.body.resetToken;
  let resetUser;
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() }, _id: userId
 }).then(user=>{
    resetUser = user;
    return bcrypt.hash(newPassword, 12);
 }).then(hashPassword=>{
   resetUser.password = hashPassword;
   resetUser.resetToken = undefined;
   resetUser.resetTokenExpiration = undefined;
   return resetUser.save();
 }).then(result=>{
   res.redirect("/login");
 }).catch(err=>{
   console.log(err);
 })
}