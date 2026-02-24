const path = require("path");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../frontend/assets/images"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const fileName = "user_" + Date.now() + ext;
    cb(null, fileName);
  }
});

const upload = multer({ storage });

module.exports = upload;
