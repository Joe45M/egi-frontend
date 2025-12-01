import {Link} from "react-router-dom";

function GameList() {
  const games = [
    "Battlefield",
    "Call of Duty",
    "Fortnite",
    "GTA",
    "PUBG",
    "Apex Legends",
    "Overwatch",
    "CS:GO"
  ];

  return (
    <div className="bg-accent-violet-950/10 py-3 overflow-x-auto scroll-smooth" style={{ WebkitOverflowScrolling: 'touch' }}>
      <ul className="flex flex-nowrap md:flex-wrap md:justify-center items-center gap-4 tracking-wider px-4 md:px-0 min-w-max md:min-w-0">
        {games.flatMap((game, index) => [
          index > 0 && (
            <li key={`separator-${index}`} className="text-gray-500 flex-shrink-0">
              /
            </li>
          ),
          <li key={game} className="text-gray-300 hover:text-accent-violet-300 transition-colors duration-300 flex-shrink-0 whitespace-nowrap">
            <Link to="">{game}</Link>
          </li>
        ]).filter(Boolean)}
      </ul>
    </div>
  );
}

export default GameList;

