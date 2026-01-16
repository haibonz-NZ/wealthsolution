-- Wealth Solution Database Schema
-- Version: 1.0
-- Created: 2026-01-10

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS `users` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `role` ENUM('user', 'admin') DEFAULT 'user',
  `member_level` ENUM('basic', 'professional', 'enterprise') DEFAULT 'basic',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Wealth Cases Table
CREATE TABLE IF NOT EXISTS `wealth_cases` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(200) NOT NULL,
  `description` TEXT,
  `status` ENUM('draft', 'in_progress', 'completed') DEFAULT 'draft',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Family Members Table
CREATE TABLE IF NOT EXISTS `family_members` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `case_id` BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `relation` VARCHAR(50) NOT NULL, -- Enum handled in app logic
  `age` INT DEFAULT 0,
  `gender` ENUM('male', 'female') DEFAULT 'male',
  `nationality` VARCHAR(100),
  `residence` VARCHAR(100),
  `health_status` VARCHAR(20) DEFAULT 'healthy',
  `parent_id` BIGINT UNSIGNED NULL, -- Recursive relation for tree
  `partner_id` BIGINT UNSIGNED NULL, -- Spousal relation
  `notes` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`case_id`) REFERENCES `wealth_cases`(`id`) ON DELETE CASCADE
  -- Self-referencing FKs can be added but require care with delete order
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Assets Table
CREATE TABLE IF NOT EXISTS `assets` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `case_id` BIGINT UNSIGNED NOT NULL,
  `type` VARCHAR(50) NOT NULL,
  `custom_type` VARCHAR(100),
  `location` VARCHAR(100),
  `holder_id` VARCHAR(50), -- Can be member_id or special string
  `holder_name` VARCHAR(100),
  `currency` VARCHAR(10) DEFAULT 'USD',
  `original_value` DECIMAL(20, 2),
  `value` DECIMAL(20, 2) NOT NULL,
  `value_in_usd` DECIMAL(20, 2), -- Cached conversion
  `income` DECIMAL(20, 2),
  `income_notes` VARCHAR(200),
  `notes` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`case_id`) REFERENCES `wealth_cases`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Pain Points Table
CREATE TABLE IF NOT EXISTS `pain_points` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `case_id` BIGINT UNSIGNED NOT NULL,
  `type` VARCHAR(50) NOT NULL,
  `description` TEXT,
  `priority` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`case_id`) REFERENCES `wealth_cases`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Generated Reports Table
CREATE TABLE IF NOT EXISTS `generated_reports` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `case_id` BIGINT UNSIGNED NOT NULL,
  `case_statement` MEDIUMTEXT, -- Markdown content
  `planning` MEDIUMTEXT,
  `full_report` MEDIUMTEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`case_id`) REFERENCES `wealth_cases`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Enable FK checks
SET FOREIGN_KEY_CHECKS = 1;
