import { useState, useEffect, Fragment } from "react";
import { Link } from "react-router-dom";
import wordpressApi from "../services/wordpressApi";

// Fallback hardcoded games list
const FALLBACK_GAMES = [
  "Battlefield",
  "Call of Duty",
  "Fortnite",
  "GTA",
  "PUBG",
  "Apex Legends",
  "Overwatch",
  "CS:GO"
];

function GameList() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        
        // Try different possible taxonomy names
        const possibleTaxonomies = ['games', 'game', 'game_taxonomy'];
        let gamesData = null;
        
        for (const taxonomyName of possibleTaxonomies) {
          try {
            gamesData = await wordpressApi.taxonomies.getAll(taxonomyName, {
              perPage: 100
            });
            // Check if we got valid data
            if (gamesData && Array.isArray(gamesData) && gamesData.length > 0) {
              console.log(`Successfully fetched games from taxonomy: ${taxonomyName}`, gamesData.length, 'games');
              // Store taxonomy name in each game for reference
              gamesData = gamesData.map(game => ({ ...game, taxonomy: taxonomyName }));
              break; // Success, exit loop
            }
          } catch (err) {
            // Continue to next taxonomy
            continue;
          }
        }
        
        // If taxonomy fetch failed, try extracting from posts
        if (!gamesData || !Array.isArray(gamesData) || gamesData.length === 0) {
          console.log('Taxonomy endpoint not available, trying to extract from posts...');
          try {
            // Fetch some posts to extract game terms
            const postsResult = await wordpressApi.posts.getByPostType('games', {
              perPage: 100,
              includeImages: false
            });
            
            const posts = Array.isArray(postsResult) ? postsResult : (postsResult.posts || []);
            
            // Extract unique game terms from posts
            // Note: This assumes posts have a 'games' field with term IDs
            // WordPress REST API might include taxonomy terms in _embedded
            const gameIds = new Set();
            
            posts.forEach(post => {
              // Check if post has games taxonomy field
              if (post.games && Array.isArray(post.games)) {
                post.games.forEach(gameId => {
                  gameIds.add(gameId);
                });
              }
            });
            
            // If we found game IDs, try to fetch their details
            if (gameIds.size > 0) {
              const gamePromises = Array.from(gameIds).map(id => 
                wordpressApi.taxonomies.getById('games', id).catch(() => null)
              );
              const gameDetails = await Promise.all(gamePromises);
              gamesData = gameDetails.filter(g => g !== null);
            }
          } catch (postErr) {
            console.log('Failed to extract games from posts:', postErr);
          }
        }
        
        // Transform and sort games by name
        let transformedGames = [];
        if (gamesData && Array.isArray(gamesData) && gamesData.length > 0) {
          transformedGames = gamesData
            .map(game => ({
              id: game.id,
              name: game.name || '',
              slug: game.slug || ''
            }))
            .filter(game => game.name) // Filter out games without names
            .sort((a, b) => a.name.localeCompare(b.name));
        }
        
        // If still no games, use fallback
        if (transformedGames.length === 0) {
          console.log('Using fallback games list');
          transformedGames = FALLBACK_GAMES.map((name, index) => ({
            id: index + 1,
            name: name,
            slug: name.toLowerCase().replace(/\s+/g, '-')
          }));
        }
        
        setGames(transformedGames);
      } catch (err) {
        console.error('Error fetching games from WordPress:', err);
        // Fallback to hardcoded list
        const fallbackGames = FALLBACK_GAMES.map((name, index) => ({
          id: index + 1,
          name: name,
          slug: name.toLowerCase().replace(/\s+/g, '-')
        }));
        setGames(fallbackGames);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  // Loading state - show skeleton
  if (loading) {
    // Predefined widths to simulate different game name lengths
    const skeletonWidths = [100, 120, 90, 110, 95, 130, 85, 105];
    
    return (
      <div className="bg-accent-violet-950/10 py-3 overflow-x-auto scroll-smooth" style={{ WebkitOverflowScrolling: 'touch' }}>
        <ul className="flex flex-nowrap md:flex-wrap md:justify-center items-center gap-4 tracking-wider px-4 md:px-0 min-w-max md:min-w-0">
          {skeletonWidths.map((width, i) => (
            <Fragment key={i}>
              {i > 0 && (
                <li className="text-gray-500 flex-shrink-0">
                  /
                </li>
              )}
              <li className="flex-shrink-0 whitespace-nowrap">
                <span className="inline-block h-5 bg-gray-600/30 rounded animate-pulse" style={{ width: `${width}px` }}></span>
              </li>
            </Fragment>
          ))}
        </ul>
      </div>
    );
  }

  // If no games, don't render anything
  if (games.length === 0) {
    return null;
  }

  return (
    <div className="bg-accent-violet-950/10 py-3 overflow-x-auto scroll-smooth" style={{ WebkitOverflowScrolling: 'touch' }}>
      <ul className="flex flex-nowrap md:flex-wrap md:justify-center items-center gap-4 tracking-wider px-4 md:px-0 min-w-max md:min-w-0">
        {games.flatMap((game, index) => [
          index > 0 && (
            <li key={`separator-${index}`} className="text-gray-500 flex-shrink-0">
              /
            </li>
          ),
          <li key={game.id} className="text-gray-300 hover:text-accent-violet-300 transition-colors duration-300 flex-shrink-0 whitespace-nowrap">
            <Link to={`/games?game=${game.slug || game.id}`} className="hover:underline">{game.name}</Link>
          </li>
        ]).filter(Boolean)}
      </ul>
    </div>
  );
}

export default GameList;

