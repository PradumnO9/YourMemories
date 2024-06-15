const fs = require('fs');
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');
const HttpError = require('./models/http-error');

const app = express();

app.use(bodyParser.json());

app.use('/uploads/images', express.static(path.join('uploads', 'images')));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
    next();
});

app.use('/api/places', placesRoutes); // => all places routes starting with /api/places
app.use('/api/users', usersRoutes); // => all users routes starting with /api/users

app.use((req, res, next) => {
    const error = new HttpError('Could not found this route.', 404);
    throw error;
});

app.use((error, req, res, next) => { // special middleware of express which handles errors by default 
    if (req.file) {
        fs.unlink(req.file.path, err => {
            console.log(err);
        })
    }
    if (res.headerSent) {
        return next(error);
    }

    res.status(error.code || 500);
    res.json({ message: error.message || "An unknown error occurred!" });
});

mongoose
  .connect(
    `mongodb+srv://pradumn111:VZwYPrupVKftlGIy@cluster0.y16ropg.mongodb.net/mern-prod`, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  )
  .then(() => {
    app.listen(5000);
    console.log("Server is running on port 5000")
    console.log("DB Connected");
  })
  .catch((err) => {
    console.log(err);
  });