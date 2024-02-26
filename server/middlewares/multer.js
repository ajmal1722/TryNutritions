const multer = require('multer');
const mullter = require('multer');

// set storage
const storage = mullter.diskStorage({
    destination: (req, file, cb) => {
         // Specify the destination folder for uploaded files
        cb(null, 'assets/images');
    }, 
    filename: (req, file, cb) => {
        const ext = file.originalname.substr(file.originalname.lastIndexOf('.'))

        cb(null, file.fieldname + '-' + Date.now() + ext)
    }
});

// File validation
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
        cb(null, true)
    } else {
        cb({message: 'Unsupported file format'}, false)
    }
}

const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024},
    fileFilter: fileFilter
})
module.exports = upload;