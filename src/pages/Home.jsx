import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RecipeSearchBar from '../components/RecipeSearchBar';
import HomeBanner from '../components/HomeBanner';
import HomeRecipeDisplay from '../components/HomeRecipeDisplay';
import FullBanner from '../components/FullBanner';
import HalfBanner from '../components/HalfBanner';
import  CategorySlider from '../components/CategorySlider';

const Home = () => {
  const [banner, setBanner] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/banner/web_home`);
        console.log('API response:', response);
        const ok = response.data?.success;
        if (ok) {
          setBanner(response.data.banners);
        } else {
          setError(`Failed to load banner data: ${response.data?.message || 'Invalid response'}`);
        }
      } catch (err) {
        console.error('Error fetching banner:', err);
        setError('Error fetching banner: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBanner();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      <HomeBanner/>
      <CategorySlider/>
      <HomeRecipeDisplay/>
      <FullBanner/>
      
      <div className="container mx-auto px-4 py-5 flex flex-col lg:flex-row gap-4">
        <HalfBanner
          bannerName="web_half1"
          header="Learn from the best and create culinary magic at home."
          paragraph="Get inspired by expert tips and techniques to perfect your skills. Explore recipes that help you master new dishes, adding confidence and creativity to your home cooking experience."
          classnames="text-white"
        />
        <HalfBanner
          bannerName="web_half2"
          header="Add flavor, flair, and a touch of creativity to your meals."
          paragraph="Elevate your dishes with bold flavors and creative twists. From vibrant ingredients to expert techniques, discover recipes that transform your everyday cooking into something extraordinary."
        />
      </div>
    </>
  );
};

export default Home;