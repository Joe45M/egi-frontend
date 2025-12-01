import Slider from "../components/Slider";
import Posts from "../components/Posts";
import GameList from "../components/GameList";
import PageMetadata from "../components/PageMetadata";

function Home() {
  return (
    <>
      <PageMetadata
        title="Gaming News, Tutorials & Culture Coverage"
        description="Your ultimate destination for gaming news, complete tutorials, and gaming culture. EliteGamerInsights delivers compelling content that fuels gamers with the latest updates, guides, and insights."
        keywords="gaming news, game tutorials, gaming culture, game guides, video game news, gaming tips"
      />
      <div>
          <Slider />
          <GameList />

          <div className="container mx-auto px-4 py-4">
              <h3 className="text-accent-pink-500 text-2xl font-bold mb-5">All gaming news</h3>
              <Posts />
          </div>
      </div>
    </>
  );
}

export default Home;

