const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const advisoryController = require('../controllers/advisoryController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/advisory';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only images and documents are allowed'));
  }
});

// ==================== PUBLIC ROUTES ====================
router.get('/articles', advisoryController.getAllArticles);
router.get('/articles/:slug', advisoryController.getArticleBySlug);
router.get('/resources', advisoryController.getAllResources);
router.get('/resources/download/:id', advisoryController.downloadResource);
router.get('/faqs', advisoryController.getAllFAQs);
router.get('/seasonal-guides', advisoryController.getSeasonalGuides);
router.get('/weather-alerts', advisoryController.getWeatherAlerts);
router.get('/categories', advisoryController.getAllCategories);

// ==================== ADMIN ROUTES ====================
// Articles
router.post('/articles', authenticateToken, requireAdmin, upload.single('featured_image'), advisoryController.createArticle);
router.put('/articles/:id', authenticateToken, requireAdmin, upload.single('featured_image'), advisoryController.updateArticle);
router.delete('/articles/:id', authenticateToken, requireAdmin, advisoryController.deleteArticle);

// Resources
router.post('/resources', authenticateToken, requireAdmin, upload.single('file'), advisoryController.uploadResource);
router.delete('/resources/:id', authenticateToken, requireAdmin, advisoryController.deleteResource);

// FAQs
router.post('/faqs', authenticateToken, requireAdmin, advisoryController.createFAQ);
router.put('/faqs/:id', authenticateToken, requireAdmin, advisoryController.updateFAQ);
router.delete('/faqs/:id', authenticateToken, requireAdmin, advisoryController.deleteFAQ);

// Seasonal Guides
router.post('/seasonal-guides', authenticateToken, requireAdmin, advisoryController.createSeasonalGuide);
router.put('/seasonal-guides/:id', authenticateToken, requireAdmin, advisoryController.updateSeasonalGuide);
router.delete('/seasonal-guides/:id', authenticateToken, requireAdmin, advisoryController.deleteSeasonalGuide);

// Weather Alerts
router.post('/weather-alerts', authenticateToken, requireAdmin, advisoryController.createWeatherAlert);
router.put('/weather-alerts/:id', authenticateToken, requireAdmin, advisoryController.updateWeatherAlert);
router.delete('/weather-alerts/:id', authenticateToken, requireAdmin, advisoryController.deleteWeatherAlert);

// Categories
router.post('/categories', authenticateToken, requireAdmin, advisoryController.createCategory);
router.put('/categories/:id', authenticateToken, requireAdmin, advisoryController.updateCategory);
router.delete('/categories/:id', authenticateToken, requireAdmin, advisoryController.deleteCategory);

// In routes/advisoryRoutes.js - Add these routes

// Get all resources (public)
router.get('/resources', advisoryController.getAllResources);
router.get('/resources/:id', advisoryController.getResourceById);
router.get('/resources/download/:id', advisoryController.downloadResource);

// Admin routes for resources
router.post('/resources', authenticateToken, requireAdmin, upload.single('file'), advisoryController.createResource);
router.put('/resources/:id', authenticateToken, requireAdmin, advisoryController.updateResource);
router.delete('/resources/:id', authenticateToken, requireAdmin, advisoryController.deleteResource);
// In routes/advisoryRoutes.js - Make sure this endpoint exists
router.post('/resources', authenticateToken, requireAdmin, upload.single('file'), advisoryController.createResource);
module.exports = router;