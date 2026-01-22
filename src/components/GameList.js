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
          {games.flatMap((game, index) => [
            <Link to={`/games?game=${game.slug || game.id}`} key={game.id} className="text-gray-300 bg-accent-pink-500/10 rounded-md p-3 text-center hover:text-accent-violet-300 transition-colors duration-300 flex-shrink-0 whitespace-nowrap">
              <img class="rounded-md h-32 md:h-44 object-cover w-full" src={'/assets/images/home/' + game.slug + '.png'} alt={'image of ' + game.name}/>
              <div  className="mt-2 font-bold">{game.name}</div>
            </Link>
          ]).filter(Boolean)}
        </div>
      </div>
    </div>
  );
}

export default GameList;

