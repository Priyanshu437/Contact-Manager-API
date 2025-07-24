const express = require("express");
const { registerUser, loginUser, currentUser } = require("../controllers/userController");
const validateToken = require("../middleware/validateTokenHandler");

const router = express.Router();

router.post("/register", registerUser);//register endpoint

router.post("/login", loginUser);//login endpoind

router.get("/current",validateToken, currentUser);//current user endpoint

module.exports = router;