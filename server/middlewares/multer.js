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

module.exports = store = mullter({ storage: storage });