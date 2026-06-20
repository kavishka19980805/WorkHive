'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import HeroSearch from './HeroSearch';

const SLIDES = [
  {
    image: '/images/slide1.png',
    title: 'Job Happiness Starts Here',
    subtitle: "Sri Lanka's Trusted Job Search Portal",
  },
  {
    image: '/images/slide2.png',
    title: 'Connect with Top Global Employers',
    subtitle: 'Over 10,000+ active job openings across engineering, design, & product',
  },
  {
    image: '/images/slide3.png',
    title: 'Build Your Dream Career',
    subtitle: 'Get matched with top-tier companies and land interview calls instantly',
  },
];

export default function HeroSlider() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-play timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  };

  const handleTagClick = (type: 'search' | 'location', value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(type, value);
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="hero-slider-container">
      {SLIDES.map((slide, idx) => (
        <div
          key={idx}
          className={`hero-slide ${idx === currentSlide ? 'active' : ''}`}
          style={{ backgroundImage: `url(${slide.image})` }}
        />
      ))}
      
      {/* Dark Teal Overlay */}
      <div className="hero-slider-overlay" />

      {/* Slide Content */}
      <div className="hero-slider-content container">
        <h1 className="hero-title">{SLIDES[currentSlide].title}</h1>
        <p className="hero-subtitle">{SLIDES[currentSlide].subtitle}</p>

        {/* Embedded Search Form */}
        <div className="hero-search-overlay-wrapper">
          <HeroSearch />
        </div>

        {/* Quick Filter Tag Pills */}
        <div className="hero-slider-tags">
          <button 
            onClick={() => handleTagClick('search', 'Internship')} 
            className="hero-tag-pill"
          >
            Internship
          </button>
          <button 
            onClick={() => handleTagClick('location', 'Remote')} 
            className="hero-tag-pill"
          >
            Remote Jobs
          </button>
          <button 
            onClick={() => handleTagClick('search', 'Full-Time')} 
            className="hero-tag-pill"
          >
            Full-Time
          </button>
          <button 
            onClick={() => handleTagClick('search', 'Part-Time')} 
            className="hero-tag-pill"
          >
            Part-Time
          </button>
        </div>
      </div>

      {/* Left/Right Arrows */}
      <button onClick={handlePrev} className="slider-arrow arrow-left" aria-label="Previous slide">
        <ChevronLeft size={24} />
      </button>
      <button onClick={handleNext} className="slider-arrow arrow-right" aria-label="Next slide">
        <ChevronRight size={24} />
      </button>

      {/* Indicator Dots */}
      <div className="slider-dots">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`slider-dot ${idx === currentSlide ? 'active' : ''}`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
