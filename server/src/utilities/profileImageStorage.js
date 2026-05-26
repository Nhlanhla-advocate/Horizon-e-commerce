const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const UPLOAD_DIR = path.join(__dirname, '../../uploads/profile');
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_PROFILE_IMAGES = 10;
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

const getPublicBaseUrl = () =>
    (process.env.API_PUBLIC_URL || `http://localhost:${process.env.PORT || 5000}`).replace(/\/$/, '');

const ensureUploadDir = () => {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
};

const buildPublicUrl = (filename) => `${getPublicBaseUrl()}/uploads/profile/${filename}`;

const validateImageFile = (file) => {
    if (!file) {
        return { ok: false, message: 'Image file is required' };
    }

    const ext = path.extname(file.originalFilename || '').toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
        return { ok: false, message: 'Only JPG, PNG, WEBP, and GIF images are allowed' };
    }

    if (file.mimetype && !ALLOWED_MIME_TYPES.has(file.mimetype)) {
        return { ok: false, message: 'Invalid image type' };
    }

    if (file.size > MAX_FILE_SIZE) {
        return { ok: false, message: 'Image must be 5MB or smaller' };
    }

    return { ok: true };
};

const finalizeUpload = async (file, userId) => {
    const ext = path.extname(file.originalFilename || '').toLowerCase();
    const filename = `${userId}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`;
    const destination = path.join(UPLOAD_DIR, filename);

    await fs.promises.rename(file.filepath, destination);

    return {
        filename,
        filepath: destination,
        url: buildPublicUrl(filename)
    };
};

const deleteLocalUploadIfOwned = async (url, userId) => {
    if (!url || typeof url !== 'string') return;

    const prefix = `${getPublicBaseUrl()}/uploads/profile/`;
    if (!url.startsWith(prefix)) return;

    const filename = path.basename(url);
    if (!filename.startsWith(String(userId))) return;

    const filePath = path.join(UPLOAD_DIR, filename);
    try {
        await fs.promises.unlink(filePath);
    } catch (error) {
        if (error.code !== 'ENOENT') {
            console.error('Failed to delete profile image:', error.message);
        }
    }
};

const cleanupUploadedFiles = async (files = []) => {
    await Promise.all(
        files
            .filter((file) => file?.filepath)
            .map((file) => fs.promises.unlink(file.filepath).catch(() => {}))
    );
};

module.exports = {
    UPLOAD_DIR,
    MAX_FILE_SIZE,
    MAX_PROFILE_IMAGES,
    ensureUploadDir,
    buildPublicUrl,
    validateImageFile,
    finalizeUpload,
    deleteLocalUploadIfOwned,
    cleanupUploadedFiles
};
