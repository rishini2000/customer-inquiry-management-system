const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { Pool } = require("pg");

const app = express();
const PORT = Number(process.env.PORT) || 3000;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

app.use(helmet());
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Customer Inquiry API is running",
  });
});

app.get("/api/db-check", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({
      success: true,
      message: "PostgreSQL connection successful",
    });
  } catch (error) {
    console.error("Database connection failed:", error.message);
    res.status(500).json({
      success: false,
      message: "Could not connect to the database",
    });
  }
});


const allowedStatuses = ["New", "In Progress", "Resolved"];

// Staff login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      !username.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    const configuredUsername = process.env.STAFF_USERNAME;
    const passwordHash = process.env.STAFF_PASSWORD_HASH;
    const jwtSecret = process.env.JWT_SECRET;

    if (!configuredUsername || !passwordHash || !jwtSecret) {
      return res.status(500).json({
        success: false,
        message: "Authentication is not configured",
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      passwordHash
    );

    if (
      username.trim() !== configuredUsername ||
      !passwordMatches
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    const token = jwt.sign(
      { username: configuredUsername, role: "staff" },
      jwtSecret,
      { expiresIn: "1h" }
    );

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: { username: configuredUsername, role: "staff" },
    });
  } catch (error) {
    console.error("Login failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Could not process login",
    });
  }
});

function authenticateStaff(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (decoded.role !== "staff") {
      return res.status(403).json({
        success: false,
        message: "Staff access required",
      });
    }

    req.staff = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
}

// GET /api/inquiries
// Supports search and status filtering.
app.get("/api/inquiries", authenticateStaff, async (req, res) => {
  try {
    const search = String(req.query.search || "").trim();
    const status = String(req.query.status || "").trim();

    if (status && status !== "All" && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid inquiry status",
      });
    }

    const values = [];
    const conditions = [];

    if (search) {
      values.push(`%${search}%`);
      conditions.push(
        `(customer_name ILIKE $${values.length}
          OR email ILIKE $${values.length}
          OR subject ILIKE $${values.length}
          OR description ILIKE $${values.length})`
      );
    }

    if (status && status !== "All") {
      values.push(status);
      conditions.push(`status = $${values.length}`);
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const result = await pool.query(
      `SELECT id, customer_name AS "customerName",
              email, subject, description, status,
              created_at AS "createdAt",
              updated_at AS "updatedAt"
       FROM inquiries
       ${whereClause}
       ORDER BY created_at DESC`,
      values
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Failed to retrieve inquiries:", error.message);
    res.status(500).json({
      success: false,
      message: "Could not retrieve inquiries",
    });
  }
});

// POST /api/inquiries
// Creates a new inquiry in PostgreSQL.
app.post("/api/inquiries", authenticateStaff, async (req, res) => {
  try {
    const { customerName, email, subject, description } = req.body;

    if (
      typeof customerName !== "string" ||
      typeof email !== "string" ||
      typeof subject !== "string" ||
      typeof description !== "string" ||
      !customerName.trim() ||
      !email.trim() ||
      !subject.trim() ||
      !description.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, email, subject, and description are required",
      });
    }

    const name = customerName.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const cleanSubject = subject.trim();
    const cleanDescription = description.trim();

    if (
      name.length > 150 ||
      normalizedEmail.length > 255 ||
      cleanSubject.length > 200
    ) {
      return res.status(400).json({
        success: false,
        message: "One or more fields exceed the allowed length",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    const result = await pool.query(
      `INSERT INTO inquiries
         (customer_name, email, subject, description)
       VALUES ($1, $2, $3, $4)
       RETURNING id, customer_name AS "customerName",
                 email, subject, description, status,
                 created_at AS "createdAt",
                 updated_at AS "updatedAt"`,
      [name, normalizedEmail, cleanSubject, cleanDescription]
    );

    res.status(201).json({
      success: true,
      message: "Inquiry created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Failed to create inquiry:", error.message);
    res.status(500).json({
      success: false,
      message: "Could not create inquiry",
    });
  }
});

// PATCH /api/inquiries/:id/status
// Updates an inquiry's status.
app.patch("/api/inquiries/:id/status", authenticateStaff, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    if (!Number.isSafeInteger(id) || id < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid inquiry ID",
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid inquiry status",
      });
    }

    const result = await pool.query(
      `UPDATE inquiries
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, customer_name AS "customerName",
                 email, subject, description, status,
                 created_at AS "createdAt",
                 updated_at AS "updatedAt"`,
      [status, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found",
      });
    }

    res.json({
      success: true,
      message: "Inquiry status updated",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Failed to update inquiry:", error.message);
    res.status(500).json({
      success: false,
      message: "Could not update inquiry status",
    });
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Backend server running at http://localhost:${PORT}`);
  });
}

module.exports = app;