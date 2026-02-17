-- Migration: Add support for multiple categories per product
-- Creates a junction table to allow products to belong to multiple categories

USE whitelight_db;

-- Create product_categories junction table
CREATE TABLE IF NOT EXISTS product_categories (
    id VARCHAR(50) PRIMARY KEY,
    product_id VARCHAR(50) NOT NULL,
    category ENUM('running', 'trail', 'gym', 'basketball', 'accessories') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_product_category (product_id, category),
    INDEX idx_category (category),
    INDEX idx_product_id (product_id)
);

-- Migrate existing single category data to junction table
INSERT INTO product_categories (id, product_id, category)
SELECT 
    CONCAT(product_id, '-', category, '-', UNIX_TIMESTAMP()) as id,
    id as product_id,
    category
FROM products
ON DUPLICATE KEY UPDATE id=id;

-- Note: Keep the category column in products table for backward compatibility
-- It will store the primary category, but products can now have multiple categories
