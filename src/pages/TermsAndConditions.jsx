import React, { useEffect } from 'react';
   import { useNavigate } from 'react-router-dom';
   import { motion, useAnimation } from 'framer-motion';
   import { useInView } from 'react-intersection-observer';

   const TermsAndConditions = () => {
     const navigate = useNavigate();

     const containerVariants = {
       hidden: { opacity: 0, y: 50 },
       visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
     };

     const sectionVariants = {
       hidden: { opacity: 0, x: -30 },
       visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } },
     };

     const Section = ({ children, title }) => {
       const controls = useAnimation();
       const { ref, inView } = useInView({ triggerOnce: false, threshold: 0.2 });

       useEffect(() => {
         if (inView) {
           controls.start('visible');
         } else {
           controls.start('hidden');
         }
       }, [controls, inView]);

       return (
         <motion.section
           ref={ref}
           variants={sectionVariants}
           initial="hidden"
           animate={controls}
           className="mb-8"
         >
           <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-l-4 border-orange-500 pl-4">{title}</h2>
           {children}
         </motion.section>
       );
     };

     return (
       <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-orange-100 to-white overflow-hidden">
         <div className="container mx-auto px-4 lg:px-8 py-16">
           <motion.button
             onClick={() => navigate(-1)}
             className="mb-10 inline-flex items-center px-6 py-3 bg-orange-600 text-white font-bold rounded-full shadow-lg hover:bg-orange-700 transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
             whileHover={{ scale: 1.05, boxShadow: '0 8px 25px rgba(255, 107, 0, 0.3)' }}
             whileTap={{ scale: 0.95 }}
           >
             ← Back to Home
           </motion.button>
           <motion.div
             className="bg-white/90 rounded-3xl shadow-xl p-12 backdrop-blur-lg max-w-5xl mx-auto"
             variants={containerVariants}
             initial="hidden"
             animate="visible"
           >
             <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-8 border-b-2 border-orange-400 pb-4 text-center tracking-tight">
               Terms and Conditions
             </h1>
             <p className="text-gray-600 mb-10 text-center text-lg">
               Last Updated: June 14, 2025
             </p>
             <div className="space-y-12 text-gray-700 leading-relaxed">
               <Section title="1. Introduction">
                 <p className="text-base">
                   Welcome to Reciplore ("the Service"), a platform dedicated to discovering, sharing, and exploring recipes tailored to your ingredients. These Terms and Conditions ("Terms") govern your use of the Service, including our website, mobile applications, and related services. By accessing or using the Service, you agree to be bound by these Terms. If you do not agree, please refrain from using the Service.
                 </p>
               </Section>
               <Section title="2. Eligibility">
                 <p className="text-base">
                   To use the Service, you must be at least 13 years old. If you are under 18, you must have parental or guardian consent to use the Service. By using the Service, you represent and warrant that you meet these eligibility requirements.
                 </p>
               </Section>
               <Section title="3. User Accounts">
                 <p className="text-base">
                   Certain features of the Service, such as saving recipes or managing a shopping cart, require you to create an account. You are responsible for providing accurate and complete information during registration and for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account at <a href="mailto:reciplore0@gmail.com" className="text-orange-500 hover:underline">reciplore0@gmail.com</a>.
                 </p>
               </Section>
               <Section title="4. User Conduct">
                 <p className="text-base">
                   You agree to use the Service in compliance with all applicable laws and regulations. You may not:
                   <ul className="list-disc pl-6 mt-2 space-y-1">
                     <li>Use the Service for any unlawful or harmful purpose.</li>
                     <li>Post or share content that is defamatory, obscene, or infringes on the rights of others.</li>
                     <li>Attempt to gain unauthorized access to any part of the Service or its systems.</li>
                     <li>Interfere with the functionality or performance of the Service.</li>
                   </ul>
                 </p>
               </Section>
               <Section title="5. Content Ownership and Licensing">
                 <p className="text-base">
                   Any content you submit to the Service, such as recipes, comments, or images, remains your property. By submitting content, you grant Reciplore a worldwide, non-exclusive, royalty-free, perpetual license to use, display, reproduce, and distribute your content on the Service for the purpose of operating and promoting the platform. You represent that you have the right to grant this license for any content you submit.
                 </p>
               </Section>
               <Section title="6. Intellectual Property">
                 <p className="text-base">
                   All content and materials on the Service, including but not limited to text, graphics, logos, and software, are the property of Reciplore or its licensors and are protected by copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, or create derivative works from this content without prior written consent from Reciplore.
                 </p>
               </Section>
               <Section title="7. Third-Party Links and Services">
                 <p className="text-base">
                   The Service may contain links to third-party websites or services that are not owned or controlled by Reciplore. We are not responsible for the content, policies, or practices of these third-party sites. You access them at your own risk.
                 </p>
               </Section>
               <Section title="8. Disclaimer of Warranties">
                 <p className="text-base">
                   The Service is provided on an "as is" and "as available" basis. Reciplore makes no warranties, express or implied, regarding the accuracy, reliability, or suitability of the Service or its content, including recipes. You acknowledge that recipes may not meet specific dietary or health requirements, and you use them at your own risk.
                 </p>
               </Section>
               <Section title="9. Limitation of Liability">
                 <p className="text-base">
                   To the fullest extent permitted by law, Reciplore shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service, including but not limited to damages from recipe inaccuracies, data loss, or service interruptions. Our total liability shall not exceed the amount you paid, if any, to use the Service.
                 </p>
               </Section>
               <Section title="10. Termination">
                 <p className="text-base">
                   Reciplore reserves the right to suspend or terminate your access to the Service at our discretion, with or without notice, for any violation of these Terms or for any other reason. Upon termination, your account and any associated content may be deleted.
                 </p>
               </Section>
               <Section title="11. Governing Law">
                 <p className="text-base">
                   These Terms shall be governed by and construed in accordance with the laws of Egypt. Any disputes arising from these Terms or your use of the Service shall be resolved in the courts of Egypt.
                 </p>
               </Section>
               <Section title="12. Changes to These Terms">
                 <p className="text-base">
                   We may update these Terms from time to time to reflect changes in our practices or legal requirements. We will notify you of material changes by posting the updated Terms on the Service or through other communication channels. Your continued use of the Service after such changes constitutes your acceptance of the revised Terms.
                 </p>
               </Section>
               <Section title="13. Contact Information">
                 <p className="text-base">
                   For questions or concerns regarding these Terms, please contact us at:
                   <ul className="list-none pl-0 mt-2 space-y-1">
                     <li>
                       <strong>Email:</strong>{' '}
                       <a href="mailto:reciplore0@gmail.com" className="text-orange-500 hover:underline">
                         reciplore0@gmail.com
                       </a>
                     </li>
                     <li><strong>Phone:</strong> +20 1276085914</li>
                     <li><strong>Address:</strong> EELU-Sohag University, Egypt</li>
                   </ul>
                 </p>
               </Section>
             </div>
             <motion.div
               className="mt-12 text-center"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.5 }}
             >
               <p className="text-sm text-gray-500">
                 By using Reciplore, you acknowledge that you have read, understood, and agreed to these Terms and Conditions.
               </p>
             </motion.div>
           </motion.div>
         </div>
       </div>
     );
   };

   export default TermsAndConditions;