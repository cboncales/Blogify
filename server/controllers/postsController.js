const { validationResult } = require("express-validator");
const pool = require("../config/database");

// Get all posts with pagination
const getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const posts = await pool.query(
      `
      SELECT 
        p.id, p.title, p.content, p.tags, p.created_at, p.updated_at,
        u.username as author_name,
        COUNT(c.id) as comment_count
      FROM posts p
      JOIN users u ON p.author_id = u.id
      LEFT JOIN comments c ON p.id = c.post_id
      GROUP BY p.id, u.username
      ORDER BY p.created_at DESC
      LIMIT $1 OFFSET $2
    `,
      [limit, offset]
    );

    const totalResult = await pool.query("SELECT COUNT(*) FROM posts");
    const total = parseInt(totalResult.rows[0].count);

    res.json({
      posts: posts.rows,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalPosts: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Get all posts error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get single post by ID
const getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    const postResult = await pool.query(
      `
      SELECT 
        p.id, p.title, p.content, p.tags, p.created_at, p.updated_at, p.author_id,
        u.username as author_name
      FROM posts p
      JOIN users u ON p.author_id = u.id
      WHERE p.id = $1
    `,
      [id]
    );

    if (postResult.rows.length === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json({ post: postResult.rows[0] });
  } catch (error) {
    console.error("Get post by ID error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create new post
const createPost = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content, tags } = req.body;
    const authorId = req.user.id;

    const newPost = await pool.query(
      `
      INSERT INTO posts (title, content, author_id, tags)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `,
      [title, content, authorId, tags || null]
    );

    // Get the complete post with author info
    const postWithAuthor = await pool.query(
      `
      SELECT 
        p.id, p.title, p.content, p.tags, p.created_at, p.updated_at, p.author_id,
        u.username as author_name
      FROM posts p
      JOIN users u ON p.author_id = u.id
      WHERE p.id = $1
    `,
      [newPost.rows[0].id]
    );

    res.status(201).json({
      message: "Post created successfully",
      post: postWithAuthor.rows[0],
    });
  } catch (error) {
    console.error("Create post error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update post (only by author)
const updatePost = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { title, content, tags } = req.body;
    const userId = req.user.id;

    // Check if post exists and user is the author
    const postResult = await pool.query(
      "SELECT author_id FROM posts WHERE id = $1",
      [id]
    );

    if (postResult.rows.length === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (postResult.rows[0].author_id !== userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this post" });
    }

    // Update the post
    const updatedPost = await pool.query(
      `
      UPDATE posts 
      SET title = $1, content = $2, tags = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `,
      [title, content, tags || null, id]
    );

    // Get the complete post with author info
    const postWithAuthor = await pool.query(
      `
      SELECT 
        p.id, p.title, p.content, p.tags, p.created_at, p.updated_at, p.author_id,
        u.username as author_name
      FROM posts p
      JOIN users u ON p.author_id = u.id
      WHERE p.id = $1
    `,
      [id]
    );

    res.json({
      message: "Post updated successfully",
      post: postWithAuthor.rows[0],
    });
  } catch (error) {
    console.error("Update post error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete post (only by author)
const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if post exists and user is the author
    const postResult = await pool.query(
      "SELECT author_id FROM posts WHERE id = $1",
      [id]
    );

    if (postResult.rows.length === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (postResult.rows[0].author_id !== userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this post" });
    }

    // Delete the post (comments will be deleted automatically due to CASCADE)
    await pool.query("DELETE FROM posts WHERE id = $1", [id]);

    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Delete post error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get posts by user (for dashboard)
const getPostsByUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const posts = await pool.query(
      `
      SELECT 
        p.id, p.title, p.content, p.tags, p.created_at, p.updated_at,
        COUNT(c.id) as comment_count
      FROM posts p
      LEFT JOIN comments c ON p.id = c.post_id
      WHERE p.author_id = $1
      GROUP BY p.id
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3
    `,
      [userId, limit, offset]
    );

    const totalResult = await pool.query(
      "SELECT COUNT(*) FROM posts WHERE author_id = $1",
      [userId]
    );
    const total = parseInt(totalResult.rows[0].count);

    res.json({
      posts: posts.rows,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalPosts: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Get posts by user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  getPostsByUser,
};
