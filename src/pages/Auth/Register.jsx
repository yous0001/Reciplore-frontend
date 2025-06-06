import React, { useState } from 'react'
import { motion } from 'framer-motion';
import Input from '../../components/Input';
import {Lock, Mail, User } from "lucide-react"
import { Link } from 'react-router-dom';
import PasswordStrengthMeter from '../../components/PasswordStrengthMeter';

export default function Register() {
const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = (e) => {
    e.preventDefault();
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className='max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl 
    rounded-2xl shadow-xl overflow-hidden '
    >

      <div className="p-8">
        <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-orange-500 to-amber-500
      text-transparent bg-clip-text">
          Create account
        </h2>
        <form onSubmit={handleSignUp}>
          <Input placeholder="Full name" type="text" name="fullname"
            icon={User} value={name}
            onChange={e => setName(e.target.value)} />

          <Input placeholder="Email Address" type="email" name="email"
            icon={Mail} value={email}
            onChange={e => setEmail(e.target.value)} />

          <Input placeholder="Password" type="password" name="password"
            icon={Lock} value={password}
            onChange={e => setPassword(e.target.value)} />
          <PasswordStrengthMeter password={password}/>

          <motion.button
            className="mt-5 w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold rounded-lg shadow-lg hover:from-orange-600 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit">
            SIGN UP
          </motion.button>
        </form>
      </div>

      <div className="px-8 py-4 bg-gray-900 bg-opacity-50 flex justify-center">
        <p className="text-sm text-gray-400">
          Already have an account?{" "}
          <Link to={"/auth/login"} className="text-orange-400 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </motion.div>
  )
}
