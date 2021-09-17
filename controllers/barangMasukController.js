const moment = require("moment");
const barangMasukModel = require("../models/barangMasukModel");

module.exports = {
  getExpenses: (req, res, next) => {
    barangMasukModel
      .find()
      .select("harga_beli kuantitas")
      .exec((error, data) => {
        if (error) {
          next(error);
        }

        var expense = 0;

        data.forEach((value, index) => {
          expense = expense + value.harga_beli * value.kuantitas;
        });

        return res.json({
          status: 200,
          message: "OK",
          expense: expense,
          error: false,
        });
      });
  },
  getExpenseThisMonth: (req, res, next) => {
    const date = new Date("now");
    barangMasukModel
      .find({
        created_at: {
          $gte: moment().startOf("month"),
          $lt: moment().endOf("month"),
        },
      })
      .select("harga_beli kuantitas created_at")
      .exec((error, data) => {
        if (error) {
          next(error);
        }

        var expense = new Array(moment().daysInMonth()).fill(0);

        data.forEach((value, index) => {
          const day = moment(value.created_at).format("D");
          expense[day - 1] += value.harga_beli * value.kuantitas;
        });

        return res.json({
          status: 200,
          message: "OK",
          data: expense,
          error: false,
        });
      });
  },
  getExpanseThisYear: (req, res, next) => {
    const date = new Date("now");
    barangMasukModel
      .find({
        created_at: {
          $gte: moment().startOf("year"),
          $lt: moment().endOf("year"),
        },
      })
      .select("harga_beli kuantitas created_at")
      .exec((error, data) => {
        if (error) {
          next(error);
        }

        var expanse = new Array(12).fill(0);

        data.forEach((value, index) => {
          const month = moment(value.created_at).format("M");
          expanse[month - 1] += value.harga_beli * value.kuantitas;
        });

        return res.json({
          status: 200,
          message: "OK",
          data: expanse,
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
      return res
        .status(400)
        .json({ status: 400, message: "Request is not allowed", error: true });
    } else if (!moment(sampai).isValid()) {
      return res
        .status(400)
        .json({ status: 400, message: "Request is not allowed", error: true });
    }

    barangMasukModel
      .find(filter)
      .select(
        "no_transaksi kode_barang harga_beli kuantitas id_supplier username created_at"
      )
      .sort([["created_at", -1]])
      .populate({
        path: "barang_masuk",
        select: "nama_barang id_satuan",
        populate: {
          path: "id_satuan",
          model: "satuan",
          select: "nama_satuan",
        },
      })
      .populate("id_supplier")
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

    barangMasukModel
      .find(filter)
      .select(
        "no_transaksi kode_barang harga_beli kuantitas id_supplier username created_at"
      )
      .skip((page - 1) * rows)
      .limit(rows)
      .sort([[field, direction]])
      .populate({
        path: "barang_masuk",
        select: "nama_barang id_satuan",
        populate: {
          path: "id_satuan",
          model: "satuan",
          select: "nama_satuan",
        },
      })
      .populate("id_supplier")
      .populate("user_input", "nama")
      .exec(function (error, data) {
        if (error) {
          next(error);
        }

        // count all
        barangMasukModel.countDocuments().exec(function (error, count) {
          if (error) {
            next(error);
          }

          // count all with filter
          barangMasukModel
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
    const { id_supplier, kode_barang, kuantitas, harga_beli, username } =
      req.body;
    var isError = false;

    if (id_supplier === undefined || id_supplier === "") {
      isError = true;
    } else if (kode_barang === undefined || kode_barang === "") {
      isError = true;
    } else if (
      kuantitas === undefined ||
      kuantitas === "" ||
      kuantitas.match(/\D/g)
    ) {
      isError = true;
    } else if (
      harga_beli === undefined ||
      harga_beli === "" ||
      harga_beli.match(/\D/g)
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

    const newBarangMasuk = {
      id_supplier: id_supplier,
      kode_barang: kode_barang,
      kuantitas: kuantitas,
      harga_beli: harga_beli,
      username: username,
    };

    barangMasukModel.insertMany([newBarangMasuk], function (error, data) {
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
    barangMasukModel.findOneAndDelete({ no_transaksi: id }, function (error) {
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
