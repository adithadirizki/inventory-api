const satuanModel = require("../models/satuanModel");

module.exports = {
  getAll: (req, res, next) => {
    const query = req.query;
    const page = parseInt(query.page);
    const rows = parseInt(query.rows);
    let [field, direction] = query.sortby ? query.sortby.split(".") : [];
    direction = direction === "asc" ? 1 : -1;
    const filter = { nama_satuan: new RegExp(query.q, "i") };
  
    satuanModel
      .find(filter)
      .select("nama_satuan")
      .skip((page - 1) * rows)
      .limit(rows)
      .sort([[field, direction]])
      .exec(function (error, data) {
        if (error) {
          next(error);
        }
  
        // count all
        satuanModel.countDocuments().exec(function (error, count) {
          if (error) {
            next(error);
          }
  
          // count all with filter
          satuanModel
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
    const { nama_satuan } = req.body;
  
    if (nama_satuan === undefined || nama_satuan === "") {
      return res.json({
        status: 401,
        message: "Request not allowed",
        error: true,
      });
    }
  
    satuanModel.insertMany(
      [{ nama_satuan: nama_satuan }],
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
    const { nama_satuan } = req.body;
    const { id } = req.params;
  
    if (nama_satuan === undefined || nama_satuan === "") {
      return res.json({
        status: 401,
        message: "Request not allowed",
        error: true,
      });
    }
    
    satuanModel.findByIdAndUpdate(
      id,
      { nama_satuan: nama_satuan },
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
    satuanModel.findByIdAndDelete(id, function (error) {
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
