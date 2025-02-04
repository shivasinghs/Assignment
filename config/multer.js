const { MULTER, PATH, FS } = require("./constants");

const storage = MULTER.diskStorage({
  destination: (req, file, cb) => {
    cb(null, PATH.join(__dirname, "../assets/uploads/")); 
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only PNG, JPEG, and JPG are allowed."), false);
  }
};

const upload = MULTER({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, 
  fileFilter: fileFilter,
});


const deleteImage = (imagePath) => {
  if (imagePath) {
    const fullPath = PATH.join(__dirname, "../assets/uploads/", imagePath); 
    FS.unlink(fullPath, (err) => {
      if (err) {
        console.error("Error deleting old image:", err);
      }
    });
  }
};

module.exports = { upload, deleteImage };

