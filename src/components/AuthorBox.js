import { Link } from 'react-router-dom';

/**
 * AuthorBox Component
 * Displays author information with name and description
 * 
 * @param {Object} props
 * @param {string} props.name - Author's display name
 * @param {string} props.description - Author's bio/description
 * @param {string} props.slug - Author's slug for linking to profile
 */
function AuthorBox({ name, description, slug }) {
    // Use fallback values if no author data is provided
    const authorName = name || 'EliteGamerInsights';
    const authorDescription = description || 'Your source for gaming news, guides, and insights. We cover the latest in gaming culture, tips, and deep dives.';
    const authorSlug = slug || null;

    return (
        <div className="bg-gradient-to-br from-accent-violet-950/30 to-base-800/50 rounded-xl p-6 mb-8 border border-accent-violet-900/20 backdrop-blur-sm">
            {/* Name & Label */}
            <div className="mb-2">
                <span className="text-xs text-accent-violet-400 uppercase tracking-wider font-medium">
                    Written by
                </span>
                <h3 className="text-xl font-bold text-white mt-1">
                    <Link
                        to={authorSlug ? `/author/${authorSlug}` : '/'}
                        className="hover:text-accent-violet-300 transition-colors duration-200"
                    >
                        {authorName}
                    </Link>
                </h3>
            </div>

            {/* Description */}
            <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
                {authorDescription}
            </p>

            {/* View Profile Link */}
            {authorSlug && (
                <Link
                    to={`/author/${authorSlug}`}
                    className="inline-flex items-center gap-1.5 mt-3 text-sm text-accent-violet-400 hover:text-accent-violet-300 transition-colors duration-200 group"
                >
                    <span>View all posts</span>
                    <svg
                        className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                </Link>
            )}
        </div>
    );
}

export default AuthorBox;

