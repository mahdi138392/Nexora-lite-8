import React from 'react';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Stats from '../components/Stats';
import Footer from '../components/Footer';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-transparent">
      <Hero />
      <Features />
      <Stats />
      <Footer />
    </div>
  );
};

export default Home;
