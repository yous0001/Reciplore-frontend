import React, { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useAuthStore } from '../store/authStore'; // Adjust path

const DietPlan = () => {
    const [height, setHeight] = useState(175);
    const [weight, setWeight] = useState(80);
    const [age, setAge] = useState(25);
    const [fatPercentage, setFatPercentage] = useState(15);
    const [goal, setGoal] = useState('muscle gain');
    const [preferences, setPreferences] = useState('high protein');
    const [gender, setGender] = useState('male');
    const [activityLevel, setActivityLevel] = useState('Moderately Active');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const { isAuthenticated } = useAuthStore();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setLoading(true);

        // Validation
        if (fatPercentage < 5 || fatPercentage > 50) {
            setMessage('Fat percentage must be between 5% and 50%.');
            setLoading(false);
            return;
        }
        if (age < 19 || age > 99) {
            setMessage('Age must be between 19 and 99.');
            setLoading(false);
            return;
        }
        if (!['weight loss', 'muscle gain', 'maintenance'].includes(goal.toLowerCase())) {
            setMessage('Goal must be "weight loss", "muscle gain", or "maintenance".');
            setLoading(false);
            return;
        }
        if (!['male', 'female'].includes(gender.toLowerCase())) {
            setMessage('Gender must be "male" or "female".');
            setLoading(false);
            return;
        }

        const accessToken = Cookies.get('accessToken');
        if (!accessToken) {
            setMessage('No access token available.');
            setLoading(false);
            return;
        }

        const data = {
            height:+height,
            age:+age,
            weight:+weight,
            fatPercentage:+fatPercentage,
            goal: goal.toLowerCase(),
            preferences,
            gender: gender.toLowerCase(),
            activityLevel,
        };

        try {
            console.log(data)
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/ai/diet-plan`, data, {
                headers: { accessToken: `accessToken_${accessToken}` },
            });
            console.log('Diet Plan request sent successfully, awaiting email.');
            setMessage('Your diet plan is being generated and will be sent to your email shortly.');
        } catch (err) {
            console.error('Diet Plan API Error:', err.response?.status, err.response?.data);
            console.error('Diet Plan API Response:', err.stack);
            setMessage('Failed to generate diet plan: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-white p-4">
            <div className="w-full max-w-2xl bg-white shadow-xl rounded-xl p-6">
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-700 text-center mb-6">
                    Generate Your Diet Plan
                </h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <style>
                        {`
                            @keyframes inputFocus {
                                from {
                                    transform: scale(1);
                                    border-color: #000000;
                                }
                                to {
                                    transform: scale(1.05);
                                    border-color: linear-gradient(to right, #f97316, #ea580c);
                                }
                            }
                            .input-focus {
                                transition: transform 0.3s ease, border-color 0.3s ease;
                            }
                            .input-focus:focus {
                                animation: inputFocus 0.3s forwards;
                            }
                        `}
                    </style>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-black mb-1">
                                Height (cm)
                                <input
                                    type="number"
                                    value={height}
                                    onChange={(e) => setHeight(e.target.value)}
                                    className="mt-1 block w-full p-2 border border-black rounded-lg input-focus focus:outline-none"
                                    min="100"
                                    max="250"
                                />
                            </label>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-black mb-1">
                                Weight (kg)
                                <input
                                    type="number"
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value)}
                                    className="mt-1 block w-full p-2 border border-black rounded-lg input-focus focus:outline-none"
                                    min="30"
                                    max="200"
                                />
                            </label>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-black mb-1">
                                Age
                                <input
                                    type="number"
                                    value={age}
                                    onChange={(e) => setAge(e.target.value)}
                                    className="mt-1 block w-full p-2 border border-black rounded-lg input-focus focus:outline-none"
                                    min="19"
                                    max="99"
                                />
                            </label>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-black mb-1">
                                Fat Percentage (%)
                                <input
                                    type="number"
                                    value={fatPercentage}
                                    onChange={(e) => setFatPercentage(e.target.value)}
                                    className="mt-1 block w-full p-2 border border-black rounded-lg input-focus focus:outline-none"
                                    min="5"
                                    max="50"
                                />
                            </label>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-black mb-1">
                                Goal
                                <select
                                    value={goal}
                                    onChange={(e) => setGoal(e.target.value)}
                                    className="mt-1 block w-full p-2 border border-black rounded-lg input-focus focus:outline-none"
                                >
                                    <option value="muscle gain">Muscle Gain</option>
                                    <option value="weight loss">Weight Loss</option>
                                    <option value="maintenance">Maintenance</option>
                                </select>
                            </label>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-black mb-1">
                                Preferences
                                <select
                                    value={preferences}
                                    onChange={(e) => setPreferences(e.target.value)}
                                    className="mt-1 block w-full p-2 border border-black rounded-lg input-focus focus:outline-none"
                                >
                                    <option value="high protein">High Protein</option>
                                    <option value="low carb">Low Carb</option>
                                    <option value="vegetarian">Vegetarian</option>
                                    <option value="vegan">Vegan</option>
                                </select>
                            </label>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-black mb-1">
                                Gender
                                <select
                                    value={gender}
                                    onChange={(e) => setGender(e.target.value)}
                                    className="mt-1 block w-full p-2 border border-black rounded-lg input-focus focus:outline-none"
                                >
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>
                            </label>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-black mb-1">
                                Activity Level
                                <select
                                    value={activityLevel}
                                    onChange={(e) => setActivityLevel(e.target.value)}
                                    className="mt-1 block w-full p-2 border border-black rounded-lg input-focus focus:outline-none"
                                >
                                    <option value="Sedentary">Sedentary</option>
                                    <option value="Lightly Active">Lightly Active</option>
                                    <option value="Moderately Active">Moderately Active</option>
                                    <option value="Very Active">Very Active</option>
                                    <option value="Extremely Active">Extremely Active</option>
                                </select>
                            </label>
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 px-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Generating...' : 'Generate Diet Plan'}
                    </button>
                    {message && (
                        <p className={`text-center ${message.includes('Failed') ? 'text-red-500' : 'text-green-500'}`}>
                            {message}
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
};

export default DietPlan;