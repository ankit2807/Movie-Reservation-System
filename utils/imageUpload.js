const multer = require("multer");
const router = require('express').Router();
const path = require('path')

//upload logic
const storage = multer.diskStorage({
    destination: 'public',
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '_' + Date.now()
            + path.extname(file.originalname))
    }
});

const Upload = multer({
    storage: storage,
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|jfif)$/)) {
            return cb(new Error('Please upload a Image'))
        }
        cb(undefined, true)
    }
})

//upload the image
router.post('/', Upload.array('image'), (req, res) => {
    res.status(200).json('Images uploaded')
}, (error, req, res) => {
    res.status(400).send({ error: error.message })
});

module.exports = router;