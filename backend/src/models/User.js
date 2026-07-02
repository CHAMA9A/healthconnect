const pool = require("../config/database");

class User {
  static async findByEmail(email) {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    return result.rows[0] || null;
  }

  static async findById(id) {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    return result.rows[0] || null;
  }

  static async create({ first_name, last_name, email, password, role }) {
    const result = await pool.query(
      `INSERT INTO users (first_name, last_name, email, password, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, first_name, last_name, email, role, created_at`,
      [first_name, last_name, email, password, role || "PATIENT"]
    );
    return result.rows[0];
  }

  static async updateLastLogin(id) {
    await pool.query(
      "UPDATE users SET last_login = NOW() WHERE id = $1",
      [id]
    );
  }
}

module.exports = User;