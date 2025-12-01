function Posts({ posts = [] }) {
  // Sample posts data if none provided
  const defaultPosts = [
    {
      id: 1,
      title: "New AAA Game Release Announced",
      date: "2024-01-15",
      image: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800&h=600&fit=crop"
    },
    {
      id: 2,
      title: "Esports Championship Finals This Weekend",
      date: "2024-01-20",
      image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=600&fit=crop"
    },
    {
      id: 3,
      title: "Gaming Console Price Drops",
      date: "2024-01-25",
      image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&h=600&fit=crop"
    },
    {
      id: 4,
      title: "Indie Game Developer Spotlight",
      date: "2024-02-01",
      image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=600&fit=crop"
    },
    {
      id: 5,
      title: "Upcoming Game Updates and Patches",
      date: "2024-02-05",
      image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&h=600&fit=crop"
    },
    {
      id: 6,
      title: "Gaming Hardware Review: Latest GPUs",
      date: "2024-02-10",
      image: "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=800&h=600&fit=crop"
    }
  ];

  const postsToDisplay = posts.length > 0 ? posts : defaultPosts;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {postsToDisplay.map((post) => (
          <div
            key={post.id}
            className="relative group overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            {/* Background Image */}
            <div
              className="relative h-64 bg-cover bg-center"
              style={{ backgroundImage: `url(${post.image})` }}
            >
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
              
              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <p className="text-sm text-gray-300 mb-1">
                  {formatDate(post.date)}
                </p>
                <h3 className="text-xl font-bold mb-2 group-hover:text-accent-violet-300 transition-colors duration-300">
                  {post.title}
                </h3>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Posts;

