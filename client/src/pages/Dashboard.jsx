import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { postsAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  PlusCircle,
  Edit,
  Trash2,
  Calendar,
  MessageCircle,
  User,
  BarChart3,
} from "lucide-react";
import toast from "react-hot-toast";

const Dashboard = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchUserPosts();
  }, []);

  const fetchUserPosts = async () => {
    try {
      const response = await postsAPI.getUserPosts();
      setPosts(response.data.posts);
    } catch (error) {
      console.error("Error fetching user posts:", error);
      toast.error("Failed to load your posts");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this post? This action cannot be undone."
      )
    ) {
      try {
        setDeleting(postId);
        await postsAPI.deletePost(postId);
        setPosts(posts.filter((post) => post.id !== postId));
        toast.success("Post deleted successfully");
      } catch (error) {
        toast.error("Failed to delete post");
      } finally {
        setDeleting(null);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const totalComments = posts.reduce(
    (sum, post) => sum + parseInt(post.comment_count || 0),
    0
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">
              Welcome back, {user?.username}! Manage your posts and track your
              engagement.
            </p>
          </div>

          <Link
            to="/create-post"
            className="btn-primary inline-flex items-center"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            New Post
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-primary-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Posts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {posts.length}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <MessageCircle className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Comments
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalComments}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <User className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Member Since
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatDate(user?.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Posts */}
      <div className="card">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Your Posts</h2>
        </div>

        {posts.length === 0 ? (
          <div className="p-12 text-center">
            <PlusCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No posts yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start sharing your thoughts and stories with the community.
            </p>
            <Link to="/create-post" className="btn-primary">
              Create Your First Post
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {posts.map((post) => (
              <div
                key={post.id}
                className="p-6 hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <Link
                        to={`/posts/${post.id}`}
                        className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors duration-200"
                      >
                        {post.title}
                      </Link>
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {post.content.length > 150
                        ? post.content.substring(0, 150) + "..."
                        : post.content}
                    </p>

                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{formatDate(post.created_at)}</span>
                      </div>

                      <div className="flex items-center">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        <span>{post.comment_count || 0} comments</span>
                      </div>

                      {post.updated_at !== post.created_at && (
                        <span className="text-amber-600 font-medium">
                          Updated {formatDate(post.updated_at)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <Link
                      to={`/posts/${post.id}`}
                      className="btn-outline text-sm"
                    >
                      View
                    </Link>

                    <Link
                      to={`/edit-post/${post.id}`}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors duration-200"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Link>

                    <button
                      onClick={() => handleDeletePost(post.id)}
                      disabled={deleting === post.id}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:text-red-500 transition-colors duration-200 disabled:opacity-50"
                    >
                      {deleting === post.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-1"></div>
                      ) : (
                        <Trash2 className="h-4 w-4 mr-1" />
                      )}
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
