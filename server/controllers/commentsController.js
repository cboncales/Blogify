const { validationResult } = require("express-validator");
const pool = require("../config/database");

// Get comments for a specific post
const getCommentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // Check if post exists
    const postResult = await pool.query("SELECT id FROM posts WHERE id = $1", [
      postId,
    ]);
    if (postResult.rows.length === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comments = await pool.query(
      `
      SELECT 
        c.id, c.content, c.created_at, c.updated_at, c.user_id,
        u.username as author_name
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = $1
      ORDER BY c.created_at ASC
      LIMIT $2 OFFSET $3
    `,
      [postId, limit, offset]
    );

    const totalResult = await pool.query(
      "SELECT COUNT(*) FROM comments WHERE post_id = $1",
      [postId]
    );
    const total = parseInt(totalResult.rows[0].count);

    res.json({
      comments: comments.rows,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalComments: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Get comments error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create a new comment
const createComment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    // Check if post exists
    const postResult = await pool.query("SELECT id FROM posts WHERE id = $1", [
      postId,
    ]);
    if (postResult.rows.length === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Create the comment
    const newComment = await pool.query(
      `
      INSERT INTO comments (content, post_id, user_id)
      VALUES ($1, $2, $3)
      RETURNING *
    `,
      [content, postId, userId]
    );

    // Get the complete comment with author info
    const commentWithAuthor = await pool.query(
      `
      SELECT 
        c.id, c.content, c.created_at, c.updated_at, c.user_id, c.post_id,
        u.username as author_name
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = $1
    `,
      [newComment.rows[0].id]
    );

    res.status(201).json({
      message: "Comment created successfully",
      comment: commentWithAuthor.rows[0],
    });
  } catch (error) {
    console.error("Create comment error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update a comment (only by author)
const updateComment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    // Check if comment exists and user is the author
    const commentResult = await pool.query(
      "SELECT user_id, post_id FROM comments WHERE id = $1",
      [id]
    );

    if (commentResult.rows.length === 0) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (commentResult.rows[0].user_id !== userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this comment" });
    }

    // Update the comment
    const updatedComment = await pool.query(
      `
      UPDATE comments 
      SET content = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `,
      [content, id]
    );

    // Get the complete comment with author info
    const commentWithAuthor = await pool.query(
      `
      SELECT 
        c.id, c.content, c.created_at, c.updated_at, c.user_id, c.post_id,
        u.username as author_name
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = $1
    `,
      [id]
    );

    res.json({
      message: "Comment updated successfully",
      comment: commentWithAuthor.rows[0],
    });
  } catch (error) {
    console.error("Update comment error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a comment (only by author)
const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if comment exists and user is the author
    const commentResult = await pool.query(
      "SELECT user_id FROM comments WHERE id = $1",
      [id]
    );

    if (commentResult.rows.length === 0) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (commentResult.rows[0].user_id !== userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this comment" });
    }

    // Delete the comment
    await pool.query("DELETE FROM comments WHERE id = $1", [id]);

    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Delete comment error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get a single comment by ID
const getCommentById = async (req, res) => {
  try {
    const { id } = req.params;

    const commentResult = await pool.query(
      `
      SELECT 
        c.id, c.content, c.created_at, c.updated_at, c.user_id, c.post_id,
        u.username as author_name
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = $1
    `,
      [id]
    );

    if (commentResult.rows.length === 0) {
      return res.status(404).json({ message: "Comment not found" });
    }

    res.json({ comment: commentResult.rows[0] });
  } catch (error) {
    console.error("Get comment by ID error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getCommentsByPost,
  createComment,
  updateComment,
  deleteComment,
  getCommentById,
};
