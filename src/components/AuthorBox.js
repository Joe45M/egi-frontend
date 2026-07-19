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
function AuthorBox({ name, slug, avatarUrl }) {
    // Use fallback values if no author data is provided
    const authorName = name || 'EliteGamerInsights';
    const authorSlug = slug || null;
    const authorAvatar = avatarUrl || null;

    return (
        <div className="bg-gradient-to-br from-accent-violet-950/20 to-base-800/30 rounded-xl p-4 border border-accent-violet-900/10 backdrop-blur-md shadow-md overflow-hidden relative group">
            <div className="flex gap-4 items-center relative z-10">
                {/* Avatar */}
                <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-accent-violet-500/20 shadow bg-base-900 flex items-center justify-center">
                        {authorAvatar ? (
                            <img
                                src={authorAvatar}
                                alt={authorName}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-accent-violet-600 to-indigo-700 flex items-center justify-center text-white font-bold text-lg">
                                {authorName.charAt(0)}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    <span className="text-[10px] text-accent-violet-400 uppercase tracking-wider font-semibold">
                        Written by
                    </span>
                    <h3 className="text-base font-bold text-white tracking-tight group-hover:text-accent-violet-200 transition-colors duration-300 truncate">
                        {authorSlug ? (
                            <Link to={`/author/${authorSlug}`}>
                                {authorName}
                            </Link>
                        ) : (
                            authorName
                        )}
                    </h3>
                </div>
            </div>
        </div>
    );
}

export default AuthorBox;

