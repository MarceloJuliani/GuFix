import "dotenv/config";
import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import path from "path";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = Number(process.env.PORT || 3000);
const MYSQL_HOST = process.env.MYSQL_HOST || process.env.DB_HOST;
const MYSQL_PORT = Number(process.env.MYSQL_PORT || process.env.DB_PORT || 3306);
const MYSQL_USER = process.env.MYSQL_USER || process.env.DB_USER;
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD;
const MYSQL_DATABASE = process.env.MYSQL_DATABASE || process.env.DB_NAME || "gufix_app";
const AUTH_SECRET = process.env.AUTH_SECRET || "gufix-local-secret";
const RP_NAME = process.env.WEBAUTHN_RP_NAME || "GuFix";
const RP_ID = process.env.WEBAUTHN_RP_ID || "localhost";
const RP_ORIGIN = process.env.WEBAUTHN_RP_ORIGIN || "http://localhost:3000";
const registrationChallenges = new Map<string, string>();
const authenticationChallenges = new Map<string, string>();

function toBase64Url(input: Uint8Array | Buffer) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64Url(input: string) {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  return new Uint8Array(Buffer.from(padded, "base64"));
}

type AuthUser = {
  id: string;
  email: string;
  fullName: string | null;
  role: "personal" | "student" | null;
};

function signToken(payload: AuthUser) {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const secret = Buffer.from(AUTH_SECRET).toString("base64url");
  return `${data}.${secret}`;
}

