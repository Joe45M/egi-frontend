import PageMetadata from '../components/PageMetadata';

function Privacy() {
  return (
    <>
      <PageMetadata
        title="Privacy Policy"
        description="Read EliteGamerInsights' privacy policy to understand how we collect, use, and protect your personal information when you visit our website."
        keywords="privacy policy, data protection, GDPR, CCPA, privacy rights"
      />
      <div className="min-h-screen pt-[175px] pb-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-accent-violet-400 to-accent-pink-400 bg-clip-text text-transparent">
          Privacy Policy
        </h1>
        
        <div className="text-gray-300 leading-relaxed space-y-6 wp-content">
          <p className="text-gray-400 text-sm mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 mt-8">Introduction</h2>
            <p>
              EliteGamerInsights ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website <strong>elitegamerinsights.com</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 mt-8">Information We Collect</h2>
            <h3 className="text-xl font-semibold text-gray-100 mb-3 mt-6">Information You Provide</h3>
            <p>We may collect information that you voluntarily provide to us, including:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Name and email address when you subscribe to our newsletter</li>
              <li>Comments and feedback when you interact with our content</li>
              <li>Information provided when you contact us</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-100 mb-3 mt-6">Automatically Collected Information</h3>
            <p>When you visit our website, we may automatically collect certain information, including:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li>IP address and browser type</li>
              <li>Device information and operating system</li>
              <li>Pages visited and time spent on pages</li>
              <li>Referring website addresses</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 mt-8">How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Provide, maintain, and improve our website and services</li>
              <li>Send you newsletters and updates (with your consent)</li>
              <li>Respond to your comments, questions, and requests</li>
              <li>Analyze website usage and trends</li>
              <li>Detect, prevent, and address technical issues</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 mt-8">Cookies and Tracking Technologies</h2>
            <p>
              We use cookies and similar tracking technologies to track activity on our website and store certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our website.
            </p>
            <p>
              For more detailed information about our use of cookies, please see our <a href="/cookies" className="text-accent-violet-400 underline">Cookie Policy</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 mt-8">Third-Party Services</h2>
            <p>
              We may use third-party services that collect, monitor, and analyze information, including:
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Google Analytics for website analytics</li>
              <li>Social media platforms for content sharing</li>
              <li>Email service providers for newsletter delivery</li>
              <li>Advertising networks for displaying ads</li>
            </ul>
            <p>
              These third parties have their own privacy policies addressing how they use such information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 mt-8">Data Security</h2>
            <p>
              We implement appropriate technical and organizational security measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 mt-8">Your Rights</h2>
            <p>Depending on your location, you may have certain rights regarding your personal information, including:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li>The right to access your personal information</li>
              <li>The right to correct inaccurate information</li>
              <li>The right to request deletion of your information</li>
              <li>The right to opt-out of certain data processing activities</li>
              <li>The right to data portability</li>
              <li>The right to object to processing of your information</li>
            </ul>
            <p>
              To exercise these rights, please contact us using the information provided in the "Contact Us" section below.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 mt-8">California Privacy Rights (CCPA)</h2>
            <p>
              If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA), including:
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li>The right to know what personal information we collect, use, and disclose</li>
              <li>The right to delete your personal information</li>
              <li>The right to opt-out of the sale of your personal information</li>
              <li>The right to non-discrimination for exercising your privacy rights</li>
            </ul>
            <p>
              For more information, please see our <a href="/do-not-sell" className="text-accent-violet-400 underline">Do Not Sell My Personal Information</a> page.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 mt-8">GDPR Rights (EU Residents)</h2>
            <p>
              If you are located in the European Economic Area (EEA), you have certain rights under the General Data Protection Regulation (GDPR), including:
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li>The right to access, update, or delete your personal information</li>
              <li>The right to rectification of inaccurate data</li>
              <li>The right to restrict processing</li>
              <li>The right to data portability</li>
              <li>The right to withdraw consent</li>
            </ul>
            <p>
              For more information, please see our <a href="/gdpr" className="text-accent-violet-400 underline">GDPR Policy</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 mt-8">Children's Privacy</h2>
            <p>
              Our website is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 mt-8">Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 mt-8">Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us:
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

export default Privacy;

