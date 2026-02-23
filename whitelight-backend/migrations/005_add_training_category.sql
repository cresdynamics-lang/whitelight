-- Add 'training' category to products and product_categories
-- Run after 004_add_multiple_categories.sql (product_categories table must exist for the second ALTER).

USE whitelight_db;

-- 1. products.category: allow 'training' for create/update product
ALTER TABLE products MODIFY COLUMN category ENUM('running', 'trail', 'gym', 'basketball', 'accessories', 'training') NOT NULL;

-- 2. product_categories.category: allow 'training' for multi-category assignment
ALTER TABLE product_categories MODIFY COLUMN category ENUM('running', 'trail', 'gym', 'basketball', 'accessories', 'training') NOT NULL;
