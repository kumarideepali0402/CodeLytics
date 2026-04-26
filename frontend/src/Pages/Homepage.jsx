
import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, BarChart3, Activity, Trophy, Layers, Building2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { FaInstagram,FaFacebook, FaWhatsapp, FaXTwitter } from "react-icons/fa6";
import { SiLeetcode, SiGeeksforgeeks } from "react-icons/si";
import { BarChart2,  } from "lucide-react";






export default function Homepage() {
  const videoRef = useRef(null);
  const navigate= useNavigate();
  const platformSectionRef = useRef(null);
  const [platformVisible, setPlatformVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setPlatformVisible(true); observer.disconnect(); } },
      { threshold: 0.2 }
    );
    if (platformSectionRef.current) observer.observe(platformSectionRef.current);
    return () => observer.disconnect();
  }, []);

  return(
    <div className='min-h-screen w-full flex flex-col gap-24'>
      {/* hero-section */}
      <section id="hero-section" className='relative w-full h-screen '>
      <div className='absolute inset-0 flex items-center align-center justify-center mt-45'>
          <button onClick={()=>navigate("/entry")} className="text-black font-bold px-12 py-4  bg-white border-2 border-black border-dotted z-10">Get Started</button>
       </div> 
        <video ref={videoRef} className='w-full h-full object-fill' autoPlay muted playsInline>
          <source src="https://res.cloudinary.com/deanuec4t/video/upload/v1756584128/Codelytics_rczect.mp4" type='video/mp4' />

          {/* <source src="https://res.cloudinary.com/deanuec4t/video/upload/v1755877146/HeroVideo_mh82yd.mp4" type='video/mp4' /> */}
        </video>
      </section>


     
      <section id='features-section ' className='relative px-4 sm:px-8 lg:px-20'>
        <h1 className='relative font-extrabold text-3xl sm:text-5xl z-10 mb-9'>What We Offer ?</h1>
        <div className='relative grid grid-cols-1 lg:grid-cols-[7fr_5fr] z-10 items-center' >
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                <div  className=' rounded-xl bg-red-50  p-5'>
                  <div className='grid grid-cols-[3fr_9fr] '>
                    <div className='flex items-start justify-center pt-1'>
                      <Activity className='w-8 h-8 text-purple-500' />
                    </div>
                    <div className='text-base/5'>
                      <div className='mb-3'>
                          <h4 className='text-purple-500 font-medium'>We Provide</h4>
                          <h3 className='font-bold'>Real-Time Student Progress Tracking</h3>
                          <h3 className='font-light '>Monitor every student's progress across platforms —no manual work or spreadsheets.</h3>
                      </div>
                    </div>
                  </div>
                </div>

                <div  className=' rounded-xl bg-orange-200  p-5'>
                  <div className='grid grid-cols-[3fr_9fr] '>
                    <div className='flex items-start justify-center pt-1'>
                      <Layers className='w-8 h-8 text-blue-900' />
                    </div>
                    <div className='text-base/5'>
                      <div className='mb-3'>
                          <h4 className='text-blue-900 font-medium'>We Provide</h4>
                          <h3 className='font-bold'>Cross-Platform Assignment Integration</h3>
                          <h3 className='font-light '>Seamlessly add questions from LeetCode, GeeksforGeeks, and other popular coding platforms.</h3>
                      </div>
                    </div>
                  </div>
                </div>

                <div  className=' rounded-xl bg-green-100  p-5'>
                  <div className='grid grid-cols-[3fr_9fr] '>
                    <div className='flex items-start justify-center pt-1'>
                      <BarChart3 className='w-8 h-8 text-orange-500' />
                    </div>
                    <div className='text-base/5'>
                      <div className='mb-3'>
                          <h4 className='text-orange-500 font-medium'>We Provide</h4>
                          <h3 className='font-bold'>Performance Analytics & Dashboards</h3>
                          <h3 className='font-light '>Track every student's progress with detailed analytics and performance insights.</h3>
                      </div>
                    </div>
                  </div>
                </div>

                <div  className=' rounded-xl bg-blue-100  p-5'>
                  <div className='grid grid-cols-[3fr_9fr] '>
                    <div className='flex items-start justify-center pt-1'>
                      <Trophy className='w-8 h-8 text-blue-500' />
                    </div>
                    <div className='text-base/5'>
                      <div className='mb-3'>
                          <h4 className='text-blue-500 font-medium'>We Provide</h4>
                          <h3 className='font-bold'>Leaderboards & Gamification</h3>
                          <h3 className='font-light '>Motivate students with weekly leaderboards and recognize top performers institution-wide.</h3>
                      </div>
                    </div>
                  </div>
                </div>
                
                

                

              </div>

          <div className='hidden lg:flex items-center justify-center p-4'>
            <img src="../public/images/whatWeOffer.png" alt="What We Offer" className='h-auto w-[90%] object-contain' />
          </div>
        </div>

      </section>

    
      {/* Platforms Section */}
      <style>{`
        @keyframes slideFromLeft {
          from { transform: translateX(-80px); opacity: 0; }
          to   { transform: translateX(0);     opacity: 1; }
        }
        @keyframes slideFromRight {
          from { transform: translateX(80px);  opacity: 0; }
          to   { transform: translateX(0);     opacity: 1; }
        }
        .platform-left-1  { opacity: 0; }
        .platform-right   { opacity: 0; }
        .platform-left-2  { opacity: 0; }
        .platforms-visible .platform-left-1  { animation: slideFromLeft  1.2s ease 0.2s both; }
        .platforms-visible .platform-right   { animation: slideFromRight 1.2s ease 0.7s both; }
        .platforms-visible .platform-left-2  { animation: slideFromLeft  1.2s ease 1.2s both; }
      `}</style>

      <section ref={platformSectionRef} className="w-full px-4 sm:px-8 lg:px-20 py-10 sm:py-16">
        <div className="max-w-6xl mx-auto">
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-10 items-center${platformVisible ? ' platforms-visible' : ''}`}>

            {/* Left: Heading */}
            <div>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight">
                Platforms we<br />integrate with
              </h2>
            </div>

            {/* Right: Stacked cards */}
            <div className="flex flex-col gap-4 w-fit">
              <div className="platform-left-1 flex items-center gap-4 bg-white rounded-2xl border border-gray-100 px-6 py-4 shadow-sm">
                <SiLeetcode className="text-4xl text-[#FFA116] shrink-0" />
                <div>
                  <p className="font-bold text-gray-800">LeetCode</p>
                  <p className="text-xs text-gray-400">DSA problem tracking</p>
                </div>
              </div>
              <div className="platform-right flex items-center gap-4 bg-white rounded-2xl border border-gray-100 px-6 py-4 shadow-sm">
                <SiGeeksforgeeks className="text-4xl text-[#2F8D46] shrink-0" />
                <div>
                  <p className="font-bold text-gray-800">GeeksforGeeks</p>
                  <p className="text-xs text-gray-400">CS fundamentals & practice</p>
                </div>
              </div>
              <div className="platform-left-2 flex items-center gap-4 bg-white rounded-2xl border border-gray-100 px-6 py-4 shadow-sm">
                <img src="https://codeforces.com/favicon-32x32.png" alt="Codeforces" className="w-9 h-9 shrink-0" />
                <div>
                  <p className="font-bold text-gray-800">Codeforces</p>
                  <p className="text-xs text-gray-400">Competitive programming</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 w-full py-8 px-6 text-gray-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[3fr_6fr_3fr] items-center gap-6">
          
          {/* Logo */}
          <div className="flex justify-center md:justify-start">
            <img 
              src="./logo.png" 
              alt="Codelytics Logo" 
              className="h-12 w-auto"
            />
          </div>

          {/* Links */}
          <div className="flex justify-center md:justify-around items-center text-sm gap-6">
            <a href="#" className="hover:text-black transition">Terms & Conditions</a>
            <a href="#" className="hover:text-black transition">Privacy Policy</a>
            <a href="#" className="hover:text-black transition">Contact Us</a>
          </div>

          {/* Social Icons */}
          <div className="flex justify-center md:justify-end items-center gap-5 text-2xl text-gray-500">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
              className="hover:text-pink-500 transition">
              <FaInstagram />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
              className="hover:text-blue-600 transition">
              <FaFacebook />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
              className="hover:text-gray-700 transition">
              <FaXTwitter />
            </a>
            <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer"
              className="hover:text-green-600 transition">
              <FaWhatsapp />
            </a>
          </div>
        </div>

        {/* Divider Line */}
        <div className="mt-6 h-px w-full bg-gray-300"></div>

        {/* Copyright */}
        <div className="mt-4 text-center text-gray-500 text-xs">
          © {new Date().getFullYear()} Codelytics. All Rights Reserved.
        </div>
    </footer>
    </div>
  )






}