function parseToken(token?: string): AuthUser | null {
  if (!token) return null;
  const [data, secret] = token.split(".");
  if (!data || !secret) return null;
  const expectedSecret = Buffer.from(AUTH_SECRET).toString("base64url");
  if (secret !== expectedSecret) return null;
  try {
    return JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

if (!MYSQL_HOST || !MYSQL_USER || !MYSQL_PASSWORD) {
  console.warn(
    "MySQL env vars are missing. Set MYSQL_HOST/MYSQL_USER/MYSQL_PASSWORD or DB_HOST/DB_USER/DB_PASSWORD."
  );
}

const pool = mysql.createPool({
  host: MYSQL_HOST,
  port: MYSQL_PORT,
  user: MYSQL_USER,
  password: MYSQL_PASSWORD,
  database: MYSQL_DATABASE,
  connectionLimit: 10,
});

function getRequestUser(req: any) {
  const raw = String(req.headers.authorization || "");
  const token = raw.startsWith("Bearer ") ? raw.slice(7) : "";
  return parseToken(token);
}

function toDateOnly(value: any) {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

function parseJsonArray(value: any) {
  if (!value) return null;
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(String(value));
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function mapUser(row: any) {
  return {
    id: row.id,
    email: row.email,
    fullName: row.fullName || null,
    birthDate: toDateOnly(row.birthDate),
    objective: row.objective || null,
    role: row.role || null,
    lastWorkoutType: row.lastWorkoutType || null,
  };
}

function mapClient(row: any) {
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    email: row.email || "",
    phone: row.phone || "",
    birthDate: toDateOnly(row.birthDate),
    objective: row.objective || "",
    status: row.status || "Ativo",
    fee: row.fee == null ? null : Number(row.fee),
    appEnabled: Boolean(row.appEnabled),
    createdAt: row.createdAt,
    lastTrainingAt: row.lastTrainingAt || null,
    lastTrainingType: row.lastTrainingType || null,
  };
}

function mapExercise(row: any) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    subCategory: row.subCategory,
    description: row.description || "",
    videoUrl: row.videoUrl || "",
    uploaderId: row.uploaderId || null,
    createdAt: row.createdAt,
    isProtocol: Boolean(row.isProtocol),
    protocolExercises: parseJsonArray(row.protocolExercises) || undefined,
    status: row.status,
    suggestToGlobal: Boolean(row.suggestToGlobal),
  };
}

function mapWorkoutRow(row: any, blocks: any[] = []) {
  return {
    id: row.id,
    userId: row.userId,
    clientId: row.clientId || null,
    clientName: row.clientName || "",
    type: row.type,
    objective: row.objective,
    archived: Boolean(row.archived),
    createdAt: row.createdAt,
    blocks,
  };
}

function mapBlock(row: any) {
  return {
    id: Number(row.blockOrder || 0),
    method: row.method || undefined,
    mainExerciseId: row.mainExerciseId || "",
    dischargeExerciseId: row.dischargeExerciseId || "",
    triplexExerciseId: row.triplexExerciseId || "",
    quadriplexExerciseId: row.quadriplexExerciseId || "",
    customNotes: row.customNotes || "",
    weight: row.weight || "",
  };
}

function mapFinishedWorkout(row: any) {
  return {
    id: row.id,
    userId: row.userId,
    clientId: row.clientId,
    clientName: row.clientName || "",
    workoutId: row.workoutId,
    finishedAt: row.finishedAt,
  };
}

async function getDbUser(id: string) {
  const [rows] = await pool.query(
    `SELECT id, email, full_name as fullName, birth_date as birthDate, objective,
            role, last_workout_type as lastWorkoutType
     FROM usuarios WHERE id = ? LIMIT 1`,
    [id]
  );
  return Array.isArray(rows) ? (rows[0] as any) : null;
}

async function fetchWorkouts(whereSql: string, params: any[]) {
  const [rows] = await pool.query(
    `SELECT id, user_id as userId, client_id as clientId, client_name as clientName,
            type, objective, archived, created_at as createdAt
     FROM treinos ${whereSql} ORDER BY created_at DESC`,
    params
  );
  const workoutRows = Array.isArray(rows) ? (rows as any[]) : [];
  if (workoutRows.length === 0) return [];

  const ids = workoutRows.map((row) => row.id);
  const placeholders = ids.map(() => "?").join(",");
  const [blockRows] = await pool.query(
    `SELECT treino_id as workoutId, block_order as blockOrder, method,
            main_exercise_id as mainExerciseId, discharge_exercise_id as dischargeExerciseId,
            triplex_exercise_id as triplexExerciseId, quadriplex_exercise_id as quadriplexExerciseId,
            custom_notes as customNotes, weight
     FROM blocos_de_treino WHERE treino_id IN (${placeholders}) ORDER BY treino_id, block_order`,
    ids
  );

  const blocksByWorkout = new Map<string, any[]>();
  for (const row of Array.isArray(blockRows) ? (blockRows as any[]) : []) {
    const list = blocksByWorkout.get(row.workoutId) || [];
    list.push(mapBlock(row));
    blocksByWorkout.set(row.workoutId, list);
  }

  return workoutRows.map((row) => mapWorkoutRow(row, blocksByWorkout.get(row.id) || []));
}

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ ok: false, error: String(error) });
  }
});

app.post("/api/auth/biometric/register/options", async (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: "email is required" });

  const [rows] = await pool.query(
    `SELECT id, email, full_name as fullName FROM usuarios WHERE email = ? LIMIT 1`,
    [email]
  );
  const user = Array.isArray(rows) ? (rows[0] as any) : null;
  if (!user) return res.status(404).json({ error: "user not found" });

  const [credRows] = await pool.query(
    `SELECT credential_id as credentialId FROM webauthn_credentials WHERE user_id = ?`,
    [user.id]
  );

  const options = await generateRegistrationOptions({
    rpName: RP_NAME,
    rpID: RP_ID,
    userID: user.id,
    userName: user.email,
    userDisplayName: user.fullName || user.email,
    attestationType: "none",
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "required",
      authenticatorAttachment: "platform",
    },
    excludeCredentials: (Array.isArray(credRows) ? credRows : []).map((c: any) => ({
      id: c.credentialId,
      type: "public-key" as const,
    })),
  });

  registrationChallenges.set(user.id, options.challenge);
  res.json({ options, userId: user.id });
});

