-- Migração para bancos GuFix já existentes.
-- Rode depois de selecionar/criar o banco, por exemplo:
-- mysql -u usuario -p nome_do_banco < mysql-migration.sql

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
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
  CONSTRAINT fk_client_user_migration FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
  CONSTRAINT fk_exercise_uploader_migration FOREIGN KEY (uploader_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS treinos (
  id VARCHAR(128) NOT NULL PRIMARY KEY,
  user_id VARCHAR(128) NOT NULL,
  client_id VARCHAR(128) NULL,
  client_name VARCHAR(255) NULL,
  type VARCHAR(80) NOT NULL,
  objective VARCHAR(80) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  archived BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT fk_workout_user_migration FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  CONSTRAINT fk_workout_client_migration FOREIGN KEY (client_id) REFERENCES clientes(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
  CONSTRAINT fk_block_workout_migration FOREIGN KEY (treino_id) REFERENCES treinos(id) ON DELETE CASCADE,
  CONSTRAINT fk_block_main_exercise_migration FOREIGN KEY (main_exercise_id) REFERENCES exercicios(id) ON DELETE SET NULL,
  CONSTRAINT fk_block_discharge_exercise_migration FOREIGN KEY (discharge_exercise_id) REFERENCES exercicios(id) ON DELETE SET NULL,
  CONSTRAINT fk_block_triplex_exercise_migration FOREIGN KEY (triplex_exercise_id) REFERENCES exercicios(id) ON DELETE SET NULL,
  CONSTRAINT fk_block_quadriplex_exercise_migration FOREIGN KEY (quadriplex_exercise_id) REFERENCES exercicios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP PROCEDURE IF EXISTS add_column_if_missing;
DROP PROCEDURE IF EXISTS add_index_if_missing;

DELIMITER $$

CREATE PROCEDURE add_column_if_missing(
  IN table_name_input VARCHAR(64),
  IN column_name_input VARCHAR(64),
  IN column_definition_input TEXT
)
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = table_name_input
      AND COLUMN_NAME = column_name_input
  ) THEN
    SET @ddl = CONCAT('ALTER TABLE `', table_name_input, '` ADD COLUMN ', column_definition_input);
    PREPARE stmt FROM @ddl;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END$$

CREATE PROCEDURE add_index_if_missing(
  IN table_name_input VARCHAR(64),
  IN index_name_input VARCHAR(64),
  IN index_definition_input TEXT
)
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = table_name_input
      AND INDEX_NAME = index_name_input
  ) THEN
    SET @ddl = CONCAT('ALTER TABLE `', table_name_input, '` ADD ', index_definition_input);
    PREPARE stmt FROM @ddl;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END$$

DELIMITER ;

CALL add_column_if_missing('usuarios', 'full_name', 'full_name VARCHAR(255) NULL');
CALL add_column_if_missing('usuarios', 'birth_date', 'birth_date DATE NULL');
CALL add_column_if_missing('usuarios', 'objective', 'objective VARCHAR(80) NULL');
CALL add_column_if_missing('usuarios', 'email', 'email VARCHAR(255) NULL');
CALL add_column_if_missing('usuarios', 'role', 'role ENUM(''personal'', ''student'') NULL');
CALL add_column_if_missing('usuarios', 'password_hash', 'password_hash VARCHAR(255) NULL');
CALL add_column_if_missing('usuarios', 'last_workout_type', 'last_workout_type VARCHAR(80) NULL');
CALL add_index_if_missing('usuarios', 'idx_usuarios_email', 'UNIQUE KEY idx_usuarios_email (email)');

CALL add_column_if_missing('clientes', 'phone', 'phone VARCHAR(50) NULL');
CALL add_column_if_missing('clientes', 'birth_date', 'birth_date DATE NULL');
CALL add_column_if_missing('clientes', 'objective', 'objective VARCHAR(80) NULL');
CALL add_column_if_missing('clientes', 'status', 'status ENUM(''Ativo'', ''Inativo'') NOT NULL DEFAULT ''Ativo''');
CALL add_column_if_missing('clientes', 'fee', 'fee DECIMAL(10,2) NULL');
CALL add_column_if_missing('clientes', 'app_enabled', 'app_enabled BOOLEAN NOT NULL DEFAULT FALSE');
CALL add_column_if_missing('clientes', 'last_training_at', 'last_training_at DATETIME NULL');
CALL add_column_if_missing('clientes', 'last_training_type', 'last_training_type VARCHAR(80) NULL');

CALL add_column_if_missing('exercicios', 'description', 'description TEXT NULL');
CALL add_column_if_missing('exercicios', 'is_protocol', 'is_protocol BOOLEAN NOT NULL DEFAULT FALSE');
CALL add_column_if_missing('exercicios', 'protocol_exercises', 'protocol_exercises JSON NULL');
CALL add_column_if_missing('exercicios', 'status', 'status ENUM(''active'', ''pending_moderation'') NOT NULL DEFAULT ''active''');
CALL add_column_if_missing('exercicios', 'suggest_to_global', 'suggest_to_global BOOLEAN NOT NULL DEFAULT FALSE');

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

CREATE TABLE IF NOT EXISTS faturamento (
  user_id VARCHAR(128) NOT NULL PRIMARY KEY,
  subscription_cost DECIMAL(10,2) NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_billing_user FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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

DROP PROCEDURE add_column_if_missing;
DROP PROCEDURE add_index_if_missing;
