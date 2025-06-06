import React from 'react'
import { Outlet } from 'react-router-dom'
import FloatingShape from '../../components/FloatingShape'

export default function AuthLayout() {
    return (
        <div>
            <div className="min-h-screen bg-gradient-to-br from-gray-900 
                via-orange-900 to-amber-900 flex items-center justify-center relative overflow-hidden py-10">
                <FloatingShape color="bg-orange-300" size="w-64 h-64" top="-5%" left="10%" delay={0} />
                <FloatingShape color="bg-amber-300" size="w-48 h-48" top="70%" left="80%" delay={5} />
                <FloatingShape color="bg-red-300" size="w-32 h-32" top="40%" left="-10%" delay={2} />
                <Outlet />
            </div>
        </div>
    )
}