app.post("/api/auth/biometric/register/verify", async (req, res) => {
  const { userId, response } = req.body as { userId?: string; response?: any };
  if (!userId || !response) return res.status(400).json({ error: "userId and response are required" });

  const expectedChallenge = registrationChallenges.get(userId);
  if (!expectedChallenge) return res.status(400).json({ error: "registration challenge not found" });

  const verification = await verifyRegistrationResponse({
    response,
    expectedChallenge,
    expectedOrigin: RP_ORIGIN,
    expectedRPID: RP_ID,
    requireUserVerification: true,
  }).catch(() => null);

  if (!verification?.verified || !verification.registrationInfo) {
    return res.status(400).json({ verified: false, error: "registration verification failed" });
  }

  const info = verification.registrationInfo;
  await pool.query(
    `INSERT INTO webauthn_credentials (user_id, credential_id, public_key, counter, transports)
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       public_key = VALUES(public_key),
       counter = VALUES(counter),
       transports = VALUES(transports)`,
    [
      userId,
      info.credential.id,
      toBase64Url(info.credential.publicKey),
      Number(info.credential.counter || 0),
      JSON.stringify(response.response.transports || []),
    ]
  );

  registrationChallenges.delete(userId);
  res.json({ verified: true });
});

app.post("/api/auth/biometric/login/options", async (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: "email is required" });

  const [rows] = await pool.query(
    `SELECT id, email, full_name as fullName, role FROM usuarios WHERE email = ? LIMIT 1`,
    [email]
  );
  const user = Array.isArray(rows) ? (rows[0] as any) : null;
  if (!user) return res.status(404).json({ error: "user not found" });

  const [credRows] = await pool.query(
    `SELECT credential_id as credentialId, transports FROM webauthn_credentials WHERE user_id = ?`,
    [user.id]
  );

  const allowCredentials = (Array.isArray(credRows) ? credRows : []).map((c: any) => ({
    id: c.credentialId,
    type: "public-key" as const,
    transports: JSON.parse(c.transports || "[]") || [],
  }));

  if (allowCredentials.length === 0) {
    return res.status(400).json({ error: "no biometric credential registered for this user" });
  }

  const options = await generateAuthenticationOptions({
    rpID: RP_ID,
    allowCredentials,
    userVerification: "required",
  });

  authenticationChallenges.set(user.id, options.challenge);
  res.json({ options, userId: user.id });
});

app.post("/api/auth/biometric/login/verify", async (req, res) => {
  const { userId, response } = req.body as { userId?: string; response?: any };
  if (!userId || !response) return res.status(400).json({ error: "userId and response are required" });

  const expectedChallenge = authenticationChallenges.get(userId);
  if (!expectedChallenge) return res.status(400).json({ error: "authentication challenge not found" });

  const [rows] = await pool.query(
    `SELECT credential_id as credentialId, public_key as publicKey, counter, transports
     FROM webauthn_credentials WHERE user_id = ? AND credential_id = ? LIMIT 1`,
    [userId, response.id]
  );
  const dbCred = Array.isArray(rows) ? (rows[0] as any) : null;
  if (!dbCred) return res.status(404).json({ error: "credential not found" });

  const verification = await verifyAuthenticationResponse({
    response,
    expectedChallenge,
    expectedOrigin: RP_ORIGIN,
    expectedRPID: RP_ID,
    requireUserVerification: true,
    credential: {
      id: dbCred.credentialId,
      publicKey: fromBase64Url(dbCred.publicKey),
      counter: Number(dbCred.counter || 0),
      transports: JSON.parse(dbCred.transports || "[]") || [],
    },
  }).catch(() => null);

  if (!verification?.verified) {
    return res.status(400).json({ verified: false, error: "authentication verification failed" });
  }

  await pool.query(`UPDATE webauthn_credentials SET counter = ? WHERE credential_id = ?`, [
    Number(verification.authenticationInfo.newCounter || 0),
    dbCred.credentialId,
  ]);

  const [users] = await pool.query(
    `SELECT id, email, full_name as fullName, role FROM usuarios WHERE id = ? LIMIT 1`,
    [userId]
  );
  const row = Array.isArray(users) ? (users[0] as any) : null;
  if (!row) return res.status(404).json({ error: "user not found" });

  const user: AuthUser = {
    id: row.id,
    email: row.email,
    fullName: row.fullName || null,
    role: row.role || null,
  };

  const token = signToken(user);
  authenticationChallenges.delete(userId);
  res.json({ verified: true, token, user });
});

