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

// 3. Suspend / ban users
router.post('/users/:userId/suspend', superAdminController.suspendUser);
router.post('/users/:userId/unsuspend', superAdminController.unsuspendUser);
router.post('/users/:userId/ban', superAdminController.banUser);
router.post('/users/:userId/unban', superAdminController.unbanUser);

// 4. Override orders
router.patch('/orders/:orderId/override', superAdminController.overrideOrder);

// 5. Disputes and refunds
router.get('/disputes', superAdminController.listDisputes);
router.post('/disputes', superAdminController.createDispute);
router.patch('/disputes/:disputeId/assign', superAdminController.assignDispute);


module.exports = router;