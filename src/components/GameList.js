import { useState } from "react";
import { Link } from "react-router-dom";

// Fallback hardcoded games list
const FALLBACK_GAMES = [
  "Arc Raiders",
  "Minecraft",
  "Call of Duty",
  "Rust",
  "GTA",
  "Fortnite",
];

// Dimensions of optimized images to prevent Cumulative Layout Shift
const IMAGE_DIMENSIONS = {
  'arc-raiders': { width: 470, height: 470 },
  'bf6': { width: 800, height: 444 },
  'call-of-duty': { width: 460, height: 215 },
  'fortnite': { width: 595, height: 385 },
  'gta': { width: 482, height: 341 },
  'minecraft': { width: 416, height: 305 },
  'rust': { width: 467, height: 459 }
};

function GameList() {
  const [games, setGames] = useState([]);

  console.log(games)

  if (games.length === 0) {
    const fallbackGames = FALLBACK_GAMES.map((name, index) => ({
      id: index + 1,
      name: name,
      slug: name.toLowerCase().replace(/\s+/g, '-')
    }));
    setGames(fallbackGames);

    console.log(games)
  }



  return (
    <div className="bg-accent-violet-950/10 py-3 overflow-x-auto scroll-smooth" style={{ WebkitOverflowScrolling: 'touch' }}>
      <div className="container mx-auto px-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:grid-cols-6">
          {games.flatMap((game, index) => {
            const dims = IMAGE_DIMENSIONS[game.slug] || { width: 400, height: 300 };
            return [
              <Link
                to={`/games?game=${game.slug || game.id}`}
                key={game.id}
                className="relative block rounded-2xl overflow-hidden group flex-shrink-0 shadow-md hover:shadow-lg border border-base-800/50 hover:border-accent-pink-500/40 transition-all duration-300"
              >
                <img
                  className="w-full h-32 md:h-44 object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  src={'/assets/images/home/' + game.slug + '.png'}
                  alt={'image of ' + game.name}
                  loading="lazy"
                  width={dims.width}
                  height={dims.height}
                />
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-base-950/85 backdrop-blur-md px-3 py-1.5 rounded-full text-xs md:text-sm font-bold text-base-100 border border-base-700/50 shadow-md whitespace-nowrap group-hover:border-accent-pink-500/40 group-hover:text-accent-pink-300 transition-all duration-300 z-10">
                  {game.name}
                </div>
              </Link>
            ];
          }).filter(Boolean)}
        </div>
      </div>
    </div>
  );
}

export default GameList;

