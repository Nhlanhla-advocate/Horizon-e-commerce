const { verify } = require("jsonwebtoken");

const secret = process.env.JWT_SECRET;

const authMiddleware = async (req, res, next) => {
    try {
        // Extract token from authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Authorization token is required" });
        }

        const token = authHeader.split(" ")[1];

        // Verify token
        const decoded = verify(token, secret);

        // Fetch user based on the role
        let user;
        if (decoded.role === "admin") {
            user = await Admin.findById(decoded._id);
            if (!user) return res.status(401).json({ message: "Admin not found" });
            req.admin = user;
        } else if (decoded.role === "user") {
            user = await User.findById(decoded._id);
            if (!user) return res.status(401).json({ message: "User not found" });
            req.user = user;
        } else if (decoded.status === "inactive") {
            return res.status(401).json({ message: "Account has been suspended, please contact support" });
        } else {
            return res.status(401).json({ message: "Invalid role, authentication failed" });
        }

        // Proceed to the next middleware
        next();
    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ error: "Invalid token" });
        } else if (error.name === "TokenExpiredError") {
            return res.status(401).json({ error: "Token has expired" });
        }
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = authMiddleware;