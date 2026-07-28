import type { Pool } from "mysql2/promise";

type ColumnMigration = {
  table: string;
  column: string;
  definition: string;
};

const columns: ColumnMigration[] = [
  { table: "usuarios", column: "full_name", definition: "VARCHAR(255) NULL" },
  { table: "usuarios", column: "birth_date", definition: "DATE NULL" },
  { table: "usuarios", column: "objective", definition: "VARCHAR(80) NULL" },
  { table: "usuarios", column: "email", definition: "VARCHAR(255) NULL" },
  { table: "usuarios", column: "role", definition: "ENUM('admin', 'personal', 'student') NULL" },
  { table: "usuarios", column: "password_hash", definition: "VARCHAR(255) NULL" },
  { table: "usuarios", column: "last_workout_type", definition: "VARCHAR(80) NULL" },
  { table: "clientes", column: "phone", definition: "VARCHAR(50) NULL" },
  { table: "clientes", column: "birth_date", definition: "DATE NULL" },
  { table: "clientes", column: "objective", definition: "VARCHAR(80) NULL" },
  { table: "clientes", column: "status", definition: "ENUM('Ativo', 'Inativo') NOT NULL DEFAULT 'Ativo'" },
  { table: "clientes", column: "fee", definition: "DECIMAL(10,2) NULL" },
  { table: "clientes", column: "app_enabled", definition: "BOOLEAN NOT NULL DEFAULT FALSE" },
  { table: "clientes", column: "last_training_at", definition: "DATETIME NULL" },
  { table: "clientes", column: "last_training_type", definition: "VARCHAR(80) NULL" },
  { table: "exercicios", column: "description", definition: "TEXT NULL" },
  { table: "exercicios", column: "is_protocol", definition: "BOOLEAN NOT NULL DEFAULT FALSE" },
  { table: "exercicios", column: "protocol_exercises", definition: "JSON NULL" },
  { table: "exercicios", column: "status", definition: "ENUM('active', 'pending_moderation') NOT NULL DEFAULT 'active'" },
  { table: "exercicios", column: "suggest_to_global", definition: "BOOLEAN NOT NULL DEFAULT FALSE" },
  { table: "treinos", column: "client_id", definition: "VARCHAR(128) NULL" },
  { table: "treinos", column: "client_name", definition: "VARCHAR(255) NULL" },
  { table: "treinos", column: "archived", definition: "BOOLEAN NOT NULL DEFAULT FALSE" },
  { table: "blocos_de_treino", column: "method", definition: "ENUM('Simples', 'Biplex', 'Triplex', 'Quadriplex') NULL" },
  { table: "blocos_de_treino", column: "discharge_exercise_id", definition: "VARCHAR(128) NULL" },
  { table: "blocos_de_treino", column: "triplex_exercise_id", definition: "VARCHAR(128) NULL" },
  { table: "blocos_de_treino", column: "quadriplex_exercise_id", definition: "VARCHAR(128) NULL" },
  { table: "blocos_de_treino", column: "custom_notes", definition: "TEXT NULL" },
  { table: "blocos_de_treino", column: "weight", definition: "VARCHAR(80) NULL" },
];

