const usersModel = require("../models/usersModel");
const bcrypt = require("bcrypt");

module.exports = {
  getCountAll: (req, res, next) => {
    usersModel.countDocuments((error, count) => {
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
            { username: new RegExp(query.q, "i") },
            { nama: new RegExp(query.q, "i") },
            { email: new RegExp(query.q, "i") },
            { no_telp: new RegExp(query.q, "i") },
            { role: new RegExp(query.q, "i") },
          ],
        },
      ],
    };

    usersModel
      .find(filter)
      .select("username nama email no_telp role status created_at")
      .skip((page - 1) * rows)
      .limit(rows)
      .sort([[field, direction]])
      .exec(function (error, data) {
        if (error) {
          next(error);
        }

        // count all
        usersModel.countDocuments().exec(function (error, count) {
          if (error) {
            next(error);
          }

          // count all with filter
          usersModel
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
  getByUsername: (req, res, next) => {
    const { username } = req.params;
    usersModel
      .findOne({ username: username }, function (error, data) {
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
      .select("foto username nama email no_telp role status created_at");
  },
  getUserInfo: (req, res, next) => {
    const { username } = req.headers["x-access-token"];
    usersModel
      .findOne({ username: username }, function (error, data) {
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
      .select("foto username nama email no_telp role status created_at");
  },
  create: (req, res, next) => {
    const { username, foto, nama, email, password, no_telp, role, status } =
      req.body;
    var isError = false;

    if (username === undefined || username === "" || username.length < 5) {
      isError = true;
    } else if (nama === undefined || nama === "") {
      isError = true;
    } else if (
      password === undefined ||
      password === "" ||
      password.length < 6
    ) {
      isError = true;
    } else if (
      email === undefined ||
      email === "" ||
      !email.includes("@") ||
      !email.includes(".")
    ) {
      isError = true;
    } else if (
      no_telp === undefined ||
      no_telp === "" ||
      no_telp.match(/\D/g)
    ) {
      isError = true;
    } else if (
      role === undefined ||
      role === "" ||
      !["admin", "staff"].includes(role)
    ) {
      isError = true;
    } else if (
      status === undefined ||
      status === "" ||
      ![0, 1].includes(status)
    ) {
      isError = true;
    }

    if (isError) {
      return res.json({
        status: 401,
        message: "Request not allowed",
        error: true,
      });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    usersModel.insertMany(
      [
        {
          username: username,
          foto: foto,
          nama: nama,
          email: email,
          password: passwordHash,
          no_telp: no_telp,
          role: role,
          status: status,
        },
      ],
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
    const { foto, nama, email, no_telp, role, status } = req.body;
    const { username } = req.params;
    var isError = false;

    if (nama === undefined || nama === "") {
      isError = true;
    } else if (
      email === undefined ||
      email === "" ||
      !email.includes("@") ||
      !email.includes(".")
    ) {
      isError = true;
    } else if (
      no_telp === undefined ||
      no_telp === "" ||
      no_telp.match(/\D/g)
    ) {
      isError = true;
    } else if (
      role === undefined ||
      role === "" ||
      !["admin", "staff"].includes(role)
    ) {
      isError = true;
    } else if (
      status === undefined ||
      status === "" ||
      ![0, 1].includes(status)
    ) {
      isError = true;
    }

    if (isError) {
      return res.json({
        status: 401,
        message: "Request not allowed",
        error: true,
      });
    }

    usersModel.findOneAndUpdate(
      { username: username },
      {
        foto: foto,
        nama: nama,
        email: email,
        no_telp: no_telp,
        role: role,
        status: status,
      },
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
    const { username } = req.params;

    usersModel.findOneAndDelete({ username: username }, function (error) {
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
  updateUserInfo: (req, res, next) => {
    const { foto, nama, email, no_telp } = req.body;
    const { username } = req.headers["x-access-token"];
    var isError = false;

    if (nama === undefined || nama === "") {
      isError = true;
    } else if (
      email === undefined ||
      email === "" ||
      !email.includes("@") ||
      !email.includes(".")
    ) {
      isError = true;
    } else if (
      no_telp === undefined ||
      no_telp === "" ||
      no_telp.match(/\D/g)
    ) {
      isError = true;
    }

    if (isError) {
      return res.json({
        status: 401,
        message: "Request not allowed",
        error: true,
      });
    }

    usersModel.findOneAndUpdate(
      { username: username },
      {
        foto: foto,
        nama: nama,
        email: email,
        no_telp: no_telp,
        foto: foto,
      },
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
  changePassword: (req, res, next) => {
    const { password } = req.body;
    const { username } = req.params;
    var isError = false;

    if (password === undefined || password === "" || password.length < 6) {
      isError = true;
    }

    if (isError) {
      return res.json({
        status: 401,
        message: "Request not allowed",
        error: true,
      });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    usersModel.findOneAndUpdate(
      { username: username },
      { password: passwordHash },
      function (error) {
        if (error) {
          next(error);
        }
        res.json({
          status: 200,
          message: "Password berhasil diubah",
          error: false,
        });
      }
    );
  },
  changePasswordUserInfo: (req, res, next) => {
    const { password } = req.body;
    const { username } = req.headers["x-access-token"];
    var isError = false;

    if (password === undefined || password === "" || password.length < 6) {
      isError = true;
    }

    if (isError) {
      return res.json({
        status: 401,
        message: "Request not allowed",
        error: true,
      });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    usersModel.findOneAndUpdate(
      { username: username },
      { password: passwordHash },
      function (error) {
        if (error) {
          next(error);
        }
        res.json({
          status: 200,
          message: "Password berhasil diubah",
          error: false,
        });
      }
    );
  },
};
