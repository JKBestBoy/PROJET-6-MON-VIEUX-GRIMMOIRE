const sharp = require("sharp");
const path = require('path');
const fs = require('fs');

sharp.cache(false);

const resizeImage = (req, res, next) => {
    try {
        if (!req.file) {
            return next();
        } else {
            const ref = path.parse(req.file.originalname).name;
            sharp(req.file.path)
                .resize({
                    width: 360,
                    height: 570
                })
                .webp({ quality: 100 })
                .toFile('images/' + ref + ".webp")
                .then(() => fs.unlink(req.file.path, (e) => {
                    if (e) console.log(e);
                    next();
                }))
                .catch(err => next(err));
        }
    } catch (error) {
        console.log(error);
        next(error);
    }
}

module.exports = resizeImage;
