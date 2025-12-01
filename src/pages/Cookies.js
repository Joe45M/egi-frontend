import PageMetadata from '../components/PageMetadata';

function Cookies() {
  return (
    <>
      <PageMetadata
        title="Cookie Policy"
        description="Learn about how EliteGamerInsights uses cookies and similar tracking technologies to enhance your browsing experience and provide personalized content."
        keywords="cookie policy, cookies, tracking, privacy, website cookies"
      />
      <div className="min-h-screen pt-[175px] pb-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-accent-violet-400 to-accent-pink-400 bg-clip-text text-transparent">
          Cookie Policy
        </h1>
        
        <div className="text-gray-300 leading-relaxed space-y-6 wp-content">
          <p className="text-gray-400 text-sm mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 mt-8">What Are Cookies</h2>
            <p>
              Cookies are small text files that are placed on your computer or mobile device when you visit a website. Cookies are widely used to make websites work more efficiently and to provide information to the website owners.
            </p>
            <p>
              Cookies allow a website to recognize your device and store some information about your preferences or past actions. This helps improve your browsing experience by remembering your preferences and settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 mt-8">How We Use Cookies</h2>
            <p>
              EliteGamerInsights uses cookies to enhance your experience on our website. We use cookies for the following purposes:
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li>To remember your preferences and settings</li>
              <li>To analyze website traffic and usage patterns</li>
              <li>To provide personalized content and advertisements</li>
              <li>To improve website functionality and performance</li>
              <li>To enable social media features</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 mt-8">Types of Cookies We Use</h2>
            
            <h3 className="text-xl font-semibold text-gray-100 mb-3 mt-6">Essential Cookies</h3>
            <p>
              These cookies are necessary for the website to function properly. They enable core functionality such as security, network management, and accessibility. You cannot opt-out of these cookies as they are essential for the website to work.
            </p>

            <h3 className="text-xl font-semibold text-gray-100 mb-3 mt-6">Analytics Cookies</h3>
            <p>
              These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. We use services like Google Analytics to analyze website usage and improve our content and user experience.
            </p>

            <h3 className="text-xl font-semibold text-gray-100 mb-3 mt-6">Preference Cookies</h3>
            <p>
              These cookies allow our website to remember information that changes the way the website behaves or looks, such as your preferred language or region. These cookies help provide a more personalized experience.
            </p>

            <h3 className="text-xl font-semibold text-gray-100 mb-3 mt-6">Marketing Cookies</h3>
            <p>
              These cookies are used to track visitors across websites to display relevant advertisements. They may also be used to limit the number of times you see an advertisement and measure the effectiveness of advertising campaigns.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 mt-8">Third-Party Cookies</h2>
            <p>
              In addition to our own cookies, we may also use various third-party cookies to report usage statistics of the website and deliver advertisements. These third parties may include:
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li><strong>Google Analytics:</strong> For website analytics and performance monitoring</li>
              <li><strong>Social Media Platforms:</strong> For social sharing features (Twitter, Facebook, etc.)</li>
              <li><strong>Advertising Networks:</strong> For displaying relevant advertisements</li>
              <li><strong>Content Delivery Networks:</strong> For optimizing content delivery</li>
            </ul>
            <p>
              These third parties may use cookies to collect information about your online activities across different websites. We do not control these third-party cookies, and you should review the privacy policies of these third parties for more information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 mt-8">Managing Cookies</h2>
            <p>
              You have the right to accept or reject cookies. Most web browsers automatically accept cookies, but you can usually modify your browser settings to decline cookies if you prefer.
            </p>
            
            <h3 className="text-xl font-semibold text-gray-100 mb-3 mt-6">Browser Settings</h3>
            <p>You can control cookies through your browser settings. Here are links to instructions for popular browsers:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-accent-violet-400 underline">Google Chrome</a></li>
              <li><a href="https://support.mozilla.org/en-US/kb/enable-and-disable-cookies-website-preferences" target="_blank" rel="noopener noreferrer" className="text-accent-violet-400 underline">Mozilla Firefox</a></li>
              <li><a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-accent-violet-400 underline">Safari</a></li>
              <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-accent-violet-400 underline">Microsoft Edge</a></li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-100 mb-3 mt-6">Cookie Consent</h3>
            <p>
              When you first visit our website, you will be presented with a cookie consent banner. You can choose to accept all cookies, reject non-essential cookies, or customize your cookie preferences.
            </p>
            <p>
              You can change your cookie preferences at any time by clicking on the "Manage Cookie Consent" link in the footer of our website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 mt-8">Impact of Disabling Cookies</h2>
            <p>
              If you choose to disable cookies, some features of our website may not function properly. For example:
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li>You may not be able to access certain areas of the website</li>
              <li>Your preferences may not be saved</li>
              <li>Some interactive features may not work</li>
              <li>Website performance may be affected</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 mt-8">Do Not Track Signals</h2>
            <p>
              Some browsers include a "Do Not Track" (DNT) feature that signals to websites you visit that you do not want to have your online activity tracked. Currently, there is no standard for how DNT signals should be interpreted. As such, we do not currently respond to DNT browser signals or mechanisms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 mt-8">Updates to This Cookie Policy</h2>
            <p>
              We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the new Cookie Policy on this page and updating the "Last updated" date.
            </p>
            <p>
              You are advised to review this Cookie Policy periodically for any changes. Changes to this Cookie Policy are effective when they are posted on this page.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 mt-8">Contact Us</h2>
            <p>
              If you have any questions about our use of cookies or this Cookie Policy, please contact us:
            </p>
            <ul className="list-none ml-0 space-y-2 mt-4">
              <li>Email: <a href="mailto:privacy@elitegamerinsights.com" className="text-accent-violet-400 underline">privacy@elitegamerinsights.com</a></li>
              <li>Website: <a href="/contact" className="text-accent-violet-400 underline">Contact Us</a></li>
            </ul>
          </section>
        </div>
      </div>
    </div>
    </>
  );
}

export default Cookies;

