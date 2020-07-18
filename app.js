const express = require('express');
const HttpError = require('./model/http-error');
const bodyparser = require('body-parser');
const { v1: uuid } = require('uuid');
const fs = require('fs');
const multer = require('multer');
const app = express();

app.use(bodyparser.json());
app.use('/uploads', express.static('uploads'));

// you will need multer or oher middlewer to parse the multipart data. 
app.use(multer().single('image'));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', "*");
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Methods', "GET, POST, PATCH, DELETE");
    next();
});

app.post('/image', async (req, res, next) => {

    const image = req.body.image;

    const data = image.match(/^data:([A-Za-z\/]+);base64,(.+)$/);
    let FetchedData = {};
    if (data.length !== 3) {
        return new HttpError('Invalid input string', 500);
    }

    FetchedData.type = data[1];
    FetchedData.data = new Buffer(data[2], 'base64');
    const imageName = uuid();
    try {
        await fs.writeFile(`uploads/${imageName}.jpeg`, FetchedData.data, (err) => {
            if (err) {
                console.log(err);
            }
            else {
                res.json({ message: "Image is Saved", url: `${imageName}.jpeg` }); //host wiil be added on clientside
            }
        });
    }
    catch(err) {
        next(new HttpError("Cannot createFile"));
    }
});

app.use((req, res, next) => {
    throw new HttpError("No Route Found.", 404);
    next();
})

app.use((error, req, res, next) => {
    if (res.headerSet) {
        next(error);
    }
    res.status(error.code || 500);
    res.json(error.message || "An Unkown error is occured.");
});
app.listen(5000);

