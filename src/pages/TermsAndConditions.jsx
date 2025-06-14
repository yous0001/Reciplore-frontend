import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const TermsAndConditions = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  const sectionVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-orange-200 to-white overflow-hidden">
      <div className="container mx-auto px-4 lg:px-6 py-16">
        <motion.button
          onClick={() => navigate(-1)}
          className="mb-8 inline-flex items-center px-6 py-3 bg-orange-600 text-white font-bold rounded-full shadow-lg hover:bg-orange-700 transition-all duration-300 transform hover:-translate-y-1"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ← Back
        </motion.button>
        <motion.div
          className="bg-white/80 rounded-2xl shadow-2xl p-10 backdrop-blur-lg max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <h1 className="text-4xl font-extrabold text-gray-900 mb-6 border-b-2 border-orange-400 pb-4 text-center">
            Terms and Conditions
          </h1>
          <div className="space-y-8 text-gray-700">
            <motion.section variants={sectionVariants} initial="hidden" animate="visible">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Acceptance of Terms</h2>
              <p className="text-base leading-relaxed">
                By accessing or using Reciplore ("the Service"), you agree to be bound by these Terms and Conditions ("Terms"). If you do not agree to these Terms, please do not use the Service.
              </p>
            </motion.section>
            <motion.section variants={sectionVariants} initial="hidden" animate="visible">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Use of the Service</h2>
              <p className="text-base leading-relaxed">
                Reciplore provides a platform for discovering and sharing recipes. You agree to use the Service only for lawful purposes and in a manner that does not infringe the rights of others or restrict their use of the Service.
              </p>
            </motion.section>
            <motion.section variants={sectionVariants} initial="hidden" animate="visible">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. User Accounts</h2>
              <p className="text-base leading-relaxed">
                To access certain features, you may need to create an account. You are responsible for maintaining the confidentiality of your account information and for all activities under your account.
              </p>
            </motion.section>
            <motion.section variants={sectionVariants} initial="hidden" animate="visible">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Content Ownership</h2>
              <p className="text-base leading-relaxed">
                You retain ownership of any content you submit to Reciplore. By submitting content, you grant us a non-exclusive, royalty-free license to use, display, and distribute it on the Service.
              </p>
            </motion.section>
            <motion.section variants={sectionVariants} initial="hidden" animate="visible">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Limitation of Liability</h2>
              <p className="text-base leading-relaxed">
                Reciplore is not liable for any damages arising from your use of the Service, including but not limited to recipe inaccuracies or dietary issues. Use the Service at your own risk.
              </p>
            </motion.section>
            <motion.section variants={sectionVariants} initial="hidden" animate="visible">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Changes to Terms</h2>
              <p className="text-base leading-relaxed">
                We may update these Terms from time to time. Continued use of the Service after changes constitutes your acceptance of the new Terms.
              </p>
            </motion.section>
            <motion.section variants={sectionVariants} initial="hidden" animate="visible">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Contact Us</h2>
              <p className="text-base leading-relaxed">
                If you have any questions about these Terms, please contact us at{' '}
                <a href="mailto:reciplore0@gmail.com" className="text-orange-500 hover:underline">
                  reciplore0@gmail.com
                </a>.
              </p>
            </motion.section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TermsAndConditions;