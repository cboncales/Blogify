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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="flex justify-center items-center min-h-96">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-600 border-t-transparent absolute top-0"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-xl p-12 mx-4 max-w-md">
          <div className="text-6xl mb-6">📝</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Post not found
          </h1>
          <p className="text-gray-600 mb-8">
            The post you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/" className="btn-primary inline-flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back button */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 text-primary-600 hover:text-primary-700 hover:bg-white/80 rounded-xl transition-all duration-200 backdrop-blur-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="font-medium">Back to Posts</span>
          </Link>
        </div>

        {/* Post */}
        <article className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-8">
          {/* Header with gradient background */}
          <div className="bg-gradient-to-r from-primary-600 to-blue-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="text-white/90 text-sm font-medium">
                📖 Blog Post
              </div>
              {user && user.id === post.author_id && (
                <div className="flex items-center space-x-3">
                  <Link
                    to={`/edit-post/${post.id}`}
                    className="inline-flex items-center px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-200 text-sm"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Link>
                  <button
                    onClick={handleDeletePost}
                    className="inline-flex items-center px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-white rounded-lg transition-all duration-200 text-sm"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="px-8 py-8">
            <header className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
                {post.title}
              </h1>

              {/* Author and date info */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-6">
                <div className="flex items-center bg-gray-50 px-3 py-2 rounded-xl">
                  <User className="h-4 w-4 mr-2 text-primary-600" />
                  <span className="font-medium">{post.author_name}</span>
                </div>

                <div className="flex items-center bg-gray-50 px-3 py-2 rounded-xl">
                  <Calendar className="h-4 w-4 mr-2 text-primary-600" />
                  <span>{formatDate(post.created_at)}</span>
                </div>
              </div>

              {/* Tags */}
              {post.tags && (
                <div className="flex items-center mb-6">
                  <div className="flex items-center bg-gradient-to-r from-purple-100 to-blue-100 px-4 py-2 rounded-xl">
                    <Tag className="h-4 w-4 mr-2 text-purple-600" />
                    <span className="text-purple-700 font-medium">{post.tags}</span>
                  </div>
                </div>
              )}
            </header>

            {/* Post content with enhanced styling */}
            <div className="prose prose-lg max-w-none">
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8 border-l-4 border-primary-500">
                {post.content.split("\n").map((paragraph, index) => (
                  <p key={index} className="mb-4 leading-relaxed text-gray-800 last:mb-0">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </article>

        {/* Comments Section */}
        <section className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Comments header */}
          <div className="bg-gradient-to-r from-green-500 to-teal-600 px-8 py-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <MessageCircle className="h-6 w-6 mr-3" />
              Comments ({comments.length})
            </h2>
          </div>

          <div className="px-8 py-8">
            {/* Add Comment Form */}
            {isAuthenticated ? (
              <div className="mb-8">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    💬 Share your thoughts
                  </h3>
                  <form onSubmit={handleSubmit(onSubmitComment)}>
                    <div className="mb-4">
                      <textarea
                        rows={4}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none transition-all duration-200"
                        placeholder="What are your thoughts on this post?"
                        {...register("content", {
                          required: "Comment cannot be empty",
                        })}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-primary inline-flex items-center disabled:opacity-50 px-6 py-3 rounded-xl"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {isSubmitting ? "Posting..." : "Post Comment"}
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="mb-8 text-center">
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8 border-2 border-dashed border-gray-200">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 mb-4">
                    Join the conversation! Sign in to share your thoughts.
                  </p>
                  <Link to="/login" className="btn-primary">
                    Sign In to Comment
                  </Link>
                </div>
              </div>
            )}

            {/* Comments List */}
            {commentsLoading ? (
              <div className="flex justify-center py-12">
                <div className="relative">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200"></div>
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent absolute top-0"></div>
                </div>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-12">
                  <MessageCircle className="h-16 w-16 mx-auto mb-6 text-gray-300" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No comments yet
                  </h3>
                  <p className="text-gray-600">
                    Be the first to share your thoughts on this post!
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {comments.map((comment, index) => (
                  <div
                    key={comment.id}
                    className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <div className="flex items-center bg-white px-3 py-1.5 rounded-lg shadow-sm">
                          <User className="h-4 w-4 mr-2 text-primary-600" />
                          <span className="font-semibold text-gray-900">{comment.author_name}</span>
                        </div>
                        <span className="mx-3 text-gray-400">•</span>
                        <span className="bg-white px-3 py-1.5 rounded-lg text-gray-600">
                          {formatDate(comment.created_at)}
                        </span>
                      </div>

                      {user && user.id === comment.user_id && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditComment(comment)}
                            className="px-3 py-1.5 text-primary-600 hover:text-primary-700 hover:bg-white rounded-lg transition-all duration-200 text-sm font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="px-3 py-1.5 text-red-600 hover:text-red-700 hover:bg-white rounded-lg transition-all duration-200 text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>

                    {editingComment === comment.id ? (
                      <form
                        onSubmit={handleEditSubmit(onSubmitEditComment)}
                        className="space-y-4"
                      >
                        <textarea
                          rows={3}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                          {...editRegister("editContent", { required: true })}
                        />
                        <div className="flex space-x-3">
                          <button
                            type="submit"
                            disabled={isEditSubmitting}
                            className="btn-primary text-sm disabled:opacity-50 px-4 py-2 rounded-lg"
                          >
                            {isEditSubmitting ? "Saving..." : "Save Changes"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingComment(null)}
                            className="btn-outline text-sm px-4 py-2 rounded-lg"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="bg-white rounded-xl p-4 border border-gray-100">
                        <p className="text-gray-800 leading-relaxed">{comment.content}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default PostDetail;
