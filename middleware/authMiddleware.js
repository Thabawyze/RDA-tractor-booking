const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'tractor-ease-secret-key-2024';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'Access token required' 
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        error: 'Invalid or expired token' 
      });
    }
    req.user = user;
    next();
  });
};

const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      error: 'Authentication required' 
    });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      error: 'Admin access required' 
    });
  }
  next();
};

const requireFarmer = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      error: 'Authentication required' 
    });
  }
  
  if (req.user.role !== 'farmer' && req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      error: 'Farmer access required' 
    });
  }
  next();
};

const requireStaff = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      error: 'Authentication required' 
    });
  }
  
  if (req.user.role !== 'staff' && req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      error: 'Staff access required' 
    });
  }
  next();
};

const checkOwnership = (getResourceUserId) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required' 
      });
    }
    
    if (req.user.role === 'admin') {
      return next();
    }
    
    try {
      const resourceUserId = await getResourceUserId(req);
      if (req.user.id !== resourceUserId) {
        return res.status(403).json({ 
          success: false, 
          error: 'You do not have permission to access this resource' 
        });
      }
      next();
    } catch (error) {
      return res.status(500).json({ 
        success: false, 
        error: 'Error checking ownership' 
      });
    }
  };
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireFarmer,
  requireStaff,
  checkOwnership
};