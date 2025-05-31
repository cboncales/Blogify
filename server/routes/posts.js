const express = require("express");
const router = express.Router();
const {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  getPostsByUser,
} = require("../controllers/postsController");
const { validatePost } = require("../middleware/validation");
const authMiddleware = require("../middleware/auth");

// @route   GET /api/posts
// @desc    Get all posts with pagination
// @access  Public
router.get("/", getAllPosts);

// @route   GET /api/posts/my-posts
// @desc    Get current user's posts
// @access  Private
router.get("/my-posts", authMiddleware, getPostsByUser);

// @route   GET /api/posts/:id
// @desc    Get single post by ID
// @access  Public
router.get("/:id", getPostById);

// @route   POST /api/posts
// @desc    Create a new post
// @access  Private
router.post("/", authMiddleware, validatePost, createPost);

// @route   PUT /api/posts/:id
// @desc    Update a post
// @access  Private (author only)
router.put("/:id", authMiddleware, validatePost, updatePost);

// @route   DELETE /api/posts/:id
// @desc    Delete a post
// @access  Private (author only)
router.delete("/:id", authMiddleware, deletePost);

module.exports = router;
