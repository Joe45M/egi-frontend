import { useState, useEffect } from 'react';
import { addToReadlist, removeFromReadlist, isInReadlist } from '../utils/readlist';

function SavePost({ slug, postType = 'games' }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (slug) {
      setSaved(isInReadlist(slug));
    }
  }, [slug]);

  const handleToggle = () => {
    if (!slug) return;

    if (saved) {
      const removed = removeFromReadlist(slug);
      if (removed) {
        setSaved(false);
        // Dispatch custom event to notify other components
        window.dispatchEvent(new Event('readlistUpdated'));
      }
    } else {
      const added = addToReadlist(slug, postType);
      if (added) {
        setSaved(true);
        // Dispatch custom event to notify other components
        window.dispatchEvent(new Event('readlistUpdated'));
      }
    }
  };

  if (!slug) return null;

  return (
    <button 
      onClick={handleToggle}
      className={`flex gap-2 items-center text-white transition-colors ${
        saved 
          ? 'text-accent-pink-500 hover:text-accent-pink-400' 
          : 'hover:text-gray-300'
      }`}
      aria-label={saved ? 'Remove from readlist' : 'Save to readlist'}
    >
      <svg 
        className="w-5" 
        xmlns="http://www.w3.org/2000/svg" 
        width="32" 
        height="32" 
        fill="currentColor" 
        viewBox="0 0 256 256"
      >
        {saved ? (
          <path d="M192,24H96A16,16,0,0,0,80,40V224a8,8,0,0,0,12.65,6.51L128,193.83l35.36,36.68A8,8,0,0,0,176,224V40A16,16,0,0,0,192,24Z"></path>
        ) : (
          <path d="M192,24H96A16,16,0,0,0,80,40V56H64A16,16,0,0,0,48,72V224a8,8,0,0,0,12.65,6.51L112,193.83l51.36,36.68A8,8,0,0,0,176,224V184.69l19.35,13.82A8,8,0,0,0,208,192V40A16,16,0,0,0,192,24ZM160,208.46l-43.36-31a8,8,0,0,0-9.3,0L64,208.45V72h96Zm32-32L176,165V72a16,16,0,0,0-16-16H96V40h96Z"></path>
        )}
      </svg>
      <span className="cta">{saved ? 'Saved' : 'Save this post'}</span>
    </button>
  );
}

export default SavePost;
