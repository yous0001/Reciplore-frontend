import React from 'react';
import HomeBanner from '../components/HomeBanner';
import HomeRecipeDisplay from '../components/HomeRecipeDisplay';
import FullBanner from '../components/FullBanner';
import HalfBanner from '../components/HalfBanner';
import CategorySlider from '../components/CategorySlider';

const Home = () => {
  return (
    <div className="bg-[#FAF9F6] pb-14">
      <HomeBanner />
      <CategorySlider />
      <HomeRecipeDisplay />
      <FullBanner />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <HalfBanner
            bannerName="web_half1"
            header="Learn from the best and create culinary magic at home."
            paragraph="Get inspired by expert tips and techniques to perfect your skills and master new dishes with confidence."
            to="/chat"
            ctaLabel="Ask AI Chef"
          />
          <HalfBanner
            bannerName="web_half2"
            header="Personalized diet plans tailored to your fitness goals."
            paragraph="Set your calories, preferences, and goals to receive a structured meal plan designed around your lifestyle."
            to="/diet-plan"
            ctaLabel="Build Diet Plan"
          />
        </div>
      </section>
    </div>
  );
};

export default Home;
