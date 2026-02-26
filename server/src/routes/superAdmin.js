const express = require('express');
const router = express.Router();
const superAdminController = require('../controllers/superAdminController');
const { requireSuperAdmin } = require('../middleware/authMiddleware');

//Mount under dashboard so auth + isAdmin is already applied. Only the super admin can access this.
router.use(requireSuperAdmin);

// 1. Admin account management (create, edit, delete)
router.post('/admins', superAdminController.createAdmin);
router.get('/admins', superAdminController.listAdmins);
router.put('/admins/:adminId', superAdminController.updateAdmin);
router.delete('/admins/:adminId', superAdminController.deleteAdmin);

// 2. Assign roles and permissions
router.patch('/admins/:adminId/role', superAdminController.assignRole);