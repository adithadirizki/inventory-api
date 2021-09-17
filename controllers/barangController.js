const barangModel = require("../models/barangModel");

module.exports = {
  getCountAll: (req, res, next) => {
    barangModel.countDocuments((error, count) => {
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
            { kode_barang: new RegExp(query.q, "i") },
            { nama_barang: new RegExp(query.q, "i") },
          ],
        },
      ],
    };

    barangModel
      .find(filter)
      .select(
        "kode_barang nama_barang stok harga_jual harga_beli id_kategori id_satuan"
      )
      .skip((page - 1) * rows)
      .limit(rows)
      .sort([[field, direction]])
      .populate("id_kategori")
      .populate("id_satuan")
      .exec(function (error, data) {
        if (error) {
          next(error);
        }

        // count all
        barangModel.countDocuments().exec(function (error, count) {
          if (error) {
            next(error);
          }

          // count all with filter
          barangModel
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
    barangModel
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
      .select(
        "kode_barang nama_barang stok harga_jual harga_beli id_kategori id_satuan"
      );
  },
  create: (req, res, next) => {
    const {
      nama_barang,
      stok,
      harga_jual,
      harga_beli,
      id_kategori,
      id_satuan,
    } = req.body;
    var isError = false;

    if (nama_barang === undefined || nama_barang === "") {
      isError = true;
    } else if (stok === undefined || stok === "") {
      isError = true;
    } else if (
      harga_jual === undefined ||
      harga_jual === "" ||
      harga_jual.match(/\D/g)
    ) {
      isError = true;
    } else if (
      harga_beli === undefined ||
      harga_beli === "" ||
      harga_beli.match(/\D/g)
    ) {
      isError = true;
    } else if (id_kategori === undefined || id_kategori === "") {
      isError = true;
    } else if (id_satuan === undefined || id_satuan === "") {
      isError = true;
    }

    if (isError) {
      return res.json({
        status: 401,
        message: "Request not allowed",
        error: true,
      });
    }

    const newBarang = new barangModel({
      nama_barang: nama_barang,
      stok: stok,
      harga_jual: harga_jual,
      harga_beli: harga_beli,
      id_kategori: id_kategori,
      id_satuan: id_satuan,
    });

    newBarang.save(function (error, data) {
      if (error) {
        next(error);
      } else {
        res.json({
          status: 200,
          message: "Berhasil ditambahkan",
          data: data,
          error: false,
        });
      }
    });
  },
  update: (req, res, next) => {
    const { id } = req.params;
    const { nama_barang, harga_jual, harga_beli, id_kategori, id_satuan } =
      req.body;
    var isError = false;

    if (nama_barang === undefined || nama_barang === "") {
      isError = true;
    } else if (
      harga_jual === undefined ||
      harga_jual === "" ||
      harga_jual.match(/\D/g)
    ) {
      isError = true;
    } else if (
      harga_beli === undefined ||
      harga_beli === "" ||
      harga_beli.match(/\D/g)
    ) {
      isError = true;
    } else if (id_kategori === undefined || id_kategori === "") {
      isError = true;
    } else if (id_satuan === undefined || id_satuan === "") {
      isError = true;
    }

    if (isError) {
      return res.json({
        status: 401,
        message: "Request not allowed",
        error: true,
      });
    }

    barangModel.findByIdAndUpdate(
      id,
      {
        nama_barang: nama_barang,
        harga_jual: harga_jual,
        harga_beli: harga_beli,
        id_kategori: id_kategori,
        id_satuan: id_satuan,
      },
      function (error) {
        if (error) {
          next(error);
        } else {
          res.json({
            status: 200,
            message: "Berhasil diupdate",
            error: false,
          });
        }
      }
    );
  },
  delete: (req, res, next) => {
    const { id } = req.params;
    barangModel.findByIdAndDelete(id, function (error) {
      if (error) {
        next(error);
      } else {
        res.json({
          status: 200,
          message: "Berhasil dihapus",
          error: false,
        });
      }
    });
  },
};
