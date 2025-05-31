import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { postsAPI } from "../services/api";
import PostCard from "../components/PostCard";
import { ChevronLeft, ChevronRight, PlusCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchPosts(currentPage);
  }, [currentPage]);

  const fetchPosts = async (page = 1) => {
    try {
      setLoading(true);
      const response = await postsAPI.getAllPosts(page, 10);
      setPosts(response.data.posts);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Blogify
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Discover amazing stories and share your own thoughts
          </p>

          {isAuthenticated && (
            <Link
              to="/create-post"
              className="btn-primary inline-flex items-center"
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              Create Your First Post
            </Link>
          )}
        </div>
      </div>

      {/* Posts */}
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <PlusCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No posts yet
            </h3>
            <p className="text-gray-600">
              Be the first to share your story with the community.
            </p>
          </div>

          {isAuthenticated && (
            <Link to="/create-post" className="btn-primary">
              Create Post
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Posts Grid */}
          <div className="space-y-6 mb-8">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!pagination.hasPrev}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </button>

              <div className="flex space-x-1">
                {Array.from(
                  { length: pagination.totalPages },
                  (_, i) => i + 1
                ).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg ${
                      page === currentPage
                        ? "bg-primary-600 text-white"
                        : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!pagination.hasNext}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          )}

          {/* Stats */}
          <div className="mt-8 text-center text-gray-500 text-sm">
            Showing {posts.length} of {pagination.totalPosts} posts
          </div>
        </>
      )}
    </div>
  );
};

export default Home;
