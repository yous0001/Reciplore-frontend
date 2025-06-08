import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function TwoFactorAuth() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const isLoading = false;

  const handleChange = (index, value) => {
    const newCode = [...code];

    if (value.length > 1) {
      // This block should now be handled by onPaste
      return;
    }

    newCode[index] = value;
    setCode(newCode);
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    } else if (!value && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6); // Get only digits, max 6
    const newCode = pastedData.split('').slice(0, 6); // Ensure exactly 6 digits or less
    while (newCode.length < 6) newCode.push(''); // Pad with empty strings if less than 6
    setCode(newCode);

    // Focus on the last filled input or the next empty one
    const lastFilledIndex = newCode.findLastIndex((digit) => digit !== '');
    const focusIndex = lastFilledIndex + 1 < 6 ? lastFilledIndex + 1 : 5;
    if (inputRefs.current[focusIndex]) {
      inputRefs.current[focusIndex].focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const verificationCode = code.join(''); 
    
    if (!isLoading && !code.some((digit) => !digit)) {
      console.log('Code submitted:', code.join(''));
      // navigate('/next-page'); // Example navigation
    }
  };

  useEffect(() => {
    if(code.every((digit) => digit !== '')){
      handleSubmit(new Event('submit'));
    }
  }, [code]);

  
  return (
    <div className="max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-full max-w-md"
      >
        <form onSubmit={handleSubmit}>
          <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-orange-400 to-amber-500 text-transparent bg-clip-text">
            Verify Your Login
          </h2>
          <p className="text-center text-gray-300 mb-6">Enter the 6-digit code sent to your email address.</p>
          <div className="space-y-6 mb-5">
            <div className="flex justify-between" onPaste={handlePaste}>
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-2xl font-bold bg-gray-700 text-white border-2 border-gray-500 rounded-lg focus:border-orange-500 focus:outline-none"
                />
              ))}
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={isLoading || code.some((digit) => !digit)}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:from-orange-600 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 disabled:opacity-50"
          >
            {isLoading ? 'Verifying...' : 'Verify Email'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}