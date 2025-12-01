import Slider from "../components/Slider";
import Posts from "../components/Posts";
import GameList from "../components/GameList";

function Home() {
  return (
    <div>
        <Slider />
        <GameList />

        <div className="container mx-auto px-4 py-4">
            <h3 className="text-accent-pink-500 text-2xl font-bold mb-5">All gaming news</h3>
            <Posts />
        </div>
    </div>
  );
}

export default Home;