app.post("/api/auth/register", async (req, res) => {
  const { fullName, email, password, role } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }

  const [existingRows] = await pool.query("SELECT id FROM usuarios WHERE email = ? LIMIT 1", [email]);
  if (Array.isArray(existingRows) && existingRows.length > 0) {
    return res.status(409).json({ error: "email already registered" });
  }

  const id = randomUUID();
  const passwordHash = await bcrypt.hash(password, 10);
  await pool.query(
    `INSERT INTO usuarios (id, full_name, email, role, password_hash)
     VALUES (?, ?, ?, ?, ?)`,
    [id, fullName || null, email, role || "personal", passwordHash]
  );

  const user: AuthUser = { id, email, fullName: fullName || null, role: role || "personal" };
  const token = signToken(user);
  res.json({ token, user });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }

  const [rows] = await pool.query(
    `SELECT id, full_name as fullName, email, role, password_hash as passwordHash
     FROM usuarios WHERE email = ? LIMIT 1`,
    [email]
  );
  const row = Array.isArray(rows) ? (rows[0] as any) : null;
  if (!row) return res.status(401).json({ error: "invalid credentials" });

  const ok = await bcrypt.compare(password, row.passwordHash || "");
  if (!ok) return res.status(401).json({ error: "invalid credentials" });

  const user: AuthUser = {
    id: row.id,
    email: row.email,
    fullName: row.fullName || null,
    role: row.role || null,
  };
  const token = signToken(user);
  res.json({ token, user });
});

app.get("/api/auth/me", async (req, res) => {
  const tokenUser = getRequestUser(req);
  if (!tokenUser) return res.status(401).json({ error: "unauthorized" });

  const row = await getDbUser(tokenUser.id);
  if (!row) return res.status(401).json({ error: "unauthorized" });

  res.json({ user: mapUser(row) });
});

app.patch("/api/users/me", async (req, res) => {
  const authUser = getRequestUser(req);
  if (!authUser) return res.status(401).json({ error: "unauthorized" });

  const current = await getDbUser(authUser.id);
  if (!current) return res.status(404).json({ error: "user not found" });

  const { fullName, birthDate, objective, email, role, lastWorkoutType } = req.body || {};
  await pool.query(
    `UPDATE usuarios
     SET full_name = ?, birth_date = ?, objective = ?, email = ?, role = ?, last_workout_type = ?
     WHERE id = ?`,
    [
      fullName !== undefined ? fullName || null : current.fullName || null,
      birthDate !== undefined ? birthDate || null : toDateOnly(current.birthDate),
      objective !== undefined ? objective || null : current.objective || null,
      email !== undefined ? email || null : current.email || null,
      role !== undefined ? role || null : current.role || null,
      lastWorkoutType !== undefined ? lastWorkoutType || null : current.lastWorkoutType || null,
      authUser.id,
    ]
  );

  const updated = await getDbUser(authUser.id);
  res.json({ user: mapUser(updated) });
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
  const authUser = getRequestUser(req);
  if (!authUser) return res.status(401).json({ error: "unauthorized" });

  const [rows] = await pool.query(
    `SELECT id, user_id as userId, name, email, phone, birth_date as birthDate,
            objective, status, fee, app_enabled as appEnabled, created_at as createdAt,
            last_training_at as lastTrainingAt, last_training_type as lastTrainingType
     FROM clientes WHERE user_id = ? ORDER BY name`,
    [authUser.id]
  );
  res.json((Array.isArray(rows) ? rows : []).map(mapClient));
});

