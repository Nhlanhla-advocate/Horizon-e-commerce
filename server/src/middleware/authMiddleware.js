const { verify } = require("jsonwebtoken");

    //Middleware function to check if user is authenticated
    const secret = process.env.JWT_SECRET;
    const authMiddleware = (req, res, next) => {

    //Extract token from authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer")) {
        return res
         .status(401)
         .json({ message: "Authorization token is required" });
    }
    const token = authHeader.split(" ")[1];
    try {
        //Verify token
        const decoded = verify(token, secret);

        //Verify user role and set user ID in request object
        if (decoded.role === "administrator") {
            req.userID = decoded.id;
        } else if (decoded.role === "user") {
            req.userID = decoded.id;
        } else if (decoded.status === "inactive") {
            return res.status(401).json({ message: "Account has been suspended, please contact support" });
        } else {
            return res.status(401).json({ message: "Unable to verify this account, please contact support" });
        }
        next();
    } catch (error) {
    console.error(error);
    return res.status(401).json({ message: "Invalid token" });    
    }
};


module.exports = authMiddleware;

