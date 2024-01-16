const express = require("express");
const mongoose = require("mongoose");
const fileUpload = require("express-fileupload");
const ejs = require("ejs");
const path = require("path");
const fs = require("fs");
const Photo = require("./models/Photo.js");
const { Console } = require("console");
const methodOverride = require("method-override");
const app = express();
//connect db
mongoose.connect("mongodb://127.0.0.1:27017/test");
//template engine
app.set("view engine", "ejs");
//middlewares
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(fileUpload());
app.use(
  methodOverride("_method", {
    methods: ["POST", "GET"],
  })
);
//routes
app.get("/", async (req, res) => {
  const photos = await Photo.find({}).sort("-dateCreated");
  res.render("index", {
    photos,
  });
});
app.get("/about", (req, res) => {
  res.render("about");
});
app.get("/photos/:id", async (req, res) => {
  console.log(req.params.id);
  const photo = await Photo.findById(req.params.id);
  res.render("photo", {
    photo,
  });
});
app.get("/photo", (req, res) => {
  res.render("photo");
});
app.get("/add", (req, res) => {
  res.render("add");
});

app.post("/photos", function (req, res) {
  console.log(req.files.sampleFile);
  let sampleFile;
  let uploadPath;

  const uploadDir = "public/uploads";
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }

  sampleFile = req.files.sampleFile;
  uploadPath = __dirname + "/public/uploads/" + sampleFile.name;

  sampleFile.mv(uploadPath, async () => {
    await Photo.create({
      ...req.body,
      image: "/uploads/" + sampleFile.name,
    });
    res.redirect("/");
  });
});
app.get("/photos/edit/:id", async (req, res) => {
  const photo = await Photo.findOne({ _id: req.params.id });
  res.render("edit", {
    photo,
  });
});
app.put("/photos/:id", async (req, res) => {
  const photo = await Photo.findOne({ _id: req.params.id });
  photo.title = req.body.title;
  photo.description = req.body.description;
  photo.save();

  res.redirect(`/photos/${req.params.id}`);
});
app.delete("/photos/:id", async (req, res) => {
  const photo = await Photo.findOne({ _id: req.params.id });
  let deletedImage = __dirname + "/public" + photo.image;
  fs.unlinkSync(deletedImage);
  await Photo.findByIdAndDelete(req.params.id);

  res.redirect("/");
});
const port = 3000;
app.listen(port, () => {
  try {
    console.log("Sunucu " + port + " bağlandı");
  } catch (err) {
    console.log(err);
  }
});
