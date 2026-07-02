import PageMetadata, { SITE_URL } from "../components/PageMetadata";
import StructuredSchema, { generateWebPageSchema, generateBreadcrumbSchema } from "../components/StructuredSchema";
import Slider from "../components/Slider";
import Posts from "../components/Posts";
import GameList from "../components/GameList";

function Home() {
  const schemas = [
    generateWebPageSchema({
      name: "Gaming News, Tutorials & Culture Coverage",
      description: "Your ultimate destination for gaming news, complete tutorials, and gaming culture. EliteGamerInsights delivers compelling content that fuels gamers with the latest updates, guides, and insights.",
      url: SITE_URL
    }),
    generateBreadcrumbSchema({
      items: [
        { name: "Home", url: SITE_URL }
      ]
    })
  ];

  return (
    <>
      <PageMetadata
        title="Gaming News, Tutorials & Culture Coverage"
        description="Your ultimate destination for gaming news, complete tutorials, and gaming culture. EliteGamerInsights delivers compelling content that fuels gamers with the latest updates, guides, and insights."
        keywords="gaming news, game tutorials, gaming culture, game guides, video game news, gaming tips"
      />
      <StructuredSchema schemas={schemas} />
      <div>
          {/* Visually hidden H1 for SEO - screen reader accessible */}
          <h1 className="sr-only">EliteGamerInsights - Gaming News, Tutorials & Culture Coverage</h1>
          <Slider />
          <GameList />

          <div className="container mx-auto px-4 py-4">
              <h3 className="text-accent-pink-500 text-2xl font-bold mb-5">All gaming news</h3>
              <Posts />

              <div className="mt-16 mb-8 border-t border-base-800 pt-8">
                <h2 className="text-accent-pink-500 text-2xl font-bold mb-4">Your Source for Gaming News & Culture</h2>
                <p className="text-base-300 mb-4 leading-relaxed">
                  Welcome to EliteGamerInsights, your ultimate destination for the latest <strong className="text-base-100">gaming news</strong>, comprehensive <strong className="text-base-100">game tutorials</strong>, and deep dives into gaming culture. Whether you're a casual player or a hardcore competitor, we deliver compelling content that fuels your passion for gaming.
                </p>
                <h2 className="text-accent-pink-500 text-2xl font-bold mb-4 mt-8">Expert Game Guides and Tutorials</h2>
                <p className="text-base-300 mb-4 leading-relaxed">
                  Level up your gameplay with our expertly crafted <strong className="text-base-100">game guides</strong> and tutorials. From beginner basics to advanced strategies, our detailed walkthroughs are designed to help you master your favorite titles and overcome the toughest gaming challenges.
                </p>
                <h2 className="text-accent-pink-500 text-2xl font-bold mb-4 mt-8">Stay Updated with Video Game News</h2>
                <p className="text-base-300 leading-relaxed">
                  Don't miss a beat in the fast-paced world of gaming. Our dedicated team covers breaking <strong className="text-base-100">video game news</strong>, industry trends, and exclusive insights. Join our community to stay informed about upcoming releases, updates, and the evolving gaming landscape.
                </p>
              </div>
          </div>
      </div>
    </>
  );
}

export default Home;

