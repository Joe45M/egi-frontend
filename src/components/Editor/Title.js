function Title({ level = 1, children, className = "" }) {
  const HeadingTag = `h${Math.min(Math.max(level, 1), 6)}`;
  
  const baseStyles = {
    1: "text-4xl md:text-5xl font-bold mb-6",
    2: "text-3xl md:text-4xl font-bold mb-5",
    3: "text-2xl md:text-3xl font-semibold mb-4",
    4: "text-xl md:text-2xl font-semibold mb-3",
    5: "text-lg md:text-xl font-medium mb-3",
    6: "text-base md:text-lg font-medium mb-2",
  };

  const headingLevel = Math.min(Math.max(level, 1), 6);
  const styles = `${baseStyles[headingLevel]} text-gray-300 ${className}`;

  return (
    <HeadingTag className={styles}>
      {children}
    </HeadingTag>
  );
}

export default Title;

