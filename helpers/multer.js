const multer = require('multer')
const path = require('path')
const fs = require('fs')

const storage = multer.diskStorage({
    destination:  (req, res, cb) =>{
        cb(null, path.join(__dirname,'../public/public/uploads/re-image'))
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname)
    }
})

module.exports = storage                                                          

// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');

// // Create the directory if it doesn't exist
// const uploadDir = path.join(__dirname, '../public/uploads/product-image');
// if (!fs.existsSync(uploadDir)) {
//     fs.mkdirSync(uploadDir, { recursive: true });
// }

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, uploadDir);  // Save files to this directory
//     },
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + '-' + file.originalname);  // Generate unique filename
//     }
// });

// const upload = multer({ storage });

// module.exports = upload;
