function Text({ children, className = "" }) {
  return (
    <p className={`text-base-base-100 leading-relaxed mb-4 text-gray-300 ${className}`}>
      {children}
    </p>
  );
}

export default Text;

