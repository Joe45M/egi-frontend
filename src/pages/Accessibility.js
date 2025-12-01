import PageMetadata from '../components/PageMetadata';

function Accessibility() {
  return (
    <>
      <PageMetadata
        title="Accessibility Statement"
        description="EliteGamerInsights is committed to digital accessibility. Learn about our accessibility features and how we ensure our website is accessible to all users."
        keywords="accessibility, WCAG, ADA, website accessibility, accessible design"
      />
      <div className="min-h-screen pt-[175px] pb-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-accent-violet-400 to-accent-pink-400 bg-clip-text text-transparent">
          Accessibility Statement
        </h1>
        
        <div className="text-gray-300 leading-relaxed space-y-6 wp-content">
          <p className="text-gray-400 text-sm mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 mt-8">Our Commitment</h2>
            <p>
              EliteGamerInsights is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards to achieve these goals.
            </p>
            <p>
              We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 level AA standards, which explains how to make web content more accessible for people with disabilities.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 mt-8">Accessibility Features</h2>
            <p>We have implemented the following accessibility features on our website:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li><strong>Keyboard Navigation:</strong> Our website can be navigated using only a keyboard</li>
              <li><strong>Screen Reader Support:</strong> Content is structured with proper headings and semantic HTML</li>
              <li><strong>Alt Text:</strong> Images include descriptive alt text for screen readers</li>
              <li><strong>Color Contrast:</strong> Text and background colors meet WCAG contrast requirements</li>
              <li><strong>Text Resizing:</strong> Text can be resized up to 200% without loss of functionality</li>
              <li><strong>Focus Indicators:</strong> Clear focus indicators for keyboard navigation</li>
              <li><strong>Form Labels:</strong> All form inputs have associated labels</li>
              <li><strong>Skip Links:</strong> Skip navigation links to bypass repetitive content</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 mt-8">Ongoing Efforts</h2>
            <p>
              We are continuously working to improve the accessibility of our website. Our efforts include:
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Regular accessibility audits and testing</li>
              <li>Training our team on accessibility best practices</li>
              <li>Reviewing and updating content for accessibility</li>
              <li>Implementing feedback from users with disabilities</li>
              <li>Staying current with accessibility standards and guidelines</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 mt-8">Known Limitations</h2>
            <p>
              Despite our best efforts to ensure accessibility, there may be some limitations. We are aware of the following areas that may need improvement:
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Some third-party content or embedded media may not be fully accessible</li>
              <li>Older content may not meet current accessibility standards</li>
              <li>Some interactive features may require mouse interaction</li>
            </ul>
            <p>
              We are working to address these limitations and improve accessibility across all areas of our website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 mt-8">Assistive Technologies</h2>
            <p>
              Our website is designed to work with various assistive technologies, including:
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Screen readers (JAWS, NVDA, VoiceOver)</li>
              <li>Screen magnification software</li>
              <li>Voice recognition software</li>
              <li>Alternative input devices</li>
              <li>Browser accessibility features</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 mt-8">Feedback and Reporting Issues</h2>
            <p>
              We welcome your feedback on the accessibility of EliteGamerInsights. If you encounter any accessibility barriers or have suggestions for improvement, please contact us:
            </p>
            <ul className="list-none ml-0 space-y-2 mt-4">
              <li>Email: <a href="mailto:accessibility@elitegamerinsights.com" className="text-accent-violet-400 underline">accessibility@elitegamerinsights.com</a></li>
              <li>Website: <a href="/contact" className="text-accent-violet-400 underline">Contact Us</a></li>
            </ul>
            <p>
              When reporting accessibility issues, please include:
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li>The URL of the page where you encountered the issue</li>
              <li>A description of the accessibility barrier</li>
              <li>The assistive technology you were using (if applicable)</li>
              <li>Your contact information (optional, but helpful for follow-up)</li>
            </ul>
            <p>
              We aim to respond to accessibility feedback within 5 business days.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 mt-8">Third-Party Content</h2>
            <p>
              Our website may include third-party content or links to third-party websites. We do not control the accessibility of third-party content and cannot guarantee their compliance with accessibility standards.
            </p>
            <p>
              If you encounter accessibility issues with third-party content, we encourage you to contact the third-party directly or report the issue to us so we can work with them to improve accessibility.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 mt-8">Standards and Guidelines</h2>
            <p>
              We strive to meet or exceed the following accessibility standards:
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li><strong>WCAG 2.1 Level AA:</strong> Web Content Accessibility Guidelines</li>
              <li><strong>Section 508:</strong> U.S. federal accessibility requirements</li>
              <li><strong>ADA:</strong> Americans with Disabilities Act compliance</li>
              <li><strong>EN 301 549:</strong> European accessibility standard</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 mt-8">Updates to This Statement</h2>
            <p>
              We will review and update this accessibility statement regularly to reflect our ongoing efforts and any changes to our website. The "Last updated" date at the top of this page indicates when this statement was last revised.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 mt-8">Contact Information</h2>
            <p>
              For questions or concerns about accessibility on EliteGamerInsights, please contact us:
            </p>
            <ul className="list-none ml-0 space-y-2 mt-4">
              <li>Email: <a href="mailto:accessibility@elitegamerinsights.com" className="text-accent-violet-400 underline">accessibility@elitegamerinsights.com</a></li>
              <li>Website: <a href="/contact" className="text-accent-violet-400 underline">Contact Us</a></li>
            </ul>
          </section>
        </div>
      </div>
    </div>
    </>
  );
}

export default Accessibility;

