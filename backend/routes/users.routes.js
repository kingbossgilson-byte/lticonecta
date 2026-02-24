const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const upload = require("../config/upload");
auth = require("../middleware/auth");

router.get('/', usersController.getByType);
router.get('/email/:email', usersController.getUser);
router.get('/id/:id',  usersController.getById);
router.put("/profile/:id", upload.single("profilePic"), usersController.updateUser);
router.put("/password/:id", usersController.updateProfile);

module.exports = router;