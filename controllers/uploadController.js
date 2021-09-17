module.exports = {
  do: (req, res, next) => {
    res.json({
      status: 200,
      message: "OK",
      data: { filename: req.file.filename },
      error: false,
    });
  },
};
