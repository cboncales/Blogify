import { Link } from "react-router-dom";
import { Calendar, User, MessageCircle, Tag } from "lucide-react";

const PostCard = ({ post }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getPreview = (content, maxLength = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  return (
    <div className="card p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="mb-4">
        <Link
          to={`/posts/${post.id}`}
          className="text-xl font-semibold text-gray-900 hover:text-primary-600 transition-colors duration-200"
        >
          {post.title}
        </Link>
      </div>

      <div className="mb-4">
        <p className="text-gray-600 leading-relaxed">
          {getPreview(post.content)}
        </p>
      </div>

      {post.tags && (
        <div className="mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <Tag className="h-4 w-4 mr-1" />
            <span>{post.tags}</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-gray-500">
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

        <div className="flex items-center">
          <MessageCircle className="h-4 w-4 mr-1" />
          <span>{post.comment_count || 0} comments</span>
        </div>
      </div>

      <div className="mt-4">
        <Link to={`/posts/${post.id}`} className="btn-outline">
          Read More
        </Link>
      </div>
    </div>
  );
};

export default PostCard;
