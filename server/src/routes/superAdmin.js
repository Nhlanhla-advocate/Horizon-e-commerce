const express = require('express');
const router = express.Router();
const superAdminController = require('../controllers/superAdminController');
const superAdminProfileController = require('../controllers/superAdminProfileController');
const superAdminManagementController = require('../controllers/superAdminManagementController');
const { requireSuperAdmin } = require('../middleware/authMiddleware');
const { parseAvatarUpload } = require('../middleware/profileUpload');
const {
  validateChangePassword,
  validateUpdateAdminProfile,
  validateAdminNotificationPreferences,
  validateTotpToken,
  validateDisableTwoFactor,
  validateCreateApiKey,
  validateUpdateSecurityPolicy,
  validateCreateAdminAccount,
  validateUpdateAdminAccount,
  validate
} = require('../utilities/validation');

// All routes require super_admin (also enforced on dashboard mount)
router.use(requireSuperAdmin);

// --- Super admin profile (1–6) ---
router.get('/profile', superAdminProfileController.getSuperAdminProfile);
router.put('/profile', ...validateUpdateAdminProfile, validate, superAdminProfileController.updateSuperAdminProfile);
router.put('/profile/password', ...validateChangePassword, validate, superAdminProfileController.changeSuperAdminPassword);
router.post('/profile/upload/avatar', parseAvatarUpload, superAdminProfileController.uploadSuperAdminAvatar);
router.get('/profile/login-history', superAdminProfileController.getSuperAdminLoginHistory);
router.put('/profile/notifications', ...validateAdminNotificationPreferences, validate, superAdminProfileController.updateSuperAdminNotificationPreferences);
router.post('/profile/2fa/setup', superAdminProfileController.setupSuperAdminTwoFactor);
router.post('/profile/2fa/verify', ...validateTotpToken, validate, superAdminProfileController.verifySuperAdminTwoFactor);
router.delete('/profile/2fa', ...validateDisableTwoFactor, validate, superAdminProfileController.disableSuperAdminTwoFactor);

// --- API keys (7) ---
router.get('/api-keys', superAdminManagementController.listApiKeys);
router.post('/api-keys', ...validateCreateApiKey, validate, superAdminManagementController.createApiKey);
router.patch('/api-keys/:keyId/revoke', superAdminManagementController.revokeApiKey);
router.delete('/api-keys/:keyId', superAdminManagementController.deleteApiKey);

// --- Security policies (13) ---
router.get('/security-policy', superAdminManagementController.getSecurityPolicy);
router.put('/security-policy', ...validateUpdateSecurityPolicy, validate, superAdminManagementController.updateSecurityPolicy);

// --- Admin account management (8–11) ---
router.post('/admins', ...validateCreateAdminAccount, validate, superAdminController.createAdmin);
router.get('/admins', superAdminController.listAdmins);
router.get('/permissions', superAdminManagementController.listAvailablePermissions);
router.put('/admins/:adminId', ...validateUpdateAdminAccount, validate, superAdminController.updateAdmin);
router.delete('/admins/:adminId', superAdminController.deleteAdmin);
router.patch('/admins/:adminId/role', superAdminController.assignRole);
router.post('/admins/:adminId/suspend', superAdminManagementController.suspendAdmin);
router.post('/admins/:adminId/deactivate', superAdminManagementController.deactivateAdmin);
router.post('/admins/:adminId/activate', superAdminManagementController.activateAdmin);

// --- User moderation ---
router.post('/users/:userId/suspend', superAdminController.suspendUser);
router.post('/users/:userId/unsuspend', superAdminController.unsuspendUser);
router.post('/users/:userId/ban', superAdminController.banUser);
router.post('/users/:userId/unban', superAdminController.unbanUser);

// --- Orders, disputes ---
router.patch('/orders/:orderId/override', superAdminController.overrideOrder);
router.get('/disputes', superAdminController.listDisputes);
router.post('/disputes', superAdminController.createDispute);
router.patch('/disputes/:disputeId/assign', superAdminController.assignDispute);
router.patch('/disputes/:disputeId/resolve', superAdminController.resolveDispute);

// --- Audit logs (12) ---
router.get('/audit-logs', superAdminController.getAuditLogs);
router.get('/system-activity', superAdminController.getSystemActivity);

module.exports = router;
