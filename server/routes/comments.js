const express = require('express');
const router = express.Router();
const {
  getCommentsByPost,
  createComment,
  updateComment,
  deleteComment,
  getCommentById
} = require('../controllers/commentsController');
const { validateComment } = require('../middleware/validation');
const authMiddleware = require('../middleware/auth');

// @route   GET /api/posts/:postId/comments
// @desc    Get all comments for a post
// @access  Public
router.get('/posts/:postId/comments', getCommentsByPost);

// @route   POST /api/posts/:postId/comments
// @desc    Create a new comment on a post
// @access  Private
router.post('/posts/:postId/comments', authMiddleware, validateComment, createComment);

// @route   GET /api/comments/:id
// @desc    Get single comment by ID
// @access  Public
router.get('/comments/:id', getCommentById);

// @route   PUT /api/comments/:id
// @desc    Update a comment
// @access  Private (author only)
router.put('/comments/:id', authMiddleware, validateComment, updateComment);

// @route   DELETE /api/comments/:id
// @desc    Delete a comment
// @access  Private (author only)
router.delete('/comments/:id', authMiddleware, deleteComment);

module.exports = router; 