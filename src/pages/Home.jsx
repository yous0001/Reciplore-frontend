import React from 'react';
import HomeBanner from '../components/HomeBanner';
import HomeRecipeDisplay from '../components/HomeRecipeDisplay';
import FullBanner from '../components/FullBanner';
import HalfBanner from '../components/HalfBanner';
import CategorySlider from '../components/CategorySlider';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col space-y-6">
      <HomeBanner />
      <CategorySlider />
      <HomeRecipeDisplay />
      <FullBanner />
      
      <div className="container mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
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
    </div>
  );
};

export default Home;
