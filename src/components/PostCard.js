import { Link } from 'react-router-dom';

function PostCard({ post, link }) {
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    // Fallback image if no featured image
    const imageUrl = post.image || 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800&h=600&fit=crop';

    return (
        <Link
            to={link}
            className="group bg-gradient-to-br from-accent-violet-950/20 to-base-800/30 rounded-xl overflow-hidden border border-accent-violet-900/10 hover:border-accent-violet-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-accent-violet-500/10 block h-full"
        >
            {/* Post Image */}
            <div className="aspect-video overflow-hidden bg-base-900">
                <img
                    src={imageUrl}
                    alt={post.title || 'Post image'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                />
            </div>

            {/* Post Content */}
            <div className="p-5">
                <h3
                    className="text-lg font-bold text-white group-hover:text-accent-violet-300 transition-colors line-clamp-2 mb-2"
                    dangerouslySetInnerHTML={{ __html: post.title }}
                />
                <p className="text-gray-500 text-sm">
                    {formatDate(post.date)}
                </p>
            </div>
        </Link>
    );
}

export default PostCard;
