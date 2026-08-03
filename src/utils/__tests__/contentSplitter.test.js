import { splitArticleContent } from '../contentSplitter';

describe('splitArticleContent', () => {
  it('splits content after the first paragraph by default', () => {
    const html = `
      <figure class="lead-img"><img src="test.jpg" /></figure>
      <p>This is the first paragraph with important introductory content.</p>
      <p>This is the second paragraph which should be hidden when adblocker is enabled.</p>
      <h2>Subheading</h2>
      <p>Third paragraph with details.</p>
    `;

    const { introHtml, restrictedHtml, totalParagraphs } = splitArticleContent(html, 1);

    expect(totalParagraphs).toBe(3);
    expect(introHtml).toContain('This is the first paragraph with important introductory content.');
    expect(introHtml).toContain('lead-img');
    expect(introHtml).not.toContain('second paragraph');
    expect(restrictedHtml).toContain('second paragraph');
    expect(restrictedHtml).toContain('Subheading');
    expect(restrictedHtml).toContain('Third paragraph');
  });

  it('handles content with no paragraph tags gracefully', () => {
    const html = `<div>Single block content</div>`;
    const { introHtml, restrictedHtml } = splitArticleContent(html, 1);

    expect(introHtml).toContain('Single block content');
    expect(restrictedHtml).toBe('');
  });

  it('handles empty or invalid input', () => {
    expect(splitArticleContent('')).toEqual({
      introHtml: '',
      restrictedHtml: '',
      totalParagraphs: 0
    });
    expect(splitArticleContent(null)).toEqual({
      introHtml: '',
      restrictedHtml: '',
      totalParagraphs: 0
    });
  });
});
