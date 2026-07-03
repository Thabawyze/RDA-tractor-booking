const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

// ==================== ARTICLE MANAGEMENT ====================

// Get all articles (public)
exports.getAllArticles = async (req, res) => {
  try {
    const { category, limit = 20, offset = 0, featured, published } = req.query;
    
    let query = `
      SELECT a.*, c.name as category_name, c.slug as category_slug,
             COUNT(v.id) as view_count
      FROM advisory_articles a
      JOIN advisory_categories c ON a.category_id = c.id
      LEFT JOIN advisory_views v ON a.id = v.article_id
      WHERE a.is_published = true
    `;
    
    const values = [];
    let paramCount = 1;
    
    if (category) {
      query += ` AND c.slug = $${paramCount}`;
      values.push(category);
      paramCount++;
    }
    
    if (featured === 'true') {
      query += ` AND a.is_featured = true`;
    }
    
    if (published === 'true') {
      query += ` AND a.published_at <= NOW()`;
    }
    
    query += ` GROUP BY a.id, c.id ORDER BY a.published_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(parseInt(limit), parseInt(offset));
    
    const result = await pool.query(query, values);
    
    // Get total count
    const countQuery = `
      SELECT COUNT(*) FROM advisory_articles a
      WHERE a.is_published = true
      ${category ? `AND a.category_id = (SELECT id FROM advisory_categories WHERE slug = $1)` : ''}
    `;
    const countResult = await pool.query(
      countQuery,
      category ? [category] : []
    );
    
    res.json({
      success: true,
      articles: result.rows,
      pagination: {
        total: parseInt(countResult.rows[0].count),
        limit: parseInt(limit),
        offset: parseInt(offset),
        page: Math.floor(parseInt(offset) / parseInt(limit)) + 1
      }
    });
  } catch (error) {
    console.error('❌ Get articles error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Get single article by slug
exports.getArticleBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    
    // Get article
    const articleResult = await pool.query(`
      SELECT a.*, c.name as category_name, c.slug as category_slug
      FROM advisory_articles a
      JOIN advisory_categories c ON a.category_id = c.id
      WHERE a.slug = $1 AND a.is_published = true
    `, [slug]);
    
    if (articleResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Article not found' });
    }
    
    const article = articleResult.rows[0];
    
    // Increment view count
    await pool.query(
      'UPDATE advisory_articles SET view_count = view_count + 1 WHERE id = $1',
      [article.id]
    );
    
    // Record view (for analytics)
    const userId = req.user?.id || null;
    const ipAddress = req.ip || req.connection.remoteAddress;
    
    await pool.query(
      `INSERT INTO advisory_views (article_id, user_id, ip_address) 
       VALUES ($1, $2, $3)`,
      [article.id, userId, ipAddress]
    );
    
    // Get related articles (same category)
    const relatedResult = await pool.query(`
      SELECT id, title, slug, summary, featured_image, estimated_read_time
      FROM advisory_articles
      WHERE category_id = $1 AND id != $2 AND is_published = true
      ORDER BY view_count DESC
      LIMIT 5
    `, [article.category_id, article.id]);
    
    res.json({
      success: true,
      article,
      related: relatedResult.rows
    });
  } catch (error) {
    console.error('❌ Get article error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Create article (admin only)
exports.createArticle = async (req, res) => {
  try {
    const {
      title, category_id, content, summary, tags,
      difficulty_level, estimated_read_time, is_featured, is_published
    } = req.body;
    
    // Generate slug from title
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    
    const featured_image = req.file ? `/uploads/advisory/${req.file.filename}` : null;
    
    const query = `
      INSERT INTO advisory_articles (
        title, slug, category_id, content, summary, featured_image,
        author_id, tags, difficulty_level, estimated_read_time,
        is_featured, is_published, published_at, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 
        CASE WHEN $12 = true THEN CURRENT_TIMESTAMP ELSE NULL END,
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `;
    
    const values = [
      title, slug, category_id, content, summary, featured_image,
      req.user.id, tags || [], difficulty_level || 'beginner',
      estimated_read_time || 5, is_featured || false, is_published || false
    ];
    
    const result = await pool.query(query, values);
    
    res.status(201).json({
      success: true,
      message: 'Article created successfully',
      article: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Create article error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Update article (admin only)
exports.updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title, category_id, content, summary, tags,
      difficulty_level, estimated_read_time, is_featured, is_published
    } = req.body;
    
    let featured_image = null;
    if (req.file) {
      featured_image = `/uploads/advisory/${req.file.filename}`;
    }
    
    const query = `
      UPDATE advisory_articles 
      SET title = COALESCE($1, title),
          category_id = COALESCE($2, category_id),
          content = COALESCE($3, content),
          summary = COALESCE($4, summary),
          featured_image = COALESCE($5, featured_image),
          tags = COALESCE($6, tags),
          difficulty_level = COALESCE($7, difficulty_level),
          estimated_read_time = COALESCE($8, estimated_read_time),
          is_featured = COALESCE($9, is_featured),
          is_published = COALESCE($10, is_published),
          published_at = CASE 
            WHEN $10 = true AND is_published = false THEN CURRENT_TIMESTAMP 
            ELSE published_at 
          END,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $11
      RETURNING *
    `;
    
    const values = [
      title, category_id, content, summary, featured_image,
      tags, difficulty_level, estimated_read_time, is_featured, is_published, id
    ];
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Article not found' });
    }
    
    res.json({
      success: true,
      message: 'Article updated successfully',
      article: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Update article error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Delete article (admin only)
exports.deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get article to delete featured image
    const article = await pool.query(
      'SELECT featured_image FROM advisory_articles WHERE id = $1',
      [id]
    );
    
    if (article.rows.length > 0 && article.rows[0].featured_image) {
      const imagePath = path.join(__dirname, '..', article.rows[0].featured_image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    const result = await pool.query(
      'DELETE FROM advisory_articles WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Article not found' });
    }
    
    res.json({
      success: true,
      message: 'Article deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete article error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// ==================== RESOURCE MANAGEMENT ====================

// Get all resources
exports.getAllResources = async (req, res) => {
  try {
    const { category } = req.query;
    
    let query = `
      SELECT r.*, c.name as category_name
      FROM advisory_resources r
      JOIN advisory_categories c ON r.category_id = c.id
      WHERE r.is_active = true
    `;
    
    const values = [];
    if (category) {
      query += ` AND c.slug = $1`;
      values.push(category);
    }
    
    query += ` ORDER BY r.created_at DESC`;
    
    const result = await pool.query(query, values);
    
    res.json({
      success: true,
      resources: result.rows
    });
  } catch (error) {
    console.error('❌ Get resources error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Download resource
exports.downloadResource = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM advisory_resources WHERE id = $1 AND is_active = true',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Resource not found' });
    }
    
    const resource = result.rows[0];
    
    // Increment download count
    await pool.query(
      'UPDATE advisory_resources SET download_count = download_count + 1 WHERE id = $1',
      [id]
    );
    
    const filePath = path.join(__dirname, '..', resource.file_path);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'File not found' });
    }
    
    res.download(filePath, resource.file_name);
  } catch (error) {
    console.error('❌ Download resource error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Upload resource (admin only)
exports.uploadResource = async (req, res) => {
  try {
    const { title, description, category_id } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }
    
    const filePath = `/uploads/advisory/${req.file.filename}`;
    const fileSize = req.file.size;
    const fileType = req.file.mimetype;
    
    const query = `
      INSERT INTO advisory_resources (
        title, description, category_id, file_name, file_path,
        file_type, file_size, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `;
    
    const values = [
      title, description, category_id,
      req.file.originalname, filePath, fileType, fileSize
    ];
    
    const result = await pool.query(query, values);
    
    res.status(201).json({
      success: true,
      message: 'Resource uploaded successfully',
      resource: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Upload resource error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Delete resource (admin only)
exports.deleteResource = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM advisory_resources WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Resource not found' });
    }
    
    const resource = result.rows[0];
    
    // Delete file from disk
    const filePath = path.join(__dirname, '..', resource.file_path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    await pool.query('DELETE FROM advisory_resources WHERE id = $1', [id]);
    
    res.json({
      success: true,
      message: 'Resource deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete resource error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// ==================== FAQ MANAGEMENT ====================

// Get all FAQs
exports.getAllFAQs = async (req, res) => {
  try {
    const { category } = req.query;
    
    let query = `
      SELECT f.*, c.name as category_name, c.slug as category_slug
      FROM advisory_faqs f
      JOIN advisory_categories c ON f.category_id = c.id
      WHERE f.is_active = true
    `;
    
    const values = [];
    if (category) {
      query += ` AND c.slug = $1`;
      values.push(category);
    }
    
    query += ` ORDER BY c.display_order, f.display_order`;
    
    const result = await pool.query(query, values);
    
    // Group by category
    const grouped = {};
    result.rows.forEach(faq => {
      if (!grouped[faq.category_name]) {
        grouped[faq.category_name] = {
          category: faq.category_name,
          category_slug: faq.category_slug,
          faqs: []
        };
      }
      grouped[faq.category_name].faqs.push({
        id: faq.id,
        question: faq.question,
        answer: faq.answer
      });
    });
    
    res.json({
      success: true,
      faqs: Object.values(grouped)
    });
  } catch (error) {
    console.error('❌ Get FAQs error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Create FAQ (admin only)
exports.createFAQ = async (req, res) => {
  try {
    const { question, answer, category_id, display_order } = req.body;
    
    const query = `
      INSERT INTO advisory_faqs (question, answer, category_id, display_order)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const result = await pool.query(query, [question, answer, category_id, display_order || 0]);
    
    res.status(201).json({
      success: true,
      message: 'FAQ created successfully',
      faq: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Create FAQ error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Update FAQ (admin only)
exports.updateFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer, category_id, display_order, is_active } = req.body;
    
    const query = `
      UPDATE advisory_faqs 
      SET question = COALESCE($1, question),
          answer = COALESCE($2, answer),
          category_id = COALESCE($3, category_id),
          display_order = COALESCE($4, display_order),
          is_active = COALESCE($5, is_active),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
    `;
    
    const values = [question, answer, category_id, display_order, is_active, id];
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'FAQ not found' });
    }
    
    res.json({
      success: true,
      message: 'FAQ updated successfully',
      faq: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Update FAQ error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Delete FAQ (admin only)
exports.deleteFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM advisory_faqs WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'FAQ not found' });
    }
    
    res.json({
      success: true,
      message: 'FAQ deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete FAQ error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// ==================== SEASONAL GUIDES ====================

// Get seasonal guides
exports.getSeasonalGuides = async (req, res) => {
  try {
    const { season, crop_type, region } = req.query;
    
    let query = `
      SELECT * FROM advisory_seasonal_guides
      WHERE is_active = true
    `;
    
    const values = [];
    let paramCount = 1;
    
    if (season) {
      query += ` AND season ILIKE $${paramCount}`;
      values.push(`%${season}%`);
      paramCount++;
    }
    
    if (crop_type) {
      query += ` AND crop_type ILIKE $${paramCount}`;
      values.push(`%${crop_type}%`);
      paramCount++;
    }
    
    if (region) {
      query += ` AND region ILIKE $${paramCount}`;
      values.push(`%${region}%`);
      paramCount++;
    }
    
    query += ` ORDER BY start_date DESC`;
    
    const result = await pool.query(query, values);
    
    res.json({
      success: true,
      guides: result.rows
    });
  } catch (error) {
    console.error('❌ Get seasonal guides error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Create seasonal guide (admin only)
exports.createSeasonalGuide = async (req, res) => {
  try {
    const { title, season, crop_type, region, content, start_date, end_date } = req.body;
    
    const query = `
      INSERT INTO advisory_seasonal_guides (
        title, season, crop_type, region, content, start_date, end_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      title, season, crop_type, region, content, start_date, end_date
    ]);
    
    res.status(201).json({
      success: true,
      message: 'Seasonal guide created successfully',
      guide: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Create seasonal guide error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Update seasonal guide (admin only)
exports.updateSeasonalGuide = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, season, crop_type, region, content, start_date, end_date, is_active } = req.body;
    
    const query = `
      UPDATE advisory_seasonal_guides 
      SET title = COALESCE($1, title),
          season = COALESCE($2, season),
          crop_type = COALESCE($3, crop_type),
          region = COALESCE($4, region),
          content = COALESCE($5, content),
          start_date = COALESCE($6, start_date),
          end_date = COALESCE($7, end_date),
          is_active = COALESCE($8, is_active),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING *
    `;
    
    const values = [title, season, crop_type, region, content, start_date, end_date, is_active, id];
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Guide not found' });
    }
    
    res.json({
      success: true,
      message: 'Seasonal guide updated successfully',
      guide: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Update seasonal guide error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Delete seasonal guide (admin only)
exports.deleteSeasonalGuide = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM advisory_seasonal_guides WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Guide not found' });
    }
    
    res.json({
      success: true,
      message: 'Seasonal guide deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete seasonal guide error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// ==================== WEATHER ALERTS ====================

// Get active weather alerts
exports.getWeatherAlerts = async (req, res) => {
  try {
    const { region } = req.query;
    
    let query = `
      SELECT * FROM advisory_weather_alerts
      WHERE is_active = true
        AND start_date <= NOW()
        AND end_date >= NOW()
    `;
    
    const values = [];
    if (region) {
      query += ` AND region ILIKE $1`;
      values.push(`%${region}%`);
    }
    
    query += ` ORDER BY severity DESC, created_at DESC`;
    
    const result = await pool.query(query, values);
    
    res.json({
      success: true,
      alerts: result.rows
    });
  } catch (error) {
    console.error('❌ Get weather alerts error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Create weather alert (admin only)
exports.createWeatherAlert = async (req, res) => {
  try {
    const { title, alert_type, severity, region, message, start_date, end_date } = req.body;
    
    const query = `
      INSERT INTO advisory_weather_alerts (
        title, alert_type, severity, region, message, start_date, end_date, issued_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      title, alert_type, severity, region, message, start_date, end_date, req.user.id
    ]);
    
    res.status(201).json({
      success: true,
      message: 'Weather alert created successfully',
      alert: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Create weather alert error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Update weather alert (admin only)
exports.updateWeatherAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, alert_type, severity, region, message, start_date, end_date, is_active } = req.body;
    
    const query = `
      UPDATE advisory_weather_alerts 
      SET title = COALESCE($1, title),
          alert_type = COALESCE($2, alert_type),
          severity = COALESCE($3, severity),
          region = COALESCE($4, region),
          message = COALESCE($5, message),
          start_date = COALESCE($6, start_date),
          end_date = COALESCE($7, end_date),
          is_active = COALESCE($8, is_active),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING *
    `;
    
    const values = [title, alert_type, severity, region, message, start_date, end_date, is_active, id];
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }
    
    res.json({
      success: true,
      message: 'Weather alert updated successfully',
      alert: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Update weather alert error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Delete weather alert (admin only)
exports.deleteWeatherAlert = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM advisory_weather_alerts WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }
    
    res.json({
      success: true,
      message: 'Weather alert deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete weather alert error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// ==================== CATEGORY MANAGEMENT ====================

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, 
        (SELECT COUNT(*) FROM advisory_articles a WHERE a.category_id = c.id AND a.is_published = true) as article_count,
        (SELECT COUNT(*) FROM advisory_resources r WHERE r.category_id = c.id AND r.is_active = true) as resource_count
      FROM advisory_categories c
      WHERE c.is_active = true
      ORDER BY c.display_order, c.name
    `);
    
    res.json({
      success: true,
      categories: result.rows
    });
  } catch (error) {
    console.error('❌ Get categories error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Create category (admin only)
exports.createCategory = async (req, res) => {
  try {
    const { name, slug, description, icon, color, display_order } = req.body;
    
    const query = `
      INSERT INTO advisory_categories (name, slug, description, icon, color, display_order)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      name, slug, description, icon, color, display_order || 0
    ]);
    
    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Create category error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Update category (admin only)
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description, icon, color, display_order, is_active } = req.body;
    
    const query = `
      UPDATE advisory_categories 
      SET name = COALESCE($1, name),
          slug = COALESCE($2, slug),
          description = COALESCE($3, description),
          icon = COALESCE($4, icon),
          color = COALESCE($5, color),
          display_order = COALESCE($6, display_order),
          is_active = COALESCE($7, is_active),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
    `;
    
    const values = [name, slug, description, icon, color, display_order, is_active, id];
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }
    
    res.json({
      success: true,
      message: 'Category updated successfully',
      category: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Update category error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Delete category (admin only)
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if category has articles or resources
    const articleCheck = await pool.query(
      'SELECT COUNT(*) FROM advisory_articles WHERE category_id = $1',
      [id]
    );
    const resourceCheck = await pool.query(
      'SELECT COUNT(*) FROM advisory_resources WHERE category_id = $1',
      [id]
    );
    
    if (parseInt(articleCheck.rows[0].count) > 0 || parseInt(resourceCheck.rows[0].count) > 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Cannot delete category that has articles or resources' 
      });
    }
    
    const result = await pool.query(
      'DELETE FROM advisory_categories WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }
    
    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete category error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
// Create resource (admin only)
exports.createResource = async (req, res) => {
  try {
    console.log('📝 Creating resource...');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    console.log('User:', req.user);

    const { title, description, category_id, is_featured, is_active } = req.body;

    // Validate required fields
    if (!title) {
      return res.status(400).json({ success: false, error: 'Title is required' });
    }

    if (!category_id) {
      return res.status(400).json({ success: false, error: 'Category ID is required' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'File is required' });
    }

    const filePath = `/uploads/advisory/${req.file.filename}`;
    const fileSize = req.file.size;
    const fileType = req.file.mimetype;

    const query = `
      INSERT INTO advisory_resources (
        title, description, category_id, file_name, file_path,
        file_type, file_size, is_featured, is_active, download_count,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `;

    const values = [
      title,
      description || null,
      parseInt(category_id),
      req.file.originalname,
      filePath,
      fileType,
      fileSize,
      is_featured === 'true' || is_featured === true,
      is_active === 'true' || is_active === true,
      0
    ];

    console.log('Executing query with values:', values);

    const result = await pool.query(query, values);

    console.log('Resource created successfully:', result.rows[0].id);

    res.status(201).json({
      success: true,
      message: 'Resource uploaded successfully',
      resource: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Create resource error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error while creating resource',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update resource (admin only)
exports.updateResource = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category_id, is_featured, is_active } = req.body;

    let query = `
      UPDATE advisory_resources 
      SET title = COALESCE($1, title),
          description = COALESCE($2, description),
          category_id = COALESCE($3, category_id),
          is_featured = COALESCE($4, is_featured),
          is_active = COALESCE($5, is_active),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
    `;

    // If a new file is uploaded, update file info as well
    if (req.file) {
      query = `
        UPDATE advisory_resources 
        SET title = COALESCE($1, title),
            description = COALESCE($2, description),
            category_id = COALESCE($3, category_id),
            file_name = COALESCE($4, file_name),
            file_path = COALESCE($5, file_path),
            file_type = COALESCE($6, file_type),
            file_size = COALESCE($7, file_size),
            is_featured = COALESCE($8, is_featured),
            is_active = COALESCE($9, is_active),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $10
        RETURNING *
      `;
      
      var values = [
        title,
        description,
        category_id ? parseInt(category_id) : null,
        req.file.originalname,
        `/uploads/advisory/${req.file.filename}`,
        req.file.mimetype,
        req.file.size,
        is_featured === 'true' || is_featured === true,
        is_active === 'true' || is_active === true,
        id
      ];
    } else {
      var values = [
        title,
        description,
        category_id ? parseInt(category_id) : null,
        is_featured === 'true' || is_featured === true,
        is_active === 'true' || is_active === true,
        id
      ];
    }

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Resource not found' });
    }

    res.json({
      success: true,
      message: 'Resource updated successfully',
      resource: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Update resource error:', error);
    res.status(500).json({ success: false, error: 'Server error while updating resource' });
  }
};

// Delete resource (admin only)
exports.deleteResource = async (req, res) => {
  try {
    const { id } = req.params;

    // Get resource to delete file from disk
    const resource = await pool.query(
      'SELECT * FROM advisory_resources WHERE id = $1',
      [id]
    );

    if (resource.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Resource not found' });
    }

    // Delete file from disk
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, '..', resource.rows[0].file_path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    const result = await pool.query(
      'DELETE FROM advisory_resources WHERE id = $1 RETURNING *',
      [id]
    );

    res.json({
      success: true,
      message: 'Resource deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete resource error:', error);
    res.status(500).json({ success: false, error: 'Server error while deleting resource' });
  }
};

// Get resource by ID
exports.getResourceById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT r.*, c.name as category_name 
       FROM advisory_resources r
       JOIN advisory_categories c ON r.category_id = c.id
       WHERE r.id = $1 AND r.is_active = true`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Resource not found' });
    }

    res.json({
      success: true,
      resource: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Get resource error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Download resource
exports.downloadResource = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM advisory_resources WHERE id = $1 AND is_active = true',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Resource not found' });
    }

    const resource = result.rows[0];

    // Increment download count
    await pool.query(
      'UPDATE advisory_resources SET download_count = download_count + 1 WHERE id = $1',
      [id]
    );

    const filePath = path.join(__dirname, '..', resource.file_path);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'File not found' });
    }

    res.download(filePath, resource.file_name);

  } catch (error) {
    console.error('❌ Download resource error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};