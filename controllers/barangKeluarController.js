const moment = require("moment");
const barangKeluarModel = require("../models/barangKeluarModel");

module.exports = {
  getIncome: (req, res, next) => {
    barangKeluarModel
      .find()
      .select("harga_jual kuantitas")
      .exec((error, data) => {
        if (error) {
          next(error);
        }

        var income = 0;

        data.forEach((value, index) => {
          income = income + value.harga_jual * value.kuantitas;
        });

        return res.json({
          status: 200,
          message: "OK",
          income: income,
          error: false,
        });
      });
  },
  getIncomeThisMonth: (req, res, next) => {
    const date = new Date("now");
    barangKeluarModel
      .find({
        created_at: {
          $gte: moment().startOf("month"),
          $lt: moment().endOf("month"),
        },
      })
      .select("harga_jual kuantitas created_at")
      .exec((error, data) => {
        if (error) {
          next(error);
        }

        var income = new Array(moment().daysInMonth()).fill(0);

        data.forEach((value, index) => {
          const day = moment(value.created_at).format("D");
          income[day - 1] += value.harga_jual * value.kuantitas;
        });

        return res.json({
          status: 200,
          message: "OK",
          data: income,
          error: false,
        });
      });
  },
  getIncomeThisYear: (req, res, next) => {
    const date = new Date("now");
    barangKeluarModel
      .find({
        created_at: {
          $gte: moment().startOf("year"),
          $lt: moment().endOf("year"),
        },
      })
      .select("harga_jual kuantitas created_at")
      .exec((error, data) => {
        if (error) {
          next(error);
        }

        var income = new Array(12).fill(0);

        data.forEach((value, index) => {
          const month = moment(value.created_at).format("M");
          income[month - 1] += value.harga_jual * value.kuantitas;
        });

        return res.json({
          status: 200,
          message: "OK",
          data: income,
          error: false,
        });
      });
  },
  getLaporan: (req, res, next) => {
    const query = req.query;
    const { mulai, sampai } = query;
    const filter = {
      created_at: {
        $gte: moment(mulai).toDate(),
        $lt: moment(sampai).toDate(),
      },
    };

    if (!moment(sampai).isValid()) {
      res
        .status(400)
        .json({ status: 400, message: "Request is not allowed", error: true });
    } else if (!moment(sampai).isValid()) {
      res
        .status(400)
        .json({ status: 400, message: "Request is not allowed", error: true });
    }

    barangKeluarModel
      .find(filter)
      .select(
        "no_transaksi kode_barang harga_jual kuantitas username created_at"
      )
      .sort([["created_at", -1]])
      .populate({
        path: "barang_keluar",
        select: "nama_barang id_satuan",
        populate: {
          path: "id_satuan",
          model: "satuan",
          select: "nama_satuan",
        },
      })
      .populate("user_input", "nama")
      .exec(function (error, data) {
        if (error) {
          next(error);
        }

        res.json({
          status: 200,
          message: "OK",
          data: data,
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
    const filter = { no_transaksi: new RegExp(query.q, "i") };

    barangKeluarModel
      .find(filter)
      .select(
        "no_transaksi kode_barang harga_jual kuantitas username created_at"
      )
      .skip((page - 1) * rows)
      .limit(rows)
      .sort([[field, direction]])
      .populate({
        path: "barang_keluar",
        select: "nama_barang id_satuan",
        populate: {
          path: "id_satuan",
          model: "satuan",
          select: "nama_satuan",
        },
      })
      .populate("user_input", "nama")
      .exec(function (error, data) {
        if (error) {
          next(error);
        }

        // count all
        barangKeluarModel.countDocuments().exec(function (error, count) {
          if (error) {
            next(error);
          }

          // count all with filter
          barangKeluarModel
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
    const { kode_barang, kuantitas, harga_jual, username } = req.body;
    var isError = false;

    if (kode_barang === undefined || kode_barang === "") {
      isError = true;
    } else if (
      kuantitas === undefined ||
      kuantitas === "" ||
      kuantitas.match(/\D/g)
    ) {
      isError = true;
    } else if (
      harga_jual === undefined ||
      harga_jual === "" ||
      harga_jual.match(/\D/g)
    ) {
      isError = true;
    } else if (username === undefined || username === "") {
      isError = true;
    }

    if (isError) {
      return res.json({
        status: 401,
        message: "Request not allowed",
        error: true,
      });
    }

    const newBarangKeluar = {
      kode_barang: kode_barang,
      kuantitas: kuantitas,
      harga_jual: harga_jual,
      username: username,
    };

    barangKeluarModel.insertMany([newBarangKeluar], function (error, data) {
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
  delete: (req, res, next) => {
    const { id } = req.params;
    barangKeluarModel.findOneAndDelete({ no_transaksi: id }, function (error) {
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
