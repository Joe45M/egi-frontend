import { useState, useEffect, useRef } from 'react';
import PageMetadata from '../components/PageMetadata';

function Contact() {
  const [articleCount, setArticleCount] = useState(0);
  const headerRef = useRef(null);
  const cardsRef = useRef(null);
  const aboutRef = useRef(null);
  const contactRef = useRef(null);

  const targetCount = 145;
  const duration = 2000; // 2 seconds
  const steps = 60;
  const increment = targetCount / steps;
  const stepDuration = duration / steps;

  useEffect(() => {
    // Count-up animation
    let currentStep = 0;
    const countInterval = setInterval(() => {
      currentStep++;
      const newCount = Math.min(Math.floor(increment * currentStep), targetCount);
      setArticleCount(newCount);
      
      if (currentStep >= steps) {
        clearInterval(countInterval);
        setArticleCount(targetCount);
      }
    }, stepDuration);

    // Intersection Observer for fade-in animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in-up');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe all sections
    if (headerRef.current) observer.observe(headerRef.current);
    if (cardsRef.current) {
      const cards = cardsRef.current.querySelectorAll('.feature-card');
      cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.2}s`;
        observer.observe(card);
      });
    }
    if (aboutRef.current) observer.observe(aboutRef.current);
    if (contactRef.current) observer.observe(contactRef.current);

    return () => {
      clearInterval(countInterval);
      observer.disconnect();
    };
  }, [increment, stepDuration]);

  return (
    <>
      <PageMetadata
        title="Contact Us - Work With EliteGamerInsights"
        description="Get in touch with EliteGamerInsights. From early access opportunities to reviews and guest posting, let's work together to create compelling gaming content."
        keywords="contact, gaming website, work with us, guest post, game reviews, early access"
      />
      <div className="min-h-screen pt-[175px] pb-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-4xl">

        {/* About Elitegamerinsights Header */}
        <div ref={headerRef} className="text-center mb-16 opacity-0">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 animate-fade-in">About Elitegamerinsights</h2>
          <div className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-accent-violet-400 to-accent-pink-400 bg-clip-text text-transparent animate-fade-in" style={{ animationDelay: '0.2s' }}>
            GAMES. NEWS. TUTORIALS.
          </div>
          <p className="text-xl text-gray-300 mb-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>We create Compelling content which fuels gamers.</p>
          <div className="text-2xl font-bold text-accent-violet-400 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <span className="inline-block">{articleCount}</span>+ ARTICLES
          </div>
        </div>

        {/* Three Feature Sections */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="feature-card bg-base-800/50 backdrop-blur-xl rounded-xl border border-gray-500/20 p-6 opacity-0 hover:scale-105 transition-transform duration-300">
            <h3 className="text-xl font-bold text-white mb-3">Gaming culture coverage</h3>
            <p className="text-gray-400">
              Gaming is more than just picking up a controller. We understand that gaming is a lifestyle, a hobby, a job, and a world to escape mundane life. We report on the latest news, gossip and culture news.
            </p>
          </div>

          <div className="feature-card bg-base-800/50 backdrop-blur-xl rounded-xl border border-gray-500/20 p-6 opacity-0 hover:scale-105 transition-transform duration-300">
            <h3 className="text-xl font-bold text-white mb-3">Complete gaming tutorials</h3>
            <p className="text-gray-400">
              Elitegamerinsights write what we call Ultimate Guides. Tutorials which include everything you will ever need to complete that confusing quest, get that new gun, or boost that KD.
            </p>
          </div>

          <div className="feature-card bg-base-800/50 backdrop-blur-xl rounded-xl border border-gray-500/20 p-6 opacity-0 hover:scale-105 transition-transform duration-300">
            <h3 className="text-xl font-bold text-white mb-3">We love what we do</h3>
            <p className="text-gray-400">
              Really, we do. EGI was founded in April 2023, and since then we've created over 145 guides, 20+ short-form videos, and countless interactions online. We love helping gamers.
            </p>
          </div>
        </div>

        {/* Who are we? Section */}
        <div ref={aboutRef} className="bg-base-800/50 backdrop-blur-xl rounded-xl border border-gray-500/20 p-8 md:p-10 mb-12 opacity-0">
          <h2 className="text-3xl font-bold text-white mb-6">Who are we?</h2>
          <div className="text-gray-300 leading-relaxed space-y-4 wp-content">
            <p>
              EliteGamerInsights (EGI) is your digital home for all things gaming. Established in April 2023 by a dynamic duo of gaming enthusiasts, EGI stands as a testament to our passion for interactive entertainment and our commitment to empowering gamers everywhere. We're much more than a typical gaming website – we're a friendly community, a virtual classroom, and your go-to news hub, all rolled into one engaging platform.
            </p>
            <p>
              Our founders, once just two gamers with a dream, poured their love for video games into the creation of EGI. They understood the hurdles every gamer encounters - the strategy uncertainties, the tough bosses, the elusive Easter eggs - and with that understanding, EliteGamerInsights was born. We're driven by the belief that gaming is an art form to be shared, a puzzle to be solved, and a story to be told, so we're here to ensure that no gamer ever has to face their virtual challenges alone.
            </p>
          </div>
        </div>

        {/* Work with us Section */}
        <div ref={contactRef} className="bg-gradient-to-br from-accent-violet-500/20 to-accent-pink-500/20 border border-accent-violet-500/30 rounded-xl p-8 md:p-10 opacity-0">
          <h2 className="text-3xl font-bold text-white mb-4">Work with us</h2>
          <p className="text-gray-300 text-lg mb-6">
            Nothing gets us excited like a new project.
          </p>
          <p className="text-gray-300 mb-6">
            From early access, to reviews and guest posting, lets work together.
          </p>
          <div className="mt-6">
            <a 
              href="mailto:contact@elitegamerinsights.com" 
              className="inline-block px-6 py-3 bg-gradient-to-r from-accent-pink-500 to-accent-violet-500 rounded-full text-white font-semibold hover:from-accent-pink-600 hover:to-accent-violet-600 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-accent-violet-500/50"
            >
              contact@elitegamerinsights.com
            </a>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

export default Contact;

