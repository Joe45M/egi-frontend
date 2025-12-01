function Image({ url, alt = "", className = "" }) {
  if (!url) {
    return null;
  }

  return (
    <figure className={`my-6 ${className}`}>
      <img
        src={url}
        alt={alt}
        className="w-full h-auto rounded-lg shadow-lg"
        loading="lazy"
      />
      {alt && (
        <figcaption className="text-sm text-base-400 mt-2 text-center italic">
          {alt}
        </figcaption>
      )}
    </figure>
  );
}

export default Image;

