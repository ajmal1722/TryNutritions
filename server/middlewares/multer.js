const multer = require('multer');

// set storage
const storage = multer.diskStorage({
     
    filename: (req, file, cb) => {
        const ext = file.originalname.substr(file.originalname.lastIndexOf('.'))

        cb(null, file.fieldname + '-' + Date.now() + ext)
    }
});

const upload = multer({ storage: storage })

module.exports = upload;