const router = require("express").Router();
const pool = require("../server");
const auth = require("../middleware/authMidleware");


router.get("/my", auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, h.name AS hall_name, p.name AS payment_name
            FROM applications a
            JOIN hall_types h ON a.hall_type_id = h.id
            JOIN payment_methods p ON a.payment_method_id = p.id
            WHERE a.user_id = $1
            ORDER BY a.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
});


router.post("/", auth, async (req, res) => {
  const { hall_type_id, payment_method_id, event_date } = req.body;
  try {
    await pool.query(
      "INSERT INTO applications (user_id, hall_type_id, payment_method_id, event_date) VALUES ($1,$2,$3,$4)",
      [req.user.id, hall_type_id, payment_method_id, event_date]
    );
    res.json({ message: "Бронирование создано" });
  } catch (err) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
});


router.get("/hall-types", async (req, res) => {
  const result = await pool.query("SELECT * FROM hall_types");
  res.json(result.rows);
});


router.get("/payment_methods", async (req, res) => {
  const result = await pool.query("SELECT * FROM payment_methods");
  res.json(result.rows);
});


module.exports = router;



