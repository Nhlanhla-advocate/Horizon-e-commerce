const formidable = require('formidable');
const {
    UPLOAD_DIR,
    MAX_FILE_SIZE,
    ensureUploadDir,
    validateImageFile,
    finalizeUpload,
    cleanupUploadedFiles
} = require('../utilities/profileImageStorage');

const normalizeUploadedFiles = (files) => {
    if (!files) return [];

    return Object.values(files).flatMap((entry) => (Array.isArray(entry) ? entry : [entry]));
};

const createProfileUploadMiddleware = ({ fieldName, maxFiles = 1, multiples = false }) => {
    return (req, res, next) => {
        const contentType = req.headers['content-type'] || '';
        if (!contentType.includes('multipart/form-data')) {
            return res.status(400).json({ message: 'Content-Type must be multipart/form-data' });
        }

        ensureUploadDir();

        const form = formidable({
            uploadDir: UPLOAD_DIR,
            keepExtensions: true,
            maxFiles,
            maxFileSize: MAX_FILE_SIZE,
            multiples
        });

        form.parse(req, async (err, fields, files) => {
            if (err) {
                return res.status(400).json({ message: err.message || 'Upload failed' });
            }

            const rawFiles = normalizeUploadedFiles(files[fieldName]);
            if (rawFiles.length === 0) {
                return res.status(400).json({ message: `Missing file field: ${fieldName}` });
            }

            for (const file of rawFiles) {
                const validation = validateImageFile(file);
                if (!validation.ok) {
                    await cleanupUploadedFiles(rawFiles);
                    return res.status(400).json({ message: validation.message });
                }
            }

            try {
                req.uploadedFiles = await Promise.all(
                    rawFiles.map((file) => finalizeUpload(file, req.user._id))
                );
                req.uploadFields = fields;
                next();
            } catch (uploadError) {
                await cleanupUploadedFiles(rawFiles);
                next(uploadError);
            }
        });
    };
};

const parseAvatarUpload = createProfileUploadMiddleware({
    fieldName: 'image',
    maxFiles: 1,
    multiples: false
});

const parseProfileImagesUpload = createProfileUploadMiddleware({
    fieldName: 'images',
    maxFiles: 5,
    multiples: true
});

module.exports = {
    parseAvatarUpload,
    parseProfileImagesUpload
};
