function Image({ url, alt = "", className = "", width, height }) {
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
        decoding="async"
        width={width}
        height={height}
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

