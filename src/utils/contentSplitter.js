/**
 * Splits HTML article content after a specified number of paragraphs.
 *
 * @param {string} html - The complete article HTML content.
 * @param {number} paragraphIndex - The paragraph index to split after (default 1).
 * @returns {{ introHtml: string, restrictedHtml: string, totalParagraphs: number }}
 */
export function splitArticleContent(html, paragraphIndex = 1) {
  if (!html || typeof html !== 'string') {
    return { introHtml: '', restrictedHtml: '', totalParagraphs: 0 };
  }

  // Match all paragraph tags <p ...>...</p>
  const paragraphRegex = /<p\b[^>]*>[\s\S]*?<\/p>/gi;
  const matches = [...html.matchAll(paragraphRegex)];
  const totalParagraphs = matches.length;

  if (totalParagraphs === 0) {
    // Fallback if content has no <p> tags (e.g., plain text or raw divs)
    // Find first double line break or split in half
    const breakIndex = html.indexOf('</div>');
    if (breakIndex !== -1) {
      const cutPoint = breakIndex + 6;
      return {
        introHtml: html.slice(0, cutPoint),
        restrictedHtml: html.slice(cutPoint),
        totalParagraphs: 1
      };
    }
    // Return full content as intro if very short or unstructured
    return {
      introHtml: html,
      restrictedHtml: '',
      totalParagraphs: 0
    };
  }

  // Determine split index
  const splitMatchIndex = Math.min(paragraphIndex - 1, matches.length - 1);
  const targetMatch = matches[splitMatchIndex];
  
  // Calculate cut position (end of target <p> tag)
  const cutPoint = targetMatch.index + targetMatch[0].length;

  const introHtml = html.slice(0, cutPoint).trim();
  const restrictedHtml = html.slice(cutPoint).trim();

  return {
    introHtml,
    restrictedHtml,
    totalParagraphs
  };
}
