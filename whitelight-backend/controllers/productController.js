const { pool } = require('../config/database');
const spacesService = require('../services/spacesService');
const multer = require('multer');

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

class ProductController {
  // Create new product
  async createProduct(req, res) {
    let connection;
    try {
      connection = await pool.getConnection();
      await connection.beginTransaction();

      const {
        name, brand, category, categories, price, originalPrice,
        description, tags, isNew, isBestSeller, isOnOffer, variants, imageUrls
      } = req.body;

      // Parse categories from JSON string if needed
      let parsedCategories = categories;
      if (categories && typeof categories === 'string') {
        try {
          parsedCategories = JSON.parse(categories);
        } catch (e) {
          parsedCategories = category ? [category] : [];
        }
      }
      if (!parsedCategories || parsedCategories.length === 0) {
        parsedCategories = category ? [category] : [];
      }

      // Validate required fields
      if (!name || !brand || parsedCategories.length === 0 || price === undefined || price === null || price === '') {
        try { await connection.rollback(); } catch (e) { /* ignore */ }
        connection.release();
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: name, brand, at least one category, and price are required',
          error: 'VALIDATION_ERROR'
        });
      }
      
      // Use first category as primary category for backward compatibility
      const primaryCategory = parsedCategories[0];

      const productId = Date.now().toString();
      let slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'product';
      // Ensure slug is unique (DB has UNIQUE on slug)
      const [existing] = await connection.execute('SELECT id FROM products WHERE slug = ?', [slug]);
      if (existing && existing.length > 0) {
        slug = `${slug}-${productId}`;
      }

      // Parse variants from JSON string if needed
      let parsedVariants = variants;
      if (typeof variants === 'string') {
        try {
          parsedVariants = JSON.parse(variants);
        } catch (e) {
          parsedVariants = [];
        }
      }

      // Parse tags from JSON string if needed
      let parsedTags = tags;
      if (typeof tags === 'string') {
        try {
          parsedTags = JSON.parse(tags);
        } catch (e) {
          parsedTags = [];
        }
      }

