-- Banco de dados MySQL para o aplicativo GuFix
-- Modelagem baseada nas coleções Firestore usadas no app

CREATE DATABASE IF NOT EXISTS gufix_app
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE gufix_app;

-- Usuários do sistema (profissionais e alunos)
CREATE TABLE IF NOT EXISTS usuarios (
  id VARCHAR(128) NOT NULL PRIMARY KEY,
  full_name VARCHAR(255) NULL,
  birth_date DATE NULL,
  objective VARCHAR(80) NULL,
  email VARCHAR(255) NULL,
  role ENUM('personal', 'student') NULL,
  password_hash VARCHAR(255) NULL,
  last_workout_type VARCHAR(80) NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY idx_usuarios_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Usuario inicial para acesso ao sistema
SET @seed_mjuliani25_id = COALESCE(
  (SELECT id FROM usuarios WHERE email = 'mjuliani25@gmail.com' LIMIT 1),
  '8d0a6ea6-9d1f-4c59-a4db-fdcd9647b208'
);

INSERT INTO usuarios (id, full_name, email, role, password_hash)
VALUES (
  @seed_mjuliani25_id,
  'Marcelo Juliani',
  'mjuliani25@gmail.com',
  'personal',
  '$2b$10$hctZFB.fdEazSxMKOeLEHuydzJRkGWNJdTHYqKT1GyMLFru9/Zfem'
)
ON DUPLICATE KEY UPDATE
  full_name = VALUES(full_name),
  email = VALUES(email),
  role = VALUES(role),
  password_hash = VALUES(password_hash);

CREATE TABLE IF NOT EXISTS webauthn_credentials (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(128) NOT NULL,
  credential_id VARCHAR(255) NOT NULL UNIQUE,
  public_key TEXT NOT NULL,
  counter BIGINT NOT NULL DEFAULT 0,
  transports JSON NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_webauthn_user FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Clientes atendidos pelo profissional
CREATE TABLE IF NOT EXISTS clientes (
  id VARCHAR(128) NOT NULL PRIMARY KEY,
  user_id VARCHAR(128) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NULL,
  phone VARCHAR(50) NULL,
  birth_date DATE NULL,
  objective VARCHAR(80) NULL,
  status ENUM('Ativo', 'Inativo') NOT NULL DEFAULT 'Ativo',
  fee DECIMAL(10,2) NULL,
  app_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_training_at DATETIME NULL,
  last_training_type VARCHAR(80) NULL,
  CONSTRAINT fk_client_user FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Biblioteca de exercícios
CREATE TABLE IF NOT EXISTS exercicios (
  id VARCHAR(128) NOT NULL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(80) NOT NULL,
  sub_category VARCHAR(80) NOT NULL,
  description TEXT NULL,
  video_url VARCHAR(512) NULL,
  uploader_id VARCHAR(128) NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_protocol BOOLEAN NOT NULL DEFAULT FALSE,
  protocol_exercises JSON NULL,
  status ENUM('active', 'pending_moderation') NOT NULL DEFAULT 'active',
  suggest_to_global BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT fk_exercise_uploader FOREIGN KEY (uploader_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Treinos prescritos ou salvos pelo profissional
CREATE TABLE IF NOT EXISTS treinos (
  id VARCHAR(128) NOT NULL PRIMARY KEY,
  user_id VARCHAR(128) NOT NULL,
  client_id VARCHAR(128) NULL,
  client_name VARCHAR(255) NULL,
  type VARCHAR(80) NOT NULL,
  objective VARCHAR(80) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  archived BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT fk_workout_user FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  CONSTRAINT fk_workout_client FOREIGN KEY (client_id) REFERENCES clientes(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Blocos de treino dentro de cada treino
CREATE TABLE IF NOT EXISTS blocos_de_treino (
  id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
  treino_id VARCHAR(128) NOT NULL,
  block_order INT NOT NULL,
  method ENUM('Simples', 'Biplex', 'Triplex', 'Quadriplex') NULL,
  main_exercise_id VARCHAR(128) NULL,
  discharge_exercise_id VARCHAR(128) NULL,
  triplex_exercise_id VARCHAR(128) NULL,
  quadriplex_exercise_id VARCHAR(128) NULL,
  custom_notes TEXT NULL,
  weight VARCHAR(80) NULL,
  CONSTRAINT fk_block_workout FOREIGN KEY (treino_id) REFERENCES treinos(id) ON DELETE CASCADE,
  CONSTRAINT fk_block_main_exercise FOREIGN KEY (main_exercise_id) REFERENCES exercicios(id) ON DELETE SET NULL,
  CONSTRAINT fk_block_discharge_exercise FOREIGN KEY (discharge_exercise_id) REFERENCES exercicios(id) ON DELETE SET NULL,
  CONSTRAINT fk_block_triplex_exercise FOREIGN KEY (triplex_exercise_id) REFERENCES exercicios(id) ON DELETE SET NULL,
  CONSTRAINT fk_block_quadriplex_exercise FOREIGN KEY (quadriplex_exercise_id) REFERENCES exercicios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Histórico de treinos finalizados pelos alunos
CREATE TABLE IF NOT EXISTS treinos_finalizados (
  id VARCHAR(128) NOT NULL PRIMARY KEY,
  user_id VARCHAR(128) NOT NULL,
  client_id VARCHAR(128) NOT NULL,
  client_name VARCHAR(255) NULL,
  workout_id VARCHAR(128) NOT NULL,
  finished_at DATETIME NOT NULL,
  CONSTRAINT fk_finished_user FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  CONSTRAINT fk_finished_workout FOREIGN KEY (workout_id) REFERENCES treinos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Faturamento / informações de cobrança do profissional
CREATE TABLE IF NOT EXISTS faturamento (
  user_id VARCHAR(128) NOT NULL PRIMARY KEY,
  subscription_cost DECIMAL(10,2) NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_billing_user FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Anamnese clínica e de hábitos do aluno
CREATE TABLE IF NOT EXISTS anamneses (
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
  CONSTRAINT fk_anamnese_user FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  CONSTRAINT fk_anamnese_client FOREIGN KEY (client_id) REFERENCES clientes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Avaliações e evolução corporal
CREATE TABLE IF NOT EXISTS avaliacoes_fisicas (
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
  CONSTRAINT fk_evaluation_user FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  CONSTRAINT fk_evaluation_client FOREIGN KEY (client_id) REFERENCES clientes(id) ON DELETE CASCADE,
  KEY idx_evaluation_client_date (client_id, evaluation_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Controle financeiro da consultoria
CREATE TABLE IF NOT EXISTS pagamentos (
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
  CONSTRAINT fk_payment_user FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  CONSTRAINT fk_payment_client FOREIGN KEY (client_id) REFERENCES clientes(id) ON DELETE CASCADE,
  KEY idx_payment_user_due (user_id, due_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Feedback obrigatório/opcional após treino
CREATE TABLE IF NOT EXISTS feedbacks_treino (
  id VARCHAR(128) NOT NULL PRIMARY KEY,
  user_id VARCHAR(128) NOT NULL,
  client_id VARCHAR(128) NOT NULL,
  workout_id VARCHAR(128) NULL,
  rating INT NOT NULL,
  effort_level INT NULL,
  pain_level INT NULL,
  comment TEXT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_feedback_user FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  CONSTRAINT fk_feedback_client FOREIGN KEY (client_id) REFERENCES clientes(id) ON DELETE CASCADE,
  CONSTRAINT fk_feedback_workout FOREIGN KEY (workout_id) REFERENCES treinos(id) ON DELETE SET NULL,
  KEY idx_feedback_user_created (user_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
