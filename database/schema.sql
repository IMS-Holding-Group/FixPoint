CREATE TABLE IF NOT EXISTS department (
department_id INT AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(100) NOT NULL UNIQUE,
contact_email VARCHAR(120)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user (
user_id INT AUTO_INCREMENT PRIMARY KEY,
department_id INT NULL,
university_id VARCHAR(20) NOT NULL UNIQUE,
full_name VARCHAR(100) NOT NULL,
email VARCHAR(120) NOT NULL UNIQUE,
password_hash VARCHAR(255) NOT NULL,
role ENUM('REPORTER','STAFF','ADMIN') NOT NULL,
FOREIGN KEY (department_id) REFERENCES department(department_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS category (
category_id INT AUTO_INCREMENT PRIMARY KEY,
department_id INT NOT NULL,
name VARCHAR(80) NOT NULL UNIQUE,
default_priority ENUM('LOW','MEDIUM','HIGH','URGENT') NOT NULL,
FOREIGN KEY (department_id) REFERENCES department(department_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS building (
building_id INT AUTO_INCREMENT PRIMARY KEY,
code VARCHAR(10) NOT NULL UNIQUE,
name VARCHAR(100) NOT NULL,
latitude DECIMAL(9,6) NOT NULL,
longitude DECIMAL(9,6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS location (
location_id INT AUTO_INCREMENT PRIMARY KEY,
building_id INT NOT NULL,
floor VARCHAR(20) NOT NULL,
room_name VARCHAR(60),
FOREIGN KEY (building_id) REFERENCES building(building_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS report (
report_id INT AUTO_INCREMENT PRIMARY KEY,
reporter_id INT NOT NULL,
category_id INT NOT NULL,
location_id INT NOT NULL,
department_id INT NOT NULL,
assigned_to INT NULL,
description TEXT NOT NULL,
priority ENUM('LOW','MEDIUM','HIGH','URGENT') NOT NULL,
status ENUM('OPEN','IN_PROGRESS','CLOSED') NOT NULL DEFAULT 'OPEN',
latitude DECIMAL(9,6),
longitude DECIMAL(9,6),
created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
closed_at DATETIME NULL,
FOREIGN KEY (reporter_id) REFERENCES user(user_id),
FOREIGN KEY (category_id) REFERENCES category(category_id),
FOREIGN KEY (location_id) REFERENCES location(location_id),
FOREIGN KEY (department_id) REFERENCES department(department_id),
FOREIGN KEY (assigned_to) REFERENCES user(user_id),
INDEX idx_report_status (status),
INDEX idx_report_department (department_id),
INDEX idx_report_category (category_id),
INDEX idx_report_location (location_id),
INDEX idx_report_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS report_image (
image_id INT AUTO_INCREMENT PRIMARY KEY,
report_id INT NOT NULL,
storage_url VARCHAR(255) NOT NULL,
uploaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (report_id) REFERENCES report(report_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS status_history (
history_id INT AUTO_INCREMENT PRIMARY KEY,
report_id INT NOT NULL,
changed_by INT NOT NULL,
old_status ENUM('OPEN','IN_PROGRESS','CLOSED') NULL,
new_status ENUM('OPEN','IN_PROGRESS','CLOSED') NOT NULL,
note TEXT,
changed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (report_id) REFERENCES report(report_id),
FOREIGN KEY (changed_by) REFERENCES user(user_id),
INDEX idx_history_report (report_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS session (
session_id CHAR(64) PRIMARY KEY,
user_id INT NOT NULL,
csrf_token CHAR(64) NOT NULL,
created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
last_seen_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
expires_at DATETIME NOT NULL,
FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE,
INDEX idx_session_user (user_id),
INDEX idx_session_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS login_attempt (
attempt_id INT AUTO_INCREMENT PRIMARY KEY,
login_key VARCHAR(160) NOT NULL,
attempted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
succeeded TINYINT NOT NULL DEFAULT 0,
INDEX idx_login_key_time (login_key, attempted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;