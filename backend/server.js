const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

pool.connect((err, client, release) => {
  if (err) {
    console.error("Ошибка подключения к базе данных:", err.stack);
    process.exit(1);
  } else {
    console.log("Подключение к PostgreSQL установлено");
    release();
  }
});

module.exports = { pool };

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routers/auth"));
app.use("/api/applications", require("./routers/applications"));
app.use("/api/reviews", require("./routers/reviews"));
app.use("/api/admin", require("./routers/admin"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