      // Insert product with all data (use primary category)
      await connection.execute(
        `INSERT INTO products (id, slug, name, brand, category, price, original_price, 
         description, tags, is_new, is_best_seller, is_on_offer) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          productId, slug, name, brand, primaryCategory, price, originalPrice || null,
          description, JSON.stringify(parsedTags), isNew === 'true' || isNew === true, 
          isBestSeller === 'true' || isBestSeller === true, isOnOffer === 'true' || isOnOffer === true
        ]
      );

      // Handle image URLs (pre-uploaded images) or file uploads
      const uploadedImages = [];
      
      // First, handle pre-uploaded image URLs
      if (imageUrls && typeof imageUrls === 'string') {
        try {
          const parsedUrls = JSON.parse(imageUrls);
          if (Array.isArray(parsedUrls) && parsedUrls.length > 0) {
            for (let i = 0; i < parsedUrls.length; i++) {
              const imageUrl = parsedUrls[i];
              if (imageUrl && typeof imageUrl === 'string') {
                const imageId = `${productId}-url-${i + 1}`;
                await connection.execute(
                  'INSERT INTO product_images (id, product_id, url, alt_text) VALUES (?, ?, ?, ?)',
                  [imageId, productId, imageUrl, name]
                );
                uploadedImages.push(imageUrl);
                console.log(`✅ Pre-uploaded image ${i + 1} saved: ${imageUrl}`);
              }
            }
          }
        } catch (e) {
          console.error('Error parsing imageUrls:', e);
        }
      }
      
      // Then handle file uploads (if any files are sent)
      if (req.files && req.files.length > 0) {
        console.log(`📸 Starting upload of ${req.files.length} new images...`);
        let fileIndex = uploadedImages.length;
        for (let i = 0; i < req.files.length; i++) {
          const file = req.files[i];
          try {
            const uploadResult = await spacesService.uploadFile(file, 'products');
            
            if (uploadResult.success) {
              const imageId = `${productId}-${fileIndex + 1}`;
              await connection.execute(
                'INSERT INTO product_images (id, product_id, url, alt_text) VALUES (?, ?, ?, ?)',
                [imageId, productId, uploadResult.url, name]
              );
              uploadedImages.push(uploadResult.url);
              console.log(`✅ Image ${i + 1}/${req.files.length} uploaded: ${uploadResult.url}`);
              fileIndex++;
            } else {
              console.error(`❌ Failed to upload image ${i + 1}/${req.files.length}:`, uploadResult.error);
              // Continue with other images even if one fails
            }
          } catch (error) {
            console.error(`❌ Error uploading image ${i + 1}/${req.files.length}:`, error.message);
            // Continue with other images even if one fails
          }
        }
        console.log(`📸 Upload complete: ${uploadedImages.length} total images saved to database`);
      }

      // Insert categories into junction table
      if (parsedCategories && parsedCategories.length > 0) {
        for (const cat of parsedCategories) {
          const categoryId = `${productId}-${cat}-${Date.now()}`;
          try {
            await connection.execute(
              'INSERT INTO product_categories (id, product_id, category) VALUES (?, ?, ?)',
              [categoryId, productId, cat]
            );
          } catch (e) {
            // Ignore duplicate category errors
            if (!e.message.includes('Duplicate entry')) {
              console.error('Error inserting category:', e);
            }
          }
        }
      }

      // Insert variants with proper data handling
      if (parsedVariants && parsedVariants.length > 0) {
        // Remove duplicate sizes
        const uniqueVariants = parsedVariants.filter((variant, index, self) => 
          index === self.findIndex(v => v.size === variant.size)
        );
        
        for (let i = 0; i < uniqueVariants.length; i++) {
          const variant = uniqueVariants[i];
          const variantId = `${productId}-${variant.size}-${i}`;
          await connection.execute(
            'INSERT INTO product_variants (id, product_id, size, in_stock, stock_quantity) VALUES (?, ?, ?, ?, ?)',
            [variantId, productId, variant.size, variant.inStock !== false, variant.stockQuantity || 10]
          );
        }
      } else {
        // Create default variants if none provided
        const defaultSizes = [40, 41, 42, 43, 44];
        for (let i = 0; i < defaultSizes.length; i++) {
          const size = defaultSizes[i];
          const variantId = `${productId}-${size}-${i}`;
          await connection.execute(
            'INSERT INTO product_variants (id, product_id, size, in_stock, stock_quantity) VALUES (?, ?, ?, ?, ?)',
            [variantId, productId, size, true, 10]
          );
        }
      }

      await connection.commit();

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: { id: productId, slug }
      });

    } catch (error) {
      if (connection) {
        try { await connection.rollback(); } catch (e) { /* ignore */ }
      }
      console.error('Create product error:', error);
      console.error('Error stack:', error.stack);
      const errorMessage = error.message || 'Unknown error occurred';
      res.status(500).json({
        success: false,
        message: 'Failed to create product',
        error: process.env.NODE_ENV === 'development' ? errorMessage : 'An error occurred while creating the product. Please try again with fewer images or check file sizes.'
      });
    } finally {
      if (connection) connection.release();
    }
  }

  // Update product
  async updateProduct(req, res) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      const { id } = req.params;
      const {
        name, brand, category, categories, price, originalPrice,
        description, tags, isNew, isBestSeller, isOnOffer, variants
      } = req.body;

      console.log('✏️ Update product request - ID:', id);
      console.log('📝 Request body:', JSON.stringify(req.body, null, 2));
      console.log('📸 Files:', req.files ? req.files.length : 0);

      // Parse categories array from JSON string if needed
      let parsedCategories = categories;
      if (typeof categories === 'string') {
        try {
          parsedCategories = JSON.parse(categories);
        } catch (e) {
          parsedCategories = category ? [category] : [];
        }
      }
      // Fallback to single category if no categories array provided
      if (!parsedCategories || parsedCategories.length === 0) {
        parsedCategories = category ? [category] : [];
      }

      // Parse variants and tags from FormData
      let parsedVariants = variants;
      if (typeof variants === 'string') {
        try {
          parsedVariants = JSON.parse(variants);
        } catch (e) {
          parsedVariants = null;
        }
      }

      let parsedTags = tags;
      if (typeof tags === 'string') {
        try {
          parsedTags = JSON.parse(tags);
        } catch (e) {
          parsedTags = [];
        }
      }

      // Parse images to delete
      let imagesToDelete = req.body.imagesToDelete;
      if (typeof imagesToDelete === 'string') {
        try {
          imagesToDelete = JSON.parse(imagesToDelete);
        } catch (e) {
          imagesToDelete = [];
        }
      }

      // Update product with proper data handling
      const [result] = await connection.execute(
        `UPDATE products SET name = ?, brand = ?, category = ?, price = ?, 
         original_price = ?, description = ?, tags = ?, is_new = ?, is_best_seller = ?, is_on_offer = ? 
         WHERE id = ?`,
        [
          name, brand, category, price, originalPrice || null,
          description, JSON.stringify(parsedTags || []), 
          isNew === 'true' || isNew === true, 
          isBestSeller === 'true' || isBestSeller === true,
          isOnOffer === 'true' || isOnOffer === true, id
        ]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      // Update categories in junction table
      if (parsedCategories && parsedCategories.length > 0) {
        // Delete existing categories
        await connection.execute(
          'DELETE FROM product_categories WHERE product_id = ?',
          [id]
        );
        // Insert new categories
        for (const cat of parsedCategories) {
          const categoryId = `${id}-${cat}-${Date.now()}`;
          try {
            await connection.execute(
              'INSERT INTO product_categories (id, product_id, category) VALUES (?, ?, ?)',
              [categoryId, id, cat]
            );
          } catch (e) {
            // Ignore duplicate category errors
            if (!e.message.includes('Duplicate entry')) {
              console.error('Error inserting category:', e);
            }
          }
        }
      }

      // Delete specified images
      if (imagesToDelete && imagesToDelete.length > 0) {
        const [imagesToRemove] = await connection.execute(
          `SELECT url FROM product_images WHERE id IN (${imagesToDelete.map(() => '?').join(',')})`,
          imagesToDelete
        );
        
        await connection.execute(
          `DELETE FROM product_images WHERE id IN (${imagesToDelete.map(() => '?').join(',')})`,
          imagesToDelete
        );
        
        // Delete from Spaces
        for (const img of imagesToRemove) {
          await spacesService.deleteFile(img.url);
        }
      }

      // Handle new image uploads with proper error handling
      const uploadedImages = [];
      if (req.files && req.files.length > 0) {
        console.log(`📸 Starting upload of ${req.files.length} new images...`);
        for (let i = 0; i < req.files.length; i++) {
          const file = req.files[i];
          try {
            const uploadResult = await spacesService.uploadFile(file, 'products');
            
            if (uploadResult.success) {
              const imageId = `${id}-${Date.now()}-${i}`;
              await connection.execute(
                'INSERT INTO product_images (id, product_id, url, alt_text) VALUES (?, ?, ?, ?)',
                [imageId, id, uploadResult.url, name]
              );
              uploadedImages.push(uploadResult.url);
              console.log(`✅ Image ${i + 1}/${req.files.length} uploaded: ${uploadResult.url}`);
            } else {
              console.error(`❌ Failed to upload image ${i + 1}/${req.files.length}:`, uploadResult.error);
              // Continue with other images even if one fails
            }
          } catch (error) {
            console.error(`❌ Error uploading image ${i + 1}/${req.files.length}:`, error.message);
            // Continue with other images even if one fails
          }
        }
        console.log(`📸 Upload complete: ${uploadedImages.length}/${req.files.length} images saved to database`);
      }

      // Update variants if provided
      if (parsedVariants && parsedVariants.length > 0) {
        // Delete existing variants
        await connection.execute('DELETE FROM product_variants WHERE product_id = ?', [id]);
        
        // Insert new variants
        for (const variant of parsedVariants) {
          const variantId = `${id}-${variant.size}`;
          await connection.execute(
            'INSERT INTO product_variants (id, product_id, size, in_stock, stock_quantity) VALUES (?, ?, ?, ?, ?)',
            [variantId, id, variant.size, variant.inStock !== false, variant.stockQuantity || 10]
          );
        }
      }

      await connection.commit();

      const response = {
        success: true,
        message: 'Product updated successfully'
      };

      console.log('✅ Product update response:', JSON.stringify(response, null, 2));

      res.json(response);

    } catch (error) {
      await connection.rollback();
      console.error('Update product error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update product',
        error: error.message
      });
    } finally {
      connection.release();
    }
  }

  // Delete product
  async deleteProduct(req, res) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      const { id } = req.params;

      // Check if product is referenced in any orders
      const [orderItems] = await connection.execute(
        'SELECT COUNT(*) as count FROM order_items WHERE product_id = ?',
        [id]
      );

      if (orderItems[0].count > 0) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `Cannot delete product. It is referenced in ${orderItems[0].count} order(s). Consider marking it as unavailable instead.`
        });
      }

      // Get all images before deleting to clean up from S3
      const [images] = await connection.execute(
        'SELECT url FROM product_images WHERE product_id = ?',
        [id]
      );

      // Delete from database first
      const [result] = await connection.execute(
        'DELETE FROM products WHERE id = ?',
        [id]
      );

      if (result.affectedRows === 0) {
        await connection.rollback();
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      // Clean up images from S3/Spaces
      for (const image of images) {
        if (image.url && image.url.includes('digitaloceanspaces.com')) {
          // Extract key from URL
          const urlParts = image.url.split('/');
          const key = urlParts.slice(-2).join('/'); // Get 'products/filename'
          await spacesService.deleteFile(key);
        }
      }

      await connection.commit();

      res.json({
        success: true,
        message: 'Product deleted successfully'
      });

    } catch (error) {
      await connection.rollback();
      console.error('Delete product error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete product',
        error: error.message
      });
    } finally {
      connection.release();
    }
  }

  // Get all products with filtering and pagination
  async getProducts(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 150;
      const offset = (page - 1) * limit;
      
      const { category, categories, brand, search, isNew, isBestSeller, minPrice, maxPrice } = req.query;

      let query = 'SELECT * FROM products';
      let countQuery = 'SELECT COUNT(*) as total FROM products';
      const conditions = [];
      const params = [];

      // Support both single category and multiple categories
      if (category) {
        // Check both products.category and product_categories junction table
        conditions.push(`(products.category = ? OR products.id IN (
          SELECT product_id FROM product_categories WHERE category = ?
        ))`);
        params.push(category, category);
      } else if (categories) {
        // Handle multiple categories filter
        const categoryList = Array.isArray(categories) ? categories : [categories];
        const placeholders = categoryList.map(() => '?').join(',');
        conditions.push(`products.id IN (
          SELECT DISTINCT product_id FROM product_categories WHERE category IN (${placeholders})
        )`);
        params.push(...categoryList);
      }

      if (brand) {
        conditions.push('brand = ?');
        params.push(brand);
      }

      if (search) {
        conditions.push('(name LIKE ? OR description LIKE ? OR brand LIKE ?)');
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      if (isNew === 'true') {
        conditions.push('is_new = ?');
        params.push(1);
      }

      if (isBestSeller === 'true') {
        conditions.push('is_best_seller = ?');
        params.push(1);
      }

      if (minPrice) {
        conditions.push('price >= ?');
        params.push(parseFloat(minPrice));
      }

      if (maxPrice) {
        conditions.push('price <= ?');
        params.push(parseFloat(maxPrice));
      }

      if (conditions.length > 0) {
        const whereClause = ' WHERE ' + conditions.join(' AND ');
        query += whereClause;
        countQuery += whereClause;
      }

      query += ' ORDER BY updated_at DESC, created_at DESC LIMIT ? OFFSET ?';
      
      const queryParams = params.concat([limit, offset]);
      
      console.log('🔍 Debug SQL:');
      console.log('Query:', query);
      console.log('Params:', params);
      console.log('Limit:', limit, 'Type:', typeof limit);
      console.log('Offset:', offset, 'Type:', typeof offset);
      console.log('QueryParams:', queryParams);
      
      const [products] = await pool.query(query, queryParams);
      const [countResult] = await pool.query(countQuery, params);

      // Fetch images, variants, and categories for each product
      const productsWithDetails = await Promise.all(
        products.map(async (product) => {
          const [images] = await pool.execute(
            'SELECT id, url, alt_text as alt FROM product_images WHERE product_id = ?',
            [product.id]
          );
          
          const [variants] = await pool.execute(
            'SELECT id, size, in_stock as inStock, stock_quantity as stockQuantity FROM product_variants WHERE product_id = ?',
            [product.id]
          );

          // Fetch categories from junction table
          const [categories] = await pool.execute(
            'SELECT category FROM product_categories WHERE product_id = ?',
            [product.id]
          );
          const categoryList = categories.length > 0 
            ? categories.map(c => c.category)
            : [product.category]; // Fallback to primary category

          return {
            id: product.id,
            slug: product.slug,
            name: product.name,
            brand: product.brand,
            category: product.category,
            categories: categoryList,
            price: parseFloat(product.price),
            originalPrice: product.original_price ? parseFloat(product.original_price) : null,
            images: images,
            variants: variants,
            description: product.description,
            tags: (() => {
              try {
                return JSON.parse(product.tags || '[]');
              } catch (e) {
                console.error('Invalid JSON in tags for product:', product.id, product.tags);
                return [];
              }
            })(),
            isNew: Boolean(product.is_new),
            isBestSeller: Boolean(product.is_best_seller),
            isOnOffer: Boolean(product.is_on_offer),
            createdAt: product.created_at
          };
        })
      );

      console.log('📦 Products fetched from DB:', JSON.stringify(productsWithDetails, null, 2));

      res.json({
        success: true,
        data: {
          products: productsWithDetails,
          pagination: {
            page,
            limit,
            total: countResult[0].total,
            pages: Math.ceil(countResult[0].total / limit)
          }
        }
      });

    } catch (error) {
      console.error('Get products error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve products',
        error: error.message
      });
    }
  }

  // Get single product by ID or slug
  async getProduct(req, res) {
    try {
      const { id } = req.params;

      const [products] = await pool.execute(
        'SELECT * FROM products WHERE id = ? OR slug = ?',
        [id, id]
      );

      if (products.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      const product = products[0];
      
      // Fetch images, variants, and categories separately
      const [images] = await pool.execute(
        'SELECT id, url, alt_text as alt FROM product_images WHERE product_id = ?',
        [product.id]
      );
      
      const [variants] = await pool.execute(
        'SELECT id, size, in_stock as inStock, stock_quantity as stockQuantity FROM product_variants WHERE product_id = ?',
        [product.id]
      );

      // Fetch categories from junction table
      const [categories] = await pool.execute(
        'SELECT category FROM product_categories WHERE product_id = ?',
        [product.id]
      );
      const categoryList = categories.length > 0 
        ? categories.map(c => c.category)
        : [product.category]; // Fallback to primary category

      const formattedProduct = {
        id: product.id,
        slug: product.slug,
        name: product.name,
        brand: product.brand,
        category: product.category,
        categories: categoryList,
        price: parseFloat(product.price),
        originalPrice: product.original_price ? parseFloat(product.original_price) : null,
        images: images,
        variants: variants,
        description: product.description,
        tags: (() => {
          try {
            return JSON.parse(product.tags || '[]');
          } catch (e) {
            console.error('Invalid JSON in tags for product:', product.id, product.tags);
            return [];
          }
        })(),
        isNew: Boolean(product.is_new),
        isBestSeller: Boolean(product.is_best_seller),
        isOnOffer: Boolean(product.is_on_offer),
        createdAt: product.created_at
      };

      console.log('📦 Single product fetched from DB:', JSON.stringify(formattedProduct, null, 2));

      res.json({
        success: true,
        data: formattedProduct
      });

    } catch (error) {
      console.error('Get product error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve product',
        error: error.message
      });
    }
  }

  // Get product categories
  async getCategories(req, res) {
    try {
      const [categories] = await pool.execute(`
        SELECT category, COUNT(*) as count 
        FROM products 
        GROUP BY category 
        ORDER BY category
      `);

      res.json({
        success: true,
        data: categories
      });

    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve categories',
        error: error.message
      });
    }
  }

  // Get product brands
  async getBrands(req, res) {
    try {
      const [brands] = await pool.execute(`
        SELECT brand, COUNT(*) as count 
        FROM products 
        GROUP BY brand 
        ORDER BY brand
      `);

      res.json({
        success: true,
        data: brands
      });

    } catch (error) {
      console.error('Get brands error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve brands',
        error: error.message
      });
    }
  }

  // Upload images separately and return URLs
  async uploadImages(req, res) {
    try {
      console.log('📸 Upload images endpoint called');
      console.log('Request headers:', JSON.stringify(req.headers, null, 2));
      console.log('Files received:', req.files ? req.files.length : 0);
      
      if (!req.files || req.files.length === 0) {
        console.error('❌ No files in request');
        return res.status(400).json({
          success: false,
          message: 'No images provided'
        });
      }

      const uploadedImages = [];
      console.log(`📸 Starting upload of ${req.files.length} images...`);
      
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        try {
          console.log(`📤 Uploading image ${i + 1}/${req.files.length}: ${file.originalname} (${file.size} bytes)`);
          const uploadResult = await spacesService.uploadFile(file, 'products');
          
          if (uploadResult.success) {
            uploadedImages.push({
              url: uploadResult.url,
              filename: file.originalname,
              size: file.size,
              mimetype: file.mimetype
            });
            console.log(`✅ Image ${i + 1}/${req.files.length} uploaded: ${uploadResult.url}`);
          } else {
            console.error(`❌ Failed to upload image ${i + 1}/${req.files.length}:`, uploadResult.error);
          }
        } catch (error) {
          console.error(`❌ Error uploading image ${i + 1}/${req.files.length}:`, error.message);
          console.error('Error stack:', error.stack);
        }
      }

      console.log(`📸 Upload complete: ${uploadedImages.length}/${req.files.length} images uploaded`);

      if (uploadedImages.length === 0) {
        return res.status(500).json({
          success: false,
          message: 'Failed to upload any images',
          error: 'All image uploads failed'
        });
      }

      res.json({
        success: true,
        message: `Successfully uploaded ${uploadedImages.length} image(s)`,
        data: {
          images: uploadedImages
        }
      });

    } catch (error) {
      console.error('Upload images error:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({
        success: false,
        message: 'Failed to upload images',
        error: error.message
      });
    }
  }
}

module.exports = new ProductController();