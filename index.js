const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static("./public/"))
app.use(express.static("./public/resources/"));
app.use(express.json({limit : '1mb'}));

const port = 8181;

const handleError = (err, res) => {
  res
    .status(500)
    .contentType("text/plain")
    .end("Oops! Something went wrong!");
};

const upload = multer({
  dest: "Downloads"
});

const db = new sqlite3.Database('db/Credentials.db');

app.post("/submit", (req, res) => {

    console.log("Request received");
    let name = req.body["name"];
    let add = req.body["address"];
    let pass = req.body["pass"];
    let phone = req.body["phone"];
    phone = parseInt(phone);
    let query = `Insert into Credentials(Name, Address, Phone, Password) values (?), (?), (?), (?);`
    let values = [name, add, phone, pass];
    db.run(query, values[0], values[1], values[2], values[3], (err)=>{
        if(err){
            throw err;
        }
        console.log("Row inserted");
        res.status(200);
        return res.send("Row inserted");
    })
});

app.post("/upload", upload.single("Downloads"), (req, res) => {
    const tempPath = req.file.path;
    const targetPath = path.join(__dirname, "./Downloads/image.jpeg");

    if (path.extname(req.file.originalname).toLowerCase() === ".jpeg") {
      fs.rename(tempPath, targetPath, err => {
        if (err) return handleError(err, res);

        res
          .status(200)
          .contentType("text/plain")
          .end("File uploaded!");
      });
    } else {
      fs.unlink(tempPath, err => {
        if (err) return handleError(err, res);
        res
          .status(403)
          .contentType("text/plain")
          .end("Only .png files are allowed!");
      });
    }
  }
);

app.listen(port, ()=>{
    console.log(`Listening to ${port}`);
});