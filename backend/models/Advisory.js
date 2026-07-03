const pool = require('../config/db');

class Advisory {
  // ==================== ARTICLES ====================
  
  // Get all articles with filters
  static async getAllArticles(filters = {}) {
    const { category, limit = 20, offset = 0, featured, published, search } = filters;
    
    let query = `
      SELECT a.*, c.name as category_name, c.slug as category_slug, c.color as category_color,
             COUNT(v.id) as view_count
      FROM advisory_articles a
      JOIN advisory_categories c ON a.category_id = c.id
      LEFT JOIN advisory_views v ON a.id = v.article_id
      WHERE 1=1
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
      query += ` AND a.is_published = true AND a.published_at <= NOW()`;
    }
    
    if (search) {
      query += ` AND (a.title ILIKE $${paramCount} OR a.content ILIKE $${paramCount} OR a.tags::text ILIKE $${paramCount})`;
      values.push(`%${search}%`);
      paramCount++;
    }
    
    query += ` GROUP BY a.id, c.id ORDER BY a.published_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(parseInt(limit), parseInt(offset));
    
    const result = await pool.query(query, values);
    
    // Get total count
    let countQuery = `
      SELECT COUNT(*) FROM advisory_articles a
      WHERE 1=1
    `;
    const countValues = [];
    let countParamCount = 1;
    
    if (category) {
      countQuery += ` AND a.category_id = (SELECT id FROM advisory_categories WHERE slug = $${countParamCount})`;
      countValues.push(category);
      countParamCount++;
    }
    
    if (published === 'true') {
      countQuery += ` AND a.is_published = true AND a.published_at <= NOW()`;
    }
    
    if (search) {
      countQuery += ` AND (a.title ILIKE $${countParamCount} OR a.content ILIKE $${countParamCount} OR a.tags::text ILIKE $${countParamCount})`;
      countValues.push(`%${search}%`);
    }
    
    const countResult = await pool.query(countQuery, countValues);
    
    return {
      articles: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit: parseInt(limit),
      offset: parseInt(offset)
    };
  }
  
  // Get article by slug
  static async getArticleBySlug(slug) {
    const result = await pool.query(`
      SELECT a.*, c.name as category_name, c.slug as category_slug, c.color as category_color
      FROM advisory_articles a
      JOIN advisory_categories c ON a.category_id = c.id
      WHERE a.slug = $1 AND a.is_published = true AND a.published_at <= NOW()
    `, [slug]);
    
    if (result.rows.length === 0) return null;
    
    // Increment view count
    await pool.query(
      'UPDATE advisory_articles SET view_count = view_count + 1 WHERE id = $1',
      [result.rows[0].id]
    );
    
    return result.rows[0];
  }
  
  // Create article
  static async createArticle(articleData, userId) {
    const {
      title, slug, category_id, content, summary, featured_image,
      tags, difficulty_level, estimated_read_time, is_featured, is_published
    } = articleData;
    
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
      userId, tags || [], difficulty_level || 'beginner',
      estimated_read_time || 5, is_featured || false, is_published || false
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }
  
  // Update article
  static async updateArticle(id, articleData, userId) {
    const {
      title, category_id, content, summary, featured_image,
      tags, difficulty_level, estimated_read_time, is_featured, is_published
    } = articleData;
    
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
    return result.rows[0] || null;
  }
  
