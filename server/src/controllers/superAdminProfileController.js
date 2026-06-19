const Admin = require('../models/admin');
const User = require('../models/user');
const { deleteLocalUploadIfOwned } = require('../utilities/profileImageStorage');
const { generateSecret, keyuri, verifyToken } = require('../utilities/totp');
const {
    assertSuperAdminAccount,
    loadSuperAdminDocument,
    buildProfileUpdates,
    buildNotificationUpdates,
    ensureNestedDefaults,
    serializeSuperAdminProfile,
    checkUsernameAvailable
} = require('../utilities/adminProfileHelpers');