const createTableStatements = [
  `CREATE TABLE IF NOT EXISTS webauthn_credentials (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(128) NOT NULL,
    credential_id VARCHAR(255) NOT NULL UNIQUE,
    public_key TEXT NOT NULL,
    counter BIGINT NOT NULL DEFAULT 0,
    transports JSON NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_webauthn_user_auto FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS treinos_finalizados (
    id VARCHAR(128) NOT NULL PRIMARY KEY,
    user_id VARCHAR(128) NOT NULL,
    client_id VARCHAR(128) NOT NULL,
    client_name VARCHAR(255) NULL,
    workout_id VARCHAR(128) NOT NULL,
    finished_at DATETIME NOT NULL,
    CONSTRAINT fk_finished_user_auto FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT fk_finished_workout_auto FOREIGN KEY (workout_id) REFERENCES treinos(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS faturamento (
    user_id VARCHAR(128) NOT NULL PRIMARY KEY,
    subscription_cost DECIMAL(10,2) NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_billing_user_auto FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS anamneses (
    id VARCHAR(128) NOT NULL PRIMARY KEY,
    user_id VARCHAR(128) NOT NULL,
    client_id VARCHAR(128) NOT NULL,
    goal TEXT NULL,
    medical_conditions TEXT NULL,
    medications TEXT NULL,
    injuries TEXT NULL,
    experience_level ENUM('Iniciante', 'Intermediário', 'Avançado') NOT NULL DEFAULT 'Iniciante',
    weekly_frequency INT NOT NULL DEFAULT 3,
    sleep_hours DECIMAL(4,1) NULL,
    stress_level INT NULL,
    notes TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY idx_anamnese_client (user_id, client_id),
    CONSTRAINT fk_anamnese_user_auto FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT fk_anamnese_client_auto FOREIGN KEY (client_id) REFERENCES clientes(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS avaliacoes_fisicas (
    id VARCHAR(128) NOT NULL PRIMARY KEY,
    user_id VARCHAR(128) NOT NULL,
    client_id VARCHAR(128) NOT NULL,
    evaluation_date DATE NOT NULL,
    weight DECIMAL(7,2) NULL,
    height DECIMAL(7,2) NULL,
    body_fat DECIMAL(5,2) NULL,
    chest DECIMAL(7,2) NULL,
    waist DECIMAL(7,2) NULL,
    hip DECIMAL(7,2) NULL,
    arm DECIMAL(7,2) NULL,
    thigh DECIMAL(7,2) NULL,
    resting_heart_rate INT NULL,
    notes TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_evaluation_user_auto FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT fk_evaluation_client_auto FOREIGN KEY (client_id) REFERENCES clientes(id) ON DELETE CASCADE,
    KEY idx_evaluation_client_date (client_id, evaluation_date)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS pagamentos (
    id VARCHAR(128) NOT NULL PRIMARY KEY,
    user_id VARCHAR(128) NOT NULL,
    client_id VARCHAR(128) NOT NULL,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    due_date DATE NOT NULL,
    paid_at DATETIME NULL,
    status ENUM('Pendente', 'Pago', 'Atrasado', 'Cancelado') NOT NULL DEFAULT 'Pendente',
    payment_method ENUM('Pix', 'Dinheiro', 'Cartão', 'Boleto', 'Outro') NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_payment_user_auto FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT fk_payment_client_auto FOREIGN KEY (client_id) REFERENCES clientes(id) ON DELETE CASCADE,
    KEY idx_payment_user_due (user_id, due_date)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS feedbacks_treino (
    id VARCHAR(128) NOT NULL PRIMARY KEY,
    user_id VARCHAR(128) NOT NULL,
    client_id VARCHAR(128) NOT NULL,
    workout_id VARCHAR(128) NULL,
    rating INT NOT NULL,
    effort_level INT NULL,
    pain_level INT NULL,
    comment TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_feedback_user_auto FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT fk_feedback_client_auto FOREIGN KEY (client_id) REFERENCES clientes(id) ON DELETE CASCADE,
    CONSTRAINT fk_feedback_workout_auto FOREIGN KEY (workout_id) REFERENCES treinos(id) ON DELETE SET NULL,
    KEY idx_feedback_user_created (user_id, created_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
];

function assertIdentifier(value: string) {
  if (!/^[a-z0-9_]+$/i.test(value)) throw new Error(`Invalid SQL identifier: ${value}`);
  return `\`${value}\``;
}

async function ensureColumn(pool: Pool, migration: ColumnMigration) {
  const [rows] = await pool.query(
    `SELECT 1 FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ? LIMIT 1`,
    [migration.table, migration.column]
  );
  if (Array.isArray(rows) && rows.length > 0) return;

  const table = assertIdentifier(migration.table);
  const column = assertIdentifier(migration.column);
  await pool.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${migration.definition}`);
  console.log(`Database migration: added ${migration.table}.${migration.column}`);
}

export async function ensureDatabaseSchema(pool: Pool) {
  for (const migration of columns) await ensureColumn(pool, migration);
  for (const statement of createTableStatements) await pool.query(statement);

  await pool.query("ALTER TABLE usuarios MODIFY COLUMN role ENUM('admin', 'personal', 'student') NULL");
  await pool.query("UPDATE usuarios SET role = 'admin' WHERE LOWER(TRIM(email)) = ?", ["mjuliani25@gmail.com"]);
}
