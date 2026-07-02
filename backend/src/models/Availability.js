const pool = require("../config/database");

class Availability {
  static async findByDoctorId(doctorId) {
    const result = await pool.query(
      `SELECT * FROM availabilities
       WHERE doctor_id = $1 AND is_available = TRUE
       ORDER BY date ASC, start_time ASC`,
      [doctorId]
    );
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query("SELECT * FROM availabilities WHERE id = $1", [id]);
    return result.rows[0] || null;
  }

  static async create(doctorId, { date, start_time, end_time }) {
    const result = await pool.query(
      `INSERT INTO availabilities (doctor_id, date, start_time, end_time)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [doctorId, date, start_time, end_time]
    );
    return result.rows[0];
  }

  static async update(id, doctorId, { date, start_time, end_time }) {
    const result = await pool.query(
      `UPDATE availabilities SET date = $1, start_time = $2, end_time = $3
       WHERE id = $4 AND doctor_id = $5
       RETURNING *`,
      [date, start_time, end_time, id, doctorId]
    );
    return result.rows[0] || null;
  }

  static async remove(id, doctorId) {
    const result = await pool.query(
      "DELETE FROM availabilities WHERE id = $1 AND doctor_id = $2 RETURNING *",
      [id, doctorId]
    );
    return result.rows[0] || null;
  }

  static async setAvailable(id, available) {
    await pool.query("UPDATE availabilities SET is_available = $1 WHERE id = $2", [available, id]);
  }
}

module.exports = Availability;