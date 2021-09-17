const supplierModel = require("../models/supplierModel");

module.exports = {
  getCountAll: (req, res, next) => {
    supplierModel.countDocuments((error, count) => {
      if (error) {
        next(error);
      }

      return res.json({
        status: 200,
        message: "OK",
        count: count,
        error: false,
      });
    });
  },
  getAll: (req, res, next) => {
    const query = req.query;
    const page = parseInt(query.page);
    const rows = parseInt(query.rows);
    let [field, direction] = query.sortby ? query.sortby.split(".") : [];
    direction = direction === "asc" ? 1 : -1;
    const filter = {
      $and: [
        {
          $or: [
            { nama_supplier: new RegExp(query.q, "i") },
            { no_telp: new RegExp(query.q, "i") },
            { alamat: new RegExp(query.q, "i") },
          ],
        },
      ],
    };

    supplierModel
      .find(filter)
      .select("nama_supplier no_telp alamat")
      .skip((page - 1) * rows)
      .limit(rows)
      .sort([[field, direction]])
      .exec(function (error, data) {
        if (error) {
          next(error);
        }

        // count all
        supplierModel.countDocuments().exec(function (error, count) {
          if (error) {
            next(error);
          }

          // count all with filter
          supplierModel
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
  getById: (req, res, next) => {
    const { id } = req.params;
    supplierModel
      .findById(id, function (error, data) {
        if (error) {
          next(error);
        } else {
          res.json({
            status: 200,
            message: "OK",
            data: data,
            error: false,
          });
        }
      })
      .select("nama_supplier no_telp alamat");
  },
  create: (req, res, next) => {
    const { nama_supplier, no_telp, alamat } = req.body;
    var isError = false;

    if (nama_supplier === undefined || nama_supplier === "") {
      isError = true;
    } else if (
      no_telp === undefined ||
      no_telp === "" ||
      no_telp.match(/\D/g)
    ) {
      isError = true;
    } else if (alamat === undefined || alamat === "") {
      isError = true;
    }

    if (isError) {
      return res.json({
        status: 401,
        message: "Request not allowed",
        error: true,
      });
    }

    supplierModel.insertMany(
      [{ nama_supplier: nama_supplier, no_telp: no_telp, alamat: alamat }],
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
    const { nama_supplier, no_telp, alamat } = req.body;
    const { id } = req.params;
    var isError = false;

    if (nama_supplier === undefined || nama_supplier === "") {
      isError = true;
    } else if (
      no_telp === undefined ||
      no_telp === "" ||
      no_telp.match(/\D/g)
    ) {
      isError = true;
    } else if (alamat === undefined || alamat === "") {
      isError = true;
    }
  
    if (isError) {
      return res.json({
        status: 401,
        message: "Request not allowed",
        error: true,
      });
    }
    
    supplierModel.findByIdAndUpdate(
      id,
      { nama_supplier: nama_supplier, no_telp: no_telp, alamat: alamat },
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
    supplierModel.findByIdAndDelete(id, function (error) {
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
