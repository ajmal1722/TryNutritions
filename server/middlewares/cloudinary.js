const cloudinary = require('cloudinary');
const dotenv = require('dotenv');
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
})

exports.uploads = (file, folder) => {
    return new promise(resolve => {
        cloudinary.uploder.upload(file, (result) => {
            resolve({
                url: result.url,
                id: result.public_id
            })
        }, {
            resource_type: 'auto',
            folder:folder
        })
    })
}