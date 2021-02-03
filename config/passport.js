const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const db = require("../models");

// Telling passport we want to use a Local Strategy. In other words, we want login with a username/email and password
passport.use(
  new LocalStrategy(
    // Our user will sign in using an email, rather than a "username"
    {
      usernameField: "email"
    },
    (email, password, done) => {
      // When a user tries to sign in this code runs
      db.SalesPerson.findOne({
        where: {
          email: email
        }
      }).then(dbSalesPerson => {
        // If there's no SalesPerson with the given email
        if (!dbSalesPerson) {
          return done(null, false, {
            message: "Incorrect email."
          });
        }
        // If there is a SalesPerson with the given email, but the password the user gives us is incorrect
        else if (!dbSalesPerson.validPassword(password)) {
          return done(null, false, {
            message: "Incorrect password."
          });
        }
        // If none of the above, return the dbSalesPerson
        return done(null, dbSalesPerson);
      });
    }
  )
);

// In order to help keep authentication state across HTTP requests,
// Sequelize needs to serialize and deserialize the user
// Just consider this part boilerplate needed to make it all work
passport.serializeUser((salesPerson, cb) => {
  cb(null, salesPerson);
});

passport.deserializeUser((obj, cb) => {
  cb(null, obj);
});

// Exporting our configured passport
module.exports = passport;
