const express = require('express');
const router = express.Router();
const upload = require("../config/upload");
const authController = require('../controllers/auth.controller');

router.post('/register', authController.register);
router.post('/professionalregister', upload.single("profilePic"), authController.professionalregister);
router.post('/login', authController.login);

module.exports = router;