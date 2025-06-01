import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { postsAPI, commentsAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  Calendar,
  User,
  Tag,
  Edit,
  Trash2,
  MessageCircle,
  Send,
  ArrowLeft,
} from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

const PostDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [editingComment, setEditingComment] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm();
  const {
    register: editRegister,
    handleSubmit: handleEditSubmit,
    setValue,
    formState: { isSubmitting: isEditSubmitting },
  } = useForm();

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await postsAPI.getPost(id);
      setPost(response.data.post);
    } catch (error) {
      console.error("Error fetching post:", error);
      toast.error("Failed to load post");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await commentsAPI.getPostComments(id);
      setComments(response.data.comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleDeletePost = async () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await postsAPI.deletePost(id);
        toast.success("Post deleted successfully");
        navigate("/");
      } catch (error) {
        toast.error("Failed to delete post");
      }
    }
  };

  const onSubmitComment = async (data) => {
    try {
      const response = await commentsAPI.createComment(id, data.content);
      setComments([...comments, response.data.comment]);
      reset();
      toast.success("Comment added successfully");
    } catch (error) {
      toast.error("Failed to add comment");
    }
  };

  const handleEditComment = (comment) => {
    setEditingComment(comment.id);
    setValue("editContent", comment.content);
  };

  const onSubmitEditComment = async (data) => {
    try {
      const response = await commentsAPI.updateComment(
        editingComment,
        data.editContent
      );
      setComments(
        comments.map((c) =>
          c.id === editingComment ? response.data.comment : c
        )
      );
      setEditingComment(null);
      toast.success("Comment updated successfully");
    } catch (error) {
      toast.error("Failed to update comment");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      try {
        await commentsAPI.deleteComment(commentId);
        setComments(comments.filter((c) => c.id !== commentId));
        toast.success("Comment deleted successfully");
      } catch (error) {
        toast.error("Failed to delete comment");
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Post not found
        </h1>
        <Link to="/" className="btn-primary">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back button */}
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center text-primary-600 hover:text-primary-500"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Posts
        </Link>
      </div>

      {/* Combined Post and Comments Card */}
      <div className="card">
        {/* Post Section */}
        <article className="p-8">
          <header className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {post.title}
            </h1>

            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  <span>{post.author_name}</span>
                </div>

                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{formatDate(post.created_at)}</span>
                </div>
              </div>

              {user && user.id === post.author_id && (
                <div className="flex items-center space-x-2">
                  <Link
                    to={`/edit-post/${post.id}`}
                    className="inline-flex items-center text-primary-600 hover:text-primary-500"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Link>
                  <button
                    onClick={handleDeletePost}
                    className="inline-flex items-center text-red-600 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </button>
                </div>
              )}
            </div>

            {post.tags && (
              <div className="flex items-center text-sm text-gray-500 mb-6">
                <Tag className="h-4 w-4 mr-1" />
                <span>{post.tags}</span>
              </div>
            )}
          </header>

          <div className="post-content">
            {post.content.split("\n").map((paragraph, index) => (
              <p key={index} className="mb-4 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </article>

        {/* Divider Line */}
        <div className="border-t border-gray-200 mx-8"></div>

        {/* Comments Section */}
        <section className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <MessageCircle className="h-6 w-6 mr-2" />
            Comments ({comments.length})
          </h2>

          {/* Add Comment Form */}
          {isAuthenticated && (
            <form onSubmit={handleSubmit(onSubmitComment)} className="mb-8">
              <div className="mb-4">
                <textarea
                  rows={3}
                  className="input-field resize-none"
                  placeholder="Share your thoughts..."
                  {...register("content", {
                    required: "Comment cannot be empty",
                  })}
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary inline-flex items-center disabled:opacity-50"
              >
                <Send className="h-4 w-4 mr-2" />
                {isSubmitting ? "Posting..." : "Post Comment"}
              </button>
            </form>
          )}

          {/* Comments List */}
          {commentsLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No comments yet. Be the first to share your thoughts!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="border-b border-gray-200 pb-6 last:border-b-0"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center text-sm text-gray-500">
                      <User className="h-4 w-4 mr-1" />
                      <span className="font-medium">{comment.author_name}</span>
                      <span className="mx-2">•</span>
                      <span>{formatDate(comment.created_at)}</span>
                    </div>

                    {user && user.id === comment.user_id && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditComment(comment)}
                          className="text-primary-600 hover:text-primary-500 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-red-600 hover:text-red-500 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>

                  {editingComment === comment.id ? (
                    <form
                      onSubmit={handleEditSubmit(onSubmitEditComment)}
                      className="mt-2"
                    >
                      <textarea
                        rows={2}
                        className="input-field resize-none mb-2"
                        {...editRegister("editContent", { required: true })}
                      />
                      <div className="flex space-x-2">
                        <button
                          type="submit"
                          disabled={isEditSubmitting}
                          className="btn-primary text-sm disabled:opacity-50"
                        >
                          {isEditSubmitting ? "Saving..." : "Save"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingComment(null)}
                          className="btn-outline text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="text-gray-700 leading-relaxed">
                      {comment.content}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default PostDetail;
