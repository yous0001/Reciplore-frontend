import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Loader } from "lucide-react";
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-toastify';
import Input from '../../components/Input';

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { resetPassword, isLoading } = useAuthStore();

  const {token} = useParams();
  console.log("Reset Password Token:", token);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword) {
      toast.error("Please enter a new password");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }
    if (!token) {
      toast.error("Invalid or missing token");
      return;
    }
    await resetPassword(token, newPassword, navigate);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden"
    >
      <div className="p-8">
        <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-orange-500 to-amber-500 text-transparent bg-clip-text">
          Reset Password
        </h2>
        <form onSubmit={handleResetPassword}>
          <Input
            placeholder="New Password"
            type="password"
            name="newPassword"
            icon={Lock}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <motion.button
            className="mt-5 w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold rounded-lg shadow-lg hover:from-orange-600 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? <Loader className="animate-spin w-6 h-6 mx-auto" /> : 'Reset Password'}
          </motion.button>
        </form>
      </div>
      <div className="px-8 py-4 bg-gray-900 bg-opacity-50 flex justify-center">
        <p className="text-sm text-gray-400">
          Remember your password?{" "}
          <Link to="/auth/login" className="text-orange-400 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </motion.div>
  );
}