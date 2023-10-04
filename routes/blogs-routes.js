const express = require("express");

const router = express.Router();

const blogControllers = require("../controllers/blog-controllers");

router.get("/blog-stats", blogControllers.getStats);

router.get("/blog-search", blogControllers.memoizedBlogSearch);

module.exports = router;
