const kategoriModel = require("../models/kategoriModel");

module.exports = {
  getAll: (req, res, next) => {
    const query = req.query;
    const page = parseInt(query.page);
    const rows = parseInt(query.rows);
    let [field, direction] = query.sortby ? query.sortby.split(".") : [];
    direction = direction === "asc" ? 1 : -1;
    const filter = { nama_kategori: new RegExp(query.q, "i") };
  
    kategoriModel
      .find(filter)
      .select("nama_kategori")
      .skip((page - 1) * rows)
      .limit(rows)
      .sort([[field, direction]])
      .exec(function (error, data) {
        if (error) {
          next(error);
        }
  
        // count all
        kategoriModel.countDocuments().exec(function (error, count) {
          if (error) {
            next(error);
          }
  
          // count all with filter
          kategoriModel
            .find(filter)
            .countDocuments()
            .exec(function (error, countFiltered) {
              if (error) {
                next(error);
              }
  
              res.json({
                status: 200,
                message: "OK",
                data: data,
                page: page,
                total_rows: count,
                total_rows_filtered: countFiltered,
                error: false,
              });
            });
        });
      });
  },
  create: (req, res, next) => {
    const { nama_kategori } = req.body;
  
    if (nama_kategori === undefined || nama_kategori === "") {
      return res.json({
        status: 401,
        message: "Request not allowed",
        error: true,
      });
    }
  
    kategoriModel.insertMany(
      [{ nama_kategori: nama_kategori }],
      function (error) {
        if (error) {
          next(error);
        }
        res.json({
          status: 200,
          message: "Berhasil ditambahkan",
          error: false,
        });
      }
    );
  },
  update: (req, res, next) => {
    const { nama_kategori } = req.body;
    const { id } = req.params;
  
    if (nama_kategori === undefined || nama_kategori === "") {
      return res.json({
        status: 401,
        message: "Request not allowed",
        error: true,
      });
    }
    
    kategoriModel.findByIdAndUpdate(
      id,
      { nama_kategori: nama_kategori },
      function (error) {
        if (error) {
          next(error);
        }
        res.json({
          status: 200,
          message: "Berhasil diupdate",
          error: false,
        });
      }
    );
  },
  delete: (req, res, next) => {
    const { id } = req.params;
    kategoriModel.findByIdAndDelete(id, function (error) {
      if (error) {
        next(error);
      }
      res.json({
        status: 200,
        message: "Berhasil dihapus",
        error: false,
      });
    });
  },
};
