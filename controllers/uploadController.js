module.exports = {
  do: (req, res, next) => {
    return res.json({
      status: 200,
      message: "Berhasil diupload",
      data: { filename: req.file.filename },
      error: false,
    });
  },
};
