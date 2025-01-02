const router = require('express').Router();
const { register, login, logout } = require("../controller/userController");
const { verifyToken } = require('../utils/tokenVerification');

//Register Route
router.post('/register', register);

//Login Route
router.post("/login", login);

//Logout Route
router.post("/logout", verifyToken, logout);

module.exports = router;