  // Delete article
  static async deleteArticle(id) {
    const result = await pool.query(
      'DELETE FROM advisory_articles WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0] || null;
  }
  
  // Record article view
  static async recordView(articleId, userId, ipAddress) {
    const query = `
      INSERT INTO advisory_views (article_id, user_id, ip_address)
      VALUES ($1, $2, $3)
    `;
    await pool.query(query, [articleId, userId || null, ipAddress]);
  }
  
  // Get related articles
  static async getRelatedArticles(articleId, categoryId, limit = 5) {
    const result = await pool.query(`
      SELECT id, title, slug, summary, featured_image, estimated_read_time, view_count
      FROM advisory_articles
      WHERE category_id = $1 AND id != $2 AND is_published = true
      ORDER BY view_count DESC
      LIMIT $3
    `, [categoryId, articleId, limit]);
    
    return result.rows;
  }
  
  // ==================== RESOURCES ====================
  
  // Get all resources
  static async getAllResources(filters = {}) {
    const { category, limit = 100, offset = 0, search } = filters;
    
    let query = `
      SELECT r.*, c.name as category_name, c.slug as category_slug
      FROM advisory_resources r
      JOIN advisory_categories c ON r.category_id = c.id
      WHERE r.is_active = true
    `;
    
    const values = [];
    let paramCount = 1;
    
    if (category) {
      query += ` AND c.slug = $${paramCount}`;
      values.push(category);
      paramCount++;
    }
    
    if (search) {
      query += ` AND (r.title ILIKE $${paramCount} OR r.description ILIKE $${paramCount})`;
      values.push(`%${search}%`);
      paramCount++;
    }
    
    query += ` ORDER BY r.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(parseInt(limit), parseInt(offset));
    
    const result = await pool.query(query, values);
    
    // Get total count
    let countQuery = `
      SELECT COUNT(*) FROM advisory_resources r
      WHERE r.is_active = true
    `;
    const countValues = [];
    let countParamCount = 1;
    
    if (category) {
      countQuery += ` AND r.category_id = (SELECT id FROM advisory_categories WHERE slug = $${countParamCount})`;
      countValues.push(category);
      countParamCount++;
    }
    
    if (search) {
      countQuery += ` AND (r.title ILIKE $${countParamCount} OR r.description ILIKE $${countParamCount})`;
      countValues.push(`%${search}%`);
    }
    
    const countResult = await pool.query(countQuery, countValues);
    
    return {
      resources: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit: parseInt(limit),
      offset: parseInt(offset)
    };
  }
  
  // Get resource by ID
  static async getResourceById(id) {
    const result = await pool.query(`
      SELECT r.*, c.name as category_name, c.slug as category_slug
      FROM advisory_resources r
      JOIN advisory_categories c ON r.category_id = c.id
      WHERE r.id = $1 AND r.is_active = true
    `, [id]);
    
    return result.rows[0] || null;
  }
  
  // Increment download count
  static async incrementDownloadCount(id) {
    await pool.query(
      'UPDATE advisory_resources SET download_count = download_count + 1 WHERE id = $1',
      [id]
    );
  }
  
  // Create resource
  static async createResource(resourceData) {
    const { title, description, category_id, file_name, file_path, file_type, file_size } = resourceData;
    
    const query = `
      INSERT INTO advisory_resources (
        title, description, category_id, file_name, file_path, file_type, file_size
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      title, description, category_id, file_name, file_path, file_type, file_size
    ]);
    
    return result.rows[0];
  }
  
  // Delete resource
  static async deleteResource(id) {
    const result = await pool.query(
      'DELETE FROM advisory_resources WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0] || null;
  }
  
  // ==================== FAQs ====================
  
  // Get all FAQs
  static async getAllFAQs(filters = {}) {
    const { category } = filters;
    
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
    
    return Object.values(grouped);
  }
  
  // Create FAQ
  static async createFAQ(faqData) {
    const { question, answer, category_id, display_order } = faqData;
    
    const query = `
      INSERT INTO advisory_faqs (question, answer, category_id, display_order)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const result = await pool.query(query, [question, answer, category_id, display_order || 0]);
    return result.rows[0];
  }
  
  // Update FAQ
  static async updateFAQ(id, faqData) {
    const { question, answer, category_id, display_order, is_active } = faqData;
    
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
    return result.rows[0] || null;
  }
  
  // Delete FAQ
  static async deleteFAQ(id) {
    const result = await pool.query(
      'DELETE FROM advisory_faqs WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0] || null;
  }
  
  // ==================== SEASONAL GUIDES ====================
  
  // Get seasonal guides
  static async getSeasonalGuides(filters = {}) {
    const { season, crop_type, region } = filters;
    
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
    return result.rows;
  }
  
  // Create seasonal guide
  static async createSeasonalGuide(guideData) {
    const { title, season, crop_type, region, content, start_date, end_date } = guideData;
    
    const query = `
      INSERT INTO advisory_seasonal_guides (
        title, season, crop_type, region, content, start_date, end_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      title, season, crop_type, region, content, start_date, end_date
    ]);
    
    return result.rows[0];
  }
  
  // Update seasonal guide
  static async updateSeasonalGuide(id, guideData) {
    const { title, season, crop_type, region, content, start_date, end_date, is_active } = guideData;
    
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
    return result.rows[0] || null;
  }
  
  // Delete seasonal guide
  static async deleteSeasonalGuide(id) {
    const result = await pool.query(
      'DELETE FROM advisory_seasonal_guides WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0] || null;
  }
  
  // ==================== WEATHER ALERTS ====================
  
  // Get active weather alerts
  static async getWeatherAlerts(filters = {}) {
    const { region } = filters;
    
    let query = `
      SELECT w.*, u.full_name as issued_by_name
      FROM advisory_weather_alerts w
      LEFT JOIN users u ON w.issued_by = u.id
      WHERE w.is_active = true
        AND w.start_date <= NOW()
        AND w.end_date >= NOW()
    `;
    
    const values = [];
    if (region) {
      query += ` AND w.region ILIKE $1`;
      values.push(`%${region}%`);
    }
    
    query += ` ORDER BY w.severity DESC, w.created_at DESC`;
    
    const result = await pool.query(query, values);
    return result.rows;
  }
  
  // Get all weather alerts (admin)
  static async getAllWeatherAlerts(filters = {}) {
    const { limit = 100, offset = 0, status } = filters;
    
    let query = `
      SELECT w.*, u.full_name as issued_by_name
      FROM advisory_weather_alerts w
      LEFT JOIN users u ON w.issued_by = u.id
      WHERE 1=1
    `;
    
    const values = [];
    let paramCount = 1;
    
    if (status === 'active') {
      query += ` AND w.is_active = true AND w.start_date <= NOW() AND w.end_date >= NOW()`;
    } else if (status === 'expired') {
      query += ` AND (w.is_active = false OR w.end_date < NOW())`;
    }
    
    query += ` ORDER BY w.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(parseInt(limit), parseInt(offset));
    
    const result = await pool.query(query, values);
    
    // Get total count
    let countQuery = `SELECT COUNT(*) FROM advisory_weather_alerts WHERE 1=1`;
    if (status === 'active') {
      countQuery += ` AND is_active = true AND start_date <= NOW() AND end_date >= NOW()`;
    } else if (status === 'expired') {
      countQuery += ` AND (is_active = false OR end_date < NOW())`;
    }
    
    const countResult = await pool.query(countQuery);
    
    return {
      alerts: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit: parseInt(limit),
      offset: parseInt(offset)
    };
  }
  
  // Create weather alert
  static async createWeatherAlert(alertData, userId) {
    const { title, alert_type, severity, region, message, start_date, end_date } = alertData;
    
    const query = `
      INSERT INTO advisory_weather_alerts (
        title, alert_type, severity, region, message, start_date, end_date, issued_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      title, alert_type, severity, region, message, start_date, end_date, userId
    ]);
    
    return result.rows[0];
  }
  