app.post("/api/clients", async (req, res) => {
  const authUser = getRequestUser(req);
  if (!authUser) return res.status(401).json({ error: "unauthorized" });

  const id = randomUUID();
  const { name, email, phone, birthDate, objective, fee, status } = req.body || {};
  if (!name) return res.status(400).json({ error: "name is required" });

  await pool.query(
    `INSERT INTO clientes (id, user_id, name, email, phone, birth_date, objective, fee, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      authUser.id,
      name,
      email || null,
      phone || null,
      birthDate || null,
      objective || null,
      Number(fee || 0),
      status || "Ativo",
    ]
  );

  const [rows] = await pool.query(
    `SELECT id, user_id as userId, name, email, phone, birth_date as birthDate,
            objective, status, fee, app_enabled as appEnabled, created_at as createdAt,
            last_training_at as lastTrainingAt, last_training_type as lastTrainingType
     FROM clientes WHERE id = ? LIMIT 1`,
    [id]
  );
  res.json(mapClient(Array.isArray(rows) ? (rows[0] as any) : {}));
});

app.patch("/api/clients/:id", async (req, res) => {
  const authUser = getRequestUser(req);
  if (!authUser) return res.status(401).json({ error: "unauthorized" });

  const id = String(req.params.id || "");
  const [currentRows] = await pool.query(
    `SELECT id, user_id as userId, name, email, phone, birth_date as birthDate,
            objective, status, fee, app_enabled as appEnabled, created_at as createdAt,
            last_training_at as lastTrainingAt, last_training_type as lastTrainingType
     FROM clientes WHERE id = ? AND user_id = ? LIMIT 1`,
    [id, authUser.id]
  );
  const current = Array.isArray(currentRows) ? (currentRows[0] as any) : null;
  if (!current) return res.status(404).json({ error: "client not found" });

  const { name, email, phone, birthDate, objective, fee, status, appEnabled } = req.body || {};
  await pool.query(
    `UPDATE clientes
     SET name = ?, email = ?, phone = ?, birth_date = ?, objective = ?,
         status = ?, fee = ?, app_enabled = ?
     WHERE id = ? AND user_id = ?`,
    [
      name !== undefined ? name : current.name,
      email !== undefined ? email || null : current.email || null,
      phone !== undefined ? phone || null : current.phone || null,
      birthDate !== undefined ? birthDate || null : toDateOnly(current.birthDate),
      objective !== undefined ? objective || null : current.objective || null,
      status !== undefined ? status : current.status,
      fee !== undefined ? Number(fee || 0) : Number(current.fee || 0),
      appEnabled !== undefined ? Boolean(appEnabled) : Boolean(current.appEnabled),
      id,
      authUser.id,
    ]
  );

  const [rows] = await pool.query(
    `SELECT id, user_id as userId, name, email, phone, birth_date as birthDate,
            objective, status, fee, app_enabled as appEnabled, created_at as createdAt,
            last_training_at as lastTrainingAt, last_training_type as lastTrainingType
     FROM clientes WHERE id = ? LIMIT 1`,
    [id]
  );
  res.json(mapClient(Array.isArray(rows) ? (rows[0] as any) : {}));
});

app.post("/api/clients/:id/enable-app", async (req, res) => {
  const authUser = getRequestUser(req);
  if (!authUser) return res.status(401).json({ error: "unauthorized" });

  const id = String(req.params.id || "");
  await pool.query(`UPDATE clientes SET app_enabled = true WHERE id = ? AND user_id = ?`, [id, authUser.id]);

  const [rows] = await pool.query(
    `SELECT id, user_id as userId, name, email, phone, birth_date as birthDate,
            objective, status, fee, app_enabled as appEnabled, created_at as createdAt,
            last_training_at as lastTrainingAt, last_training_type as lastTrainingType
     FROM clientes WHERE id = ? AND user_id = ? LIMIT 1`,
    [id, authUser.id]
  );
  const row = Array.isArray(rows) ? (rows[0] as any) : null;
  if (!row) return res.status(404).json({ error: "client not found" });
  res.json(mapClient(row));
});

app.get("/api/exercises", async (_req, res) => {
  const authUser = getRequestUser(_req);
  const [rows] = await pool.query(
    `SELECT id, name, category, sub_category as subCategory, description,
            video_url as videoUrl, uploader_id as uploaderId, created_at as createdAt,
            is_protocol as isProtocol, protocol_exercises as protocolExercises,
            status, suggest_to_global as suggestToGlobal
     FROM exercicios
     WHERE status = 'active' OR uploader_id = ?
     ORDER BY created_at DESC`,
    [authUser?.id || ""]
  );
  res.json((Array.isArray(rows) ? rows : []).map(mapExercise));
});

app.post("/api/exercises", async (req, res) => {
  const authUser = getRequestUser(req);
  if (!authUser) return res.status(401).json({ error: "unauthorized" });

  const id = randomUUID();
  const { name, category, subCategory, description, videoUrl, isProtocol, protocolExercises, suggestToGlobal } = req.body || {};
  if (!name || !category || !subCategory) {
    return res.status(400).json({ error: "name, category and subCategory are required" });
  }

  const status = suggestToGlobal ? "pending_moderation" : "active";
  await pool.query(
    `INSERT INTO exercicios
       (id, name, category, sub_category, description, video_url, uploader_id,
        is_protocol, protocol_exercises, status, suggest_to_global)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      name,
      category,
      subCategory,
      description || null,
      videoUrl || null,
      authUser.id,
      Boolean(isProtocol),
      Array.isArray(protocolExercises) ? JSON.stringify(protocolExercises) : null,
      status,
      Boolean(suggestToGlobal),
    ]
  );

  const [rows] = await pool.query(
    `SELECT id, name, category, sub_category as subCategory, description,
            video_url as videoUrl, uploader_id as uploaderId, created_at as createdAt,
            is_protocol as isProtocol, protocol_exercises as protocolExercises,
            status, suggest_to_global as suggestToGlobal
     FROM exercicios WHERE id = ? LIMIT 1`,
    [id]
  );
  res.json(mapExercise(Array.isArray(rows) ? (rows[0] as any) : {}));
});

