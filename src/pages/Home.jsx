import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RecipeSearchBar from '../components/RecipeSearchBar';
import HomeBanner from '../components/HomeBanner';
import HomeRecipeDisplay from '../components/HomeRecipeDisplay';

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
        if (response.data.sucess) {
          setBanner(response.data.banners);
        } else {
          setError('Failed to load banner data');
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
      <HomeRecipeDisplay/>
    </>
  );
};

export default Home;