  // Update weather alert
  static async updateWeatherAlert(id, alertData) {
    const { title, alert_type, severity, region, message, start_date, end_date, is_active } = alertData;
    
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
    return result.rows[0] || null;
  }
  
  // Delete weather alert
  static async deleteWeatherAlert(id) {
    const result = await pool.query(
      'DELETE FROM advisory_weather_alerts WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0] || null;
  }
  
  // ==================== CATEGORIES ====================
  
  // Get all categories
  static async getAllCategories() {
    const result = await pool.query(`
      SELECT c.*, 
        (SELECT COUNT(*) FROM advisory_articles a WHERE a.category_id = c.id AND a.is_published = true) as article_count,
        (SELECT COUNT(*) FROM advisory_resources r WHERE r.category_id = c.id AND r.is_active = true) as resource_count
      FROM advisory_categories c
      WHERE c.is_active = true
      ORDER BY c.display_order, c.name
    `);
    
    return result.rows;
  }
  
  // Get category by ID
  static async getCategoryById(id) {
    const result = await pool.query('SELECT * FROM advisory_categories WHERE id = $1', [id]);
    return result.rows[0] || null;
  }
  
  // Get category by slug
  static async getCategoryBySlug(slug) {
    const result = await pool.query('SELECT * FROM advisory_categories WHERE slug = $1', [slug]);
    return result.rows[0] || null;
  }
  
  // Create category
  static async createCategory(categoryData) {
    const { name, slug, description, icon, color, display_order } = categoryData;
    
    const query = `
      INSERT INTO advisory_categories (name, slug, description, icon, color, display_order)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const result = await pool.query(query, [name, slug, description, icon, color, display_order || 0]);
    return result.rows[0];
  }
  
  // Update category
  static async updateCategory(id, categoryData) {
    const { name, slug, description, icon, color, display_order, is_active } = categoryData;
    
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
    return result.rows[0] || null;
  }
  
  // Delete category
  static async deleteCategory(id) {
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
      throw new Error('Cannot delete category that has articles or resources');
    }
    
    const result = await pool.query(
      'DELETE FROM advisory_categories WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0] || null;
  }
  
  // ==================== STATISTICS ====================
  
  // Get advisory statistics (admin only)
  static async getStatistics() {
    const stats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM advisory_articles) as total_articles,
        (SELECT COUNT(*) FROM advisory_articles WHERE is_published = true) as published_articles,
        (SELECT COUNT(*) FROM advisory_articles WHERE is_featured = true) as featured_articles,
        (SELECT SUM(view_count) FROM advisory_articles) as total_views,
        (SELECT COUNT(*) FROM advisory_resources) as total_resources,
        (SELECT SUM(download_count) FROM advisory_resources) as total_downloads,
        (SELECT COUNT(*) FROM advisory_faqs WHERE is_active = true) as total_faqs,
        (SELECT COUNT(*) FROM advisory_weather_alerts WHERE is_active = true AND end_date >= NOW()) as active_alerts
    `);
    
    // Get top articles by views
    const topArticles = await pool.query(`
      SELECT id, title, slug, view_count, published_at
      FROM advisory_articles
      WHERE is_published = true
      ORDER BY view_count DESC
      LIMIT 10
    `);
    
    // Get popular categories
    const popularCategories = await pool.query(`
      SELECT c.name, COUNT(a.id) as article_count, SUM(a.view_count) as total_views
      FROM advisory_categories c
      LEFT JOIN advisory_articles a ON c.id = a.category_id AND a.is_published = true
      GROUP BY c.id, c.name
      ORDER BY total_views DESC
      LIMIT 10
    `);
    
    return {
      stats: stats.rows[0],
      topArticles: topArticles.rows,
      popularCategories: popularCategories.rows
    };
  }
}

module.exports = Advisory;