// Dependencies ==============================================================
const express = require("express");

const router = express.Router();

const isAuthenticated = require("../config/middleware/isAuthenticated");

const db = require("../models");

const passport = require("../config/passport");

// Passport Authentication Routes ============================================
// Get requests------------------------------
router.get("/", (req, res) => {
  if (req.user) {
    res.redirect("/members");
  }
  res.render("signup");
});

router.get("/login", (req, res) => {
  if (req.user) {
    res.redirect("/members");
  }
  res.render("login");
});

router.get("/members", isAuthenticated, (req, res) => {
  const currentUser = req.user;
  db.User.findOne({
    where: {
      id: currentUser.id
    },
    include: [db.Client]
  }).then(user => {
    res.render("members", user);
  });
});

// Post Ruequests----------------------------
router.post("/api/login", passport.authenticate("local"), (req, res) => {
  res.json(req.user);
});

router.post("/api/signup", (req, res) => {
  db.User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password
  })
    .then(() => {
      res.redirect(307, "/api/login");
    })
    .catch(err => {
      res.status(401).json(err);
    });
});

// Geting/Posting/Updating Client information ===================================
// Get requests------------------------------
router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

router.get("/api/user_data", (req, res) => {
  if (!req.user) {
    res.json({});
  } else {
    res.json({
      name: req.user.name,
      email: req.user.email,
      id: req.user.id
    });
  }
});

// Post Put Delete Ruequests------------------
router.post("/api/client", (req, res) => {
  db.Client.create({
    UserId: req.user.id,
    name: req.body.name,
    email: req.body.email,
    phoneNumber: req.body.phoneNumber,
    make: req.body.make,
    model: req.body.model,
    color: req.body.color,
    quote: req.body.quote,
    followUp: req.body.followUp,
    note: req.body.note
  })
    .then(req.user, res.redirect("/members"))
    .catch(err => {
      res.status(401).json(err);
    });
});

router.get("/api/client/:id", (req, res) => {
  db.Client.findOne({
    where: {
      id: req.params.id
    }
  }).then(dbClient => {
    res.json(dbClient);
  });
});

router.put("/api/client", (req, res) => {
  db.Client.update(req.body, {
    where: {
      id: req.body.id
    }
  })
    .then(dbClient => {
      res.json(dbClient);
    })
    .catch(err => {
      res.status(401).json(err);
    });
});

router.delete("/api/client/:id", (req, res) => {
  console.log(req.params.id);
  db.Client.destroy({
    where: {
      id: req.params.id
    }
  }).then(() => {
    console.log("client destroyed");
    res.status(200).end();
  });
});

module.exports = router;
