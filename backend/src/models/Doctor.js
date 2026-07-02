const pool = require("../config/database");

class Doctor {
  static async findByUserId(userId) {
    const result = await pool.query("SELECT * FROM doctors WHERE user_id = $1", [userId]);
    return result.rows[0] || null;
  }

  static async findById(id) {
    const result = await pool.query(
      `SELECT d.*, u.first_name, u.last_name, u.email, u.avatar_url
       FROM doctors d
       JOIN users u ON u.id = d.user_id
       WHERE d.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  static async findAllValidated(search) {
    let query = `SELECT d.*, u.first_name, u.last_name, u.email, u.avatar_url
                 FROM doctors d
                 JOIN users u ON u.id = d.user_id
                 WHERE d.is_validated = TRUE`;
    const params = [];
    if (search) {
      query += ` AND (LOWER(u.first_name) LIKE LOWER($1) OR LOWER(u.last_name) LIKE LOWER($1) OR LOWER(d.speciality) LIKE LOWER($1))`;
      params.push(`%${search}%`);
    }
    query += " ORDER BY u.last_name ASC";
    const result = await pool.query(query, params);
    return result.rows;
  }

  static async findAllForAdmin() {
    const result = await pool.query(
      `SELECT d.*, u.first_name, u.last_name, u.email
       FROM doctors d
       JOIN users u ON u.id = d.user_id
       ORDER BY d.is_validated ASC, u.last_name ASC`
    );
    return result.rows;
  }

  static async createOrUpdate(userId, { speciality, description, address, phone }) {
    const existing = await this.findByUserId(userId);
    if (existing) {
      const result = await pool.query(
        `UPDATE doctors SET speciality = $1, description = $2, address = $3, phone = $4
         WHERE user_id = $5
         RETURNING *`,
        [speciality, description, address, phone, userId]
      );
      return result.rows[0];
    }
    const result = await pool.query(
      `INSERT INTO doctors (user_id, speciality, description, address, phone)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, speciality, description, address, phone]
    );
    return result.rows[0];
  }

  static async validate(doctorId, isValidated) {
    const result = await pool.query(
      "UPDATE doctors SET is_validated = $1 WHERE id = $2 RETURNING *",
      [isValidated, doctorId]
    );
    return result.rows[0] || null;
  }
}

module.exports = Doctor;