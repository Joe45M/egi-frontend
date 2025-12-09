import PageMetadata, { SITE_URL } from '../components/PageMetadata';
import StructuredSchema, { generateWebPageSchema, generateBreadcrumbSchema } from '../components/StructuredSchema';

function Terms() {
  const schemas = [
    generateWebPageSchema({
      name: "Terms of Service",
      description: "Read EliteGamerInsights' terms of service to understand the rules and regulations for using our website and services.",
      url: `${SITE_URL}/terms`
    }),
    generateBreadcrumbSchema({
      items: [
        { name: 'Home', url: SITE_URL },
        { name: 'Terms of Service', url: `${SITE_URL}/terms` }
      ]
    })
  ];

  return (
    <>
      <PageMetadata
        title="Terms of Service"
        description="Read EliteGamerInsights' terms of service to understand the rules and regulations for using our website and services."
        keywords="terms of service, user agreement, website terms, legal"
      />
      <StructuredSchema schemas={schemas} />
      <div className="min-h-screen pt-[175px] pb-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-accent-violet-400 to-accent-pink-400 bg-clip-text text-transparent">
          Terms of Service
        </h1>
        
        <div className="text-gray-300 leading-relaxed space-y-6 wp-content">
          <p className="text-gray-400 text-sm mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 mt-8">Agreement to Terms</h2>
            <p>
              By accessing and using EliteGamerInsights ("the Website"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 mt-8">Use License</h2>
            <p>
              Permission is granted to temporarily access the materials on EliteGamerInsights' website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to decompile or reverse engineer any software contained on the website</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
              <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 mt-8">User Accounts</h2>
            <p>
              If you create an account on our website, you are responsible for maintaining the security of your account and password. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 mt-8">User Conduct</h2>
            <p>You agree not to:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Use the website in any way that violates any applicable law or regulation</li>
              <li>Transmit any malicious code, viruses, or harmful data</li>
              <li>Attempt to gain unauthorized access to any portion of the website</li>
              <li>Interfere with or disrupt the website or servers connected to the website</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Post false, misleading, or defamatory content</li>
              <li>Infringe upon the intellectual property rights of others</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 mt-8">Intellectual Property</h2>
            <p>
              The content on EliteGamerInsights, including but not limited to text, graphics, logos, images, and software, is the property of EliteGamerInsights or its content suppliers and is protected by copyright, trademark, and other intellectual property laws.
            </p>
            <p>
              You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any of the material on our website without prior written consent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 mt-8">User-Generated Content</h2>
            <p>
              If you post, upload, or submit any content to our website (including comments, reviews, or other submissions), you grant us a non-exclusive, royalty-free, perpetual, and worldwide license to use, reproduce, modify, adapt, publish, translate, and distribute such content in any media.
            </p>
            <p>
              You represent and warrant that you own or have the necessary rights to grant us this license and that your content does not violate any third-party rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 mt-8">Disclaimer</h2>
            <p>
              The materials on EliteGamerInsights' website are provided on an 'as is' basis. EliteGamerInsights makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 mt-8">Limitations</h2>
            <p>
              In no event shall EliteGamerInsights or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on EliteGamerInsights' website, even if EliteGamerInsights or an authorized representative has been notified orally or in writing of the possibility of such damage.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 mt-8">Links to Third-Party Websites</h2>
            <p>
              Our website may contain links to third-party websites that are not owned or controlled by EliteGamerInsights. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites.
            </p>
            <p>
              You acknowledge and agree that EliteGamerInsights shall not be responsible or liable for any damage or loss caused by or in connection with the use of any such content, goods, or services available on or through any such websites.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 mt-8">Termination</h2>
            <p>
              We may terminate or suspend your account and access to the website immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms of Service.
            </p>
            <p>
              Upon termination, your right to use the website will immediately cease. If you wish to terminate your account, you may simply discontinue using the website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 mt-8">Governing Law</h2>
            <p>
              These Terms of Service shall be governed by and construed in accordance with the laws of the jurisdiction in which EliteGamerInsights operates, without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 mt-8">Changes to Terms</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms of Service at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.
            </p>
            <p>
              What constitutes a material change will be determined at our sole discretion. By continuing to access or use our website after those revisions become effective, you agree to be bound by the revised terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 mt-8">Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <ul className="list-none ml-0 space-y-2 mt-4">
              <li>Email: <a href="mailto:legal@elitegamerinsights.com" className="text-accent-violet-400 underline">legal@elitegamerinsights.com</a></li>
              <li>Website: <a href="/contact" className="text-accent-violet-400 underline">Contact Us</a></li>
            </ul>
          </section>
        </div>
      </div>
    </div>
    </>
  );
}

export default Terms;

