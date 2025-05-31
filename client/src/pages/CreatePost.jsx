import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { postsAPI } from '../services/api'
import { PlusCircle, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const CreatePost = () => {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm()

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true)
      const response = await postsAPI.createPost(data)
      toast.success('Post created successfully!')
      navigate(`/posts/${response.data.post.id}`)
    } catch (error) {
      console.error('Error creating post:', error)
      toast.error(error.response?.data?.message || 'Failed to create post')
    } finally {
      setIsSubmitting(false)
    }
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
          Back to Home
        </Link>
      </div>

      <div className="card p-8">
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <PlusCircle className="h-8 w-8 text-primary-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">
              Create New Post
            </h1>
          </div>
          <p className="text-gray-600">
            Share your thoughts and stories with the community
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label 
              htmlFor="title" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Title *
            </label>
            <input
              type="text"
              id="title"
              className={`input-field ${errors.title ? 'border-red-500' : ''}`}
              placeholder="Enter a compelling title for your post"
              {...register('title', {
                required: 'Title is required',
                maxLength: {
                  value: 255,
                  message: 'Title must be less than 255 characters'
                }
              })}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label 
              htmlFor="content" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Content *
            </label>
            <textarea
              id="content"
              rows={12}
              className={`input-field resize-none ${errors.content ? 'border-red-500' : ''}`}
              placeholder="Write your post content here. You can use line breaks to separate paragraphs."
              {...register('content', {
                required: 'Content is required'
              })}
            />
            {errors.content && (
              <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
            )}
          </div>

          <div>
            <label 
              htmlFor="tags" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Tags
            </label>
            <input
              type="text"
              id="tags"
              className={`input-field ${errors.tags ? 'border-red-500' : ''}`}
              placeholder="Enter tags separated by commas (e.g., technology, web development, react)"
              {...register('tags', {
                maxLength: {
                  value: 255,
                  message: 'Tags must be less than 255 characters'
                }
              })}
            />
            {errors.tags && (
              <p className="mt-1 text-sm text-red-600">{errors.tags.message}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Optional: Add tags to help others discover your post
            </p>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <Link
              to="/"
              className="btn-outline"
            >
              Cancel
            </Link>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Post...
                </div>
              ) : (
                'Create Post'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreatePost 