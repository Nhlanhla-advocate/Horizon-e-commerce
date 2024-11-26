const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware'); 



// Admin-only route to get all users
router.get("/users",
  authMiddleware,
  );

router.get("/users/posts", authMiddleware)

// Admin-only route to delete a list of users
router.delete("/users/delete", authMiddleware);

//Admin route to delete user Posts
router.delete("/users/posts/delete", authMiddleware);




module.exports = router;