app.delete("/api/exercises/:id", async (req, res) => {
  const authUser = getRequestUser(req);
  if (!authUser) return res.status(401).json({ error: "unauthorized" });

  const id = String(req.params.id || "");
  const [result] = await pool.query(`DELETE FROM exercicios WHERE id = ? AND uploader_id = ?`, [id, authUser.id]);
  if ((result as any).affectedRows === 0) return res.status(404).json({ error: "exercise not found" });
  res.json({ ok: true });
});

app.get("/api/workouts", async (req, res) => {
  const authUser = getRequestUser(req);
  if (!authUser) return res.status(401).json({ error: "unauthorized" });

  const role = String(req.query.role || authUser.role || "personal");
  const workouts = role === "student"
    ? await fetchWorkouts("WHERE client_id = ?", [authUser.id])
    : await fetchWorkouts("WHERE user_id = ?", [authUser.id]);
  res.json(workouts);
});

app.post("/api/workouts", async (req, res) => {
  const authUser = getRequestUser(req);
  if (!authUser) return res.status(401).json({ error: "unauthorized" });

  const workoutId = randomUUID();
  const { clientId, clientName, type, objective, blocks } = req.body || {};
  if (!type || !objective) {
    return res.status(400).json({ error: "type and objective are required" });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(
      `INSERT INTO treinos (id, user_id, client_id, client_name, type, objective, archived)
       VALUES (?, ?, ?, ?, ?, ?, false)`,
      [workoutId, authUser.id, clientId || null, clientName || null, type, objective]
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

    if (clientId) {
      await conn.query(
        `UPDATE clientes SET last_training_at = CURRENT_TIMESTAMP, last_training_type = ?
         WHERE id = ? AND user_id = ?`,
        [type, clientId, authUser.id]
      );
    }

    await conn.query(`UPDATE usuarios SET last_workout_type = ? WHERE id = ?`, [type, authUser.id]);
    await conn.commit();

    const [workout] = await fetchWorkouts("WHERE id = ? AND user_id = ?", [workoutId, authUser.id]);
    res.json(workout);
  } catch (error) {
    await conn.rollback();
    res.status(500).json({ error: String(error) });
  } finally {
    conn.release();
  }
});

app.delete("/api/workouts/:id", async (req, res) => {
  const authUser = getRequestUser(req);
  if (!authUser) return res.status(401).json({ error: "unauthorized" });

  const id = String(req.params.id || "");
  const [result] = await pool.query(`DELETE FROM treinos WHERE id = ? AND user_id = ?`, [id, authUser.id]);
  if ((result as any).affectedRows === 0) return res.status(404).json({ error: "workout not found" });
  res.json({ ok: true });
});

app.get("/api/finished-workouts", async (req, res) => {
  const authUser = getRequestUser(req);
  if (!authUser) return res.status(401).json({ error: "unauthorized" });

  const role = String(req.query.role || authUser.role || "personal");
  const [rows] = await pool.query(
    `SELECT id, user_id as userId, client_id as clientId, client_name as clientName,
            workout_id as workoutId, finished_at as finishedAt
     FROM treinos_finalizados
     WHERE ${role === "student" ? "client_id = ?" : "user_id = ?"}
     ORDER BY finished_at DESC`,
    [authUser.id]
  );
  res.json((Array.isArray(rows) ? rows : []).map(mapFinishedWorkout));
});

app.post("/api/finished-workouts", async (req, res) => {
  const authUser = getRequestUser(req);
  if (!authUser) return res.status(401).json({ error: "unauthorized" });

  const { workoutId, clientName } = req.body || {};
  if (!workoutId) return res.status(400).json({ error: "workoutId is required" });

  const [workout] = await fetchWorkouts("WHERE id = ? AND (client_id = ? OR user_id = ?)", [
    workoutId,
    authUser.id,
    authUser.id,
  ]);
  if (!workout) return res.status(404).json({ error: "workout not found" });

  const id = randomUUID();
  await pool.query(
    `INSERT INTO treinos_finalizados (id, user_id, client_id, client_name, workout_id, finished_at)
     VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    [
      id,
      workout.userId,
      workout.clientId || authUser.id,
      clientName || workout.clientName || authUser.email,
      workout.id,
    ]
  );

  const [rows] = await pool.query(
    `SELECT id, user_id as userId, client_id as clientId, client_name as clientName,
            workout_id as workoutId, finished_at as finishedAt
     FROM treinos_finalizados WHERE id = ? LIMIT 1`,
    [id]
  );
  res.json(mapFinishedWorkout(Array.isArray(rows) ? (rows[0] as any) : {}));
});

app.get("/api/billing", async (req, res) => {
  const authUser = getRequestUser(req);
  if (!authUser) return res.status(401).json({ error: "unauthorized" });

  await pool.query(
    `INSERT INTO faturamento (user_id, subscription_cost)
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE subscription_cost = subscription_cost`,
    [authUser.id, 99.9]
  );

  const [rows] = await pool.query(
    `SELECT subscription_cost as subscriptionCost FROM faturamento WHERE user_id = ? LIMIT 1`,
    [authUser.id]
  );
  const row = Array.isArray(rows) ? (rows[0] as any) : null;
  res.json({ subscriptionCost: Number(row?.subscriptionCost || 99.9) });
});

const distPath = path.resolve(process.cwd(), "dist");
app.use(express.static(distPath));
app.get("*", (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`GuFix API running on port ${PORT}`);
});
