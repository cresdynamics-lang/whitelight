-- Add accessories category to products table
-- Run this script to update the existing database

USE whitelight_db;

-- Modify the category ENUM to include 'accessories'
ALTER TABLE products MODIFY COLUMN category ENUM('running', 'trail', 'gym', 'basketball', 'accessories') NOT NULL;