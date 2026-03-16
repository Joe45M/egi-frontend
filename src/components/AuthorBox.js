import { Link } from 'react-router-dom';

/**
 * AuthorBox Component
 * Displays author information with name, description, and avatar
 * 
 * @param {Object} props
 * @param {string} props.name - Author's display name
 * @param {string} props.description - Author's bio/description
 * @param {string} props.slug - Author's slug for linking to profile
 * @param {string} props.avatarUrl - Author's avatar image URL
 */
function AuthorBox({ name, description, slug, avatarUrl }) {
    // Use fallback values if no author data is provided
    const authorName = name || 'EliteGamerInsights';
    const authorDescription = description || 'Your source for gaming news, guides, and insights. We cover the latest in gaming culture, tips, and deep dives.';
    const authorSlug = slug || null;
    const authorAvatar = avatarUrl || null;

    return (
        <div className="bg-gradient-to-br from-accent-violet-950/30 to-base-800/50 rounded-2xl p-6 mb-8 border border-accent-violet-900/20 backdrop-blur-md shadow-xl overflow-hidden relative group">
            <div className="flex flex-col sm:flex-row gap-6 items-start relative z-10">
                {/* Avatar */}
                <div className="relative shrink-0">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-accent-violet-500/30 shadow-lg bg-base-900 flex items-center justify-center">
                        {authorAvatar ? (
                            <img
                                src={authorAvatar}
                                alt={authorName}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-accent-violet-600 to-indigo-700 flex items-center justify-center text-white font-bold text-2xl">
                                {authorName.charAt(0)}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-1">
                    {/* Name & Label */}
                    <div className="mb-2">
                        <span className="text-[10px] text-accent-violet-400 uppercase tracking-[0.2em] font-bold">
                            Written by
                        </span>
                        <h3 className="text-xl font-extrabold text-white mt-0.5 tracking-tight group-hover:text-accent-violet-200 transition-colors duration-300">
                            <Link
                                to={authorSlug ? `/author/${authorSlug}` : '/'}
                                className="inline-block"
                            >
                                {authorName}
                            </Link>
                        </h3>
                    </div>

                    {/* Description */}
                    <p className="text-gray-300 text-sm leading-relaxed mb-4 font-medium opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                        {authorDescription}
                    </p>

                    {/* View Profile Link */}
                    {authorSlug && (
                        <Link
                            to={`/author/${authorSlug}`}
                            className="inline-flex items-center gap-2 text-xs font-bold text-accent-violet-400 hover:text-accent-violet-300 transition-all duration-300 group/link"
                        >
                            <span className="relative">
                                View all posts
                                <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-accent-violet-400 transition-all duration-300 group-hover/link:w-full"></span>
                            </span>
                            <svg
                                className="w-4 h-4 transform group-hover/link:translate-x-1.5 transition-transform duration-300"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </Link>
                    )}
                </div>
            </div>

            {/* Subtle background glow effect */}
            <div className="absolute -right-20 -top-20 w-40 h-40 bg-accent-violet-600/10 rounded-full blur-[80px] group-hover:bg-accent-violet-600/20 transition-colors duration-500"></div>
        </div>
    );
}

export default AuthorBox;

