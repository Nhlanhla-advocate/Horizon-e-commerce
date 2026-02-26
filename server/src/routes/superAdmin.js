const express = require('express');
const router = express.Router();
const superAdminController = require('../controllers/superAdminController');
const { requireSuperAdmin } = require('../middleware/authMiddleware');

//Mount under dashboard so auth + isAdmin is already applied. Only the super admin can access this.
router.use(requireSuperAdmin);

