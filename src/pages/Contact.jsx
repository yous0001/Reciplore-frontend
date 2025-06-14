import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaPaperPlane, FaExclamationCircle } from 'react-icons/fa';

const Contact = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/contact`, {
        name: formData.name,
        email: formData.email,
        message: formData.message,
        to: 'reciplore0@gmail.com',
      });
      setSuccess('Message sent successfully!');
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      console.error('Contact Error:', err.response?.status, err.response?.data);
      setError('Failed to send message: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  const inputVariants = {
    focus: { scale: 1.02, boxShadow: '0 0 15px rgba(255, 107, 0, 0.3)', transition: { duration: 0.3 } },
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
          className="bg-white/80 rounded-2xl shadow-2xl p-10 backdrop-blur-lg max-w-2xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <h1 className="text-4xl font-extrabold text-gray-900 mb-6 border-b-2 border-orange-400 pb-4 text-center">
            Contact Us
          </h1>
          {success && (
            <motion.div
              className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg flex items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <FaPaperPlane className="mr-2" /> {success}
            </motion.div>
          )}
          {error && (
            <motion.div
              className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg flex items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <FaExclamationCircle className="mr-2" /> {error}
            </motion.div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <motion.input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 ${
                  errors.name ? 'border-red-300' : 'border-orange-200'
                } rounded-lg focus:outline-none focus:border-orange-500 bg-white/50`}
                placeholder="Your name"
                variants={inputVariants}
                whileFocus="focus"
              />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <motion.input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 ${
                  errors.email ? 'border-red-300' : 'border-orange-200'
                } rounded-lg focus:outline-none focus:border-orange-500 bg-white/50`}
                placeholder="Your email"
                variants={inputVariants}
                whileFocus="focus"
              />
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <motion.textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 ${
                  errors.message ? 'border-red-300' : 'border-orange-200'
                } rounded-lg focus:outline-none focus:border-orange-500 bg-white/50 h-32 resize-y`}
                placeholder="Your message"
                variants={inputVariants}
                whileFocus="focus"
              />
              {errors.message && <p className="mt-1 text-sm text-red-500">{errors.message}</p>}
            </div>
            <motion.button
              type="submit"
              className="w-full px-6 py-3 bg-orange-500 text-white font-semibold rounded-full shadow-md hover:bg-orange-600 transition-all duration-300 flex items-center justify-center"
              disabled={loading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : (
                <FaPaperPlane className="mr-2" />
              )}
              {loading ? 'Sending...' : 'Send Message'}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;