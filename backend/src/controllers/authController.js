const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const [existing] =
      await pool.query(
        `
        SELECT id
        FROM users
        WHERE email = ?
        `,
        [email]
      );

    if (existing.length > 0) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    await pool.query(
      `
      INSERT INTO users
      (name,email,password)
      VALUES(?,?,?)
      `,
      [name, email, hashedPassword]
    );

    res.status(201).json({
      message: "Register Success",
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await pool.query(
      `
      SELECT *
      FROM users
      WHERE email = ?
      `,
      [email]
    );

    const user = rows[0];

    if (!user) {
      return res.status(404).json({
        message: "User Not Found",
      });
    }

    const match =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!match) {
      return res.status(400).json({
        message: "Wrong Password",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    res.json({
      token,
      user: userData,
    });
  } catch (error) {
    res.status(500).json(error);
  }
};