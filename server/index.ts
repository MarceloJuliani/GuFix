import "dotenv/config";
import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import path from "path";
import { randomUUID } from "crypto";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = Number(process.env.PORT || 3000);
const MYSQL_HOST = process.env.MYSQL_HOST;
const MYSQL_PORT = Number(process.env.MYSQL_PORT || 3306);
const MYSQL_USER = process.env.MYSQL_USER;
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD;
const MYSQL_DATABASE = process.env.MYSQL_DATABASE || "gufix_app";

if (!MYSQL_HOST || !MYSQL_USER || !MYSQL_PASSWORD) {
  console.warn("MySQL env vars are missing. Set MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD.");
}

const pool = mysql.createPool({
  host: MYSQL_HOST,
  port: MYSQL_PORT,
  user: MYSQL_USER,
  password: MYSQL_PASSWORD,
  database: MYSQL_DATABASE,
  connectionLimit: 10,
});

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ ok: false, error: String(error) });
  }
});

app.post("/api/users/upsert", async (req, res) => {
  const { id, fullName, email, role } = req.body || {};
  if (!id) return res.status(400).json({ error: "id is required" });
  await pool.query(
    `INSERT INTO usuarios (id, full_name, email, role)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       full_name = VALUES(full_name),
       email = VALUES(email),
       role = VALUES(role)`,
    [id, fullName || null, email || null, role || null]
  );
  res.json({ ok: true });
});

app.get("/api/clients", async (req, res) => {
  const userId = String(req.query.userId || "");
  if (!userId) return res.status(400).json({ error: "userId is required" });
  const [rows] = await pool.query(
    `SELECT id, user_id as userId, name, email, phone, birth_date as birthDate,
            objective, status, fee, app_enabled as appEnabled, created_at as createdAt
     FROM clientes WHERE user_id = ? ORDER BY name`,
    [userId]
  );
  res.json(rows);
});

app.post("/api/clients", async (req, res) => {
  const id = randomUUID();
  const { userId, name, email, fee } = req.body || {};
  if (!userId || !name) return res.status(400).json({ error: "userId and name are required" });
  await pool.query(
    `INSERT INTO clientes (id, user_id, name, email, fee)
     VALUES (?, ?, ?, ?, ?)`,
    [id, userId, name, email || null, Number(fee || 0)]
  );
  res.json({ id });
});

app.get("/api/exercises", async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT id, name, category, sub_category as subCategory, video_url as videoUrl
     FROM exercicios WHERE status = 'active' ORDER BY created_at DESC`
  );
  res.json(rows);
});

app.post("/api/exercises", async (req, res) => {
  const id = randomUUID();
  const { name, category, subCategory, videoUrl, uploaderId } = req.body || {};
  if (!name || !category || !subCategory) {
    return res.status(400).json({ error: "name, category and subCategory are required" });
  }
  await pool.query(
    `INSERT INTO exercicios (id, name, category, sub_category, video_url, uploader_id, status)
     VALUES (?, ?, ?, ?, ?, ?, 'active')`,
    [id, name, category, subCategory, videoUrl || null, uploaderId || null]
  );
  res.json({ id });
});

app.get("/api/workouts", async (req, res) => {
  const userId = String(req.query.userId || "");
  if (!userId) return res.status(400).json({ error: "userId is required" });
  const [rows] = await pool.query(
    `SELECT id, user_id as userId, client_id as clientId, client_name as clientName,
            type, objective, archived, created_at as createdAt
     FROM treinos WHERE user_id = ? ORDER BY created_at DESC`,
    [userId]
  );
  res.json(rows);
});

app.post("/api/workouts", async (req, res) => {
  const workoutId = randomUUID();
  const { userId, clientId, clientName, type, objective, blocks } = req.body || {};
  if (!userId || !type || !objective) {
    return res.status(400).json({ error: "userId, type and objective are required" });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(
      `INSERT INTO treinos (id, user_id, client_id, client_name, type, objective, archived)
       VALUES (?, ?, ?, ?, ?, ?, false)`,
      [workoutId, userId, clientId || null, clientName || null, type, objective]
    );

    if (Array.isArray(blocks)) {
      for (let i = 0; i < blocks.length; i++) {
        const b = blocks[i];
        await conn.query(
          `INSERT INTO blocos_de_treino
           (treino_id, block_order, method, main_exercise_id, discharge_exercise_id, triplex_exercise_id, quadriplex_exercise_id, weight)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            workoutId,
            i + 1,
            b.method || null,
            b.mainExerciseId || null,
            b.dischargeExerciseId || null,
            b.triplexExerciseId || null,
            b.quadriplexExerciseId || null,
            b.weight || null,
          ]
        );
      }
    }
    await conn.commit();
    res.json({ id: workoutId });
  } catch (error) {
    await conn.rollback();
    res.status(500).json({ error: String(error) });
  } finally {
    conn.release();
  }
});

const distPath = path.resolve(process.cwd(), "dist");
app.use(express.static(distPath));
app.get("*", (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`GuFix API running on port ${PORT}`);
});

