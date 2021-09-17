require("dotenv").config();
require("./config/database").connect();
const createError = require("http-errors");
const express = require("express");
const path = require("path");
const logger = require("morgan");
const auth = require("./middleware/auth");
const multer = require("multer");
const crypto = require("crypto");

var indexRouter = require("./routes/index");
var authRouter = require("./routes/auth");
var uploadRouter = require("./routes/upload");
var usersRouter = require("./routes/users");
var barangRouter = require("./routes/barang");
var kategoriRouter = require("./routes/kategori");
var satuanRouter = require("./routes/satuan");
var supplierRouter = require("./routes/supplier");
var barangMasukRouter = require("./routes/barangMasuk");
var barangKeluarRouter = require("./routes/barangKeluar");

const app = express();
const port = process.env.PORT || 3000;

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// auth without middleware
app.use("/", indexRouter);
app.use("/auth", authRouter);
app.use("/pengguna", usersRouter);

// middleware
app.use(auth);

const diskStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, path.join(__dirname, "/public/img"));
  },
  filename: (req, file, callback) => {
    const prefix = crypto.randomBytes(16).toString("hex");
    callback(null, prefix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: diskStorage,
  fileFilter: (req, file, callback) => {
    if (
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/png"
    ) {
      callback(null, true);
    } else {
      callback("Mimetype not allowed", false);
    }
  },
  limits: { fileSize: 2 * 1024 * 1024 },
}).single("file");

app.use("/upload", upload, uploadRouter);
app.use("/barang", barangRouter);
app.use("/kategori", kategoriRouter);
app.use("/satuan", satuanRouter);
app.use("/supplier", supplierRouter);
app.use("/barang_masuk", barangMasukRouter);
app.use("/barang_keluar", barangKeluarRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500).json({
    status: err.status || 500,
    message: err.message,
    error: true,
  });
});

app.listen(port, () => {
  console.log(`app running on http://localhost:${port}`);
})