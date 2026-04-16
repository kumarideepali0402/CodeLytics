
import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, Users, BookOpen, BarChart3, Code, Shield, Zap, CheckCircle, Star, Menu, X, ArrowRight, TrendingUp, Award, Target, Activity, Eye, Trophy, Layers, GraduationCap, Building2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { FaInstagram,FaFacebook, FaWhatsapp, FaXTwitter } from "react-icons/fa6";
import { BarChart2,  } from "lucide-react";






export default function Homepage() {
  const videoRef = useRef(null);
  const navigate= useNavigate();

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


     
      <section id='features-section ' className='relative  px-20 '>
        <h1 className='relative font-extrabold text-5xl z-10  mb-9'>What We Offer ?</h1>
        <div className='absolute inset-0 min-h-screen w-full z-0'>
                <img src="../public/images/homepage-feature-section.png" className='w-full h-full object-cover' alt="" />
        </div>
        <div className='relative grid grid-cols-[7fr_5fr] z-10 ' >
              <div className='grid grid-cols-2 gap-2'>
                <div  className=' rounded-xl bg-red-50  p-8'>
                  <div className='grid grid-cols-[3fr_9fr] '>
                    <div></div>
                    <div className='text-base/5'>
                      <div className='mb-8'>
                          <h4 className='text-purple-500 font-medium'>We Provide</h4>
                          <h3 className='font-bold'>Real-Time Student Progress Tracking</h3>
                          <h3 className='font-light '>Monitor every student's progress across platforms —no manual work or spreadsheets.</h3>

                      </div>
                     
                    </div>
                  </div>
                </div>

                <div  className=' rounded-xl bg-orange-200  p-8'>
                  <div className='grid grid-cols-[3fr_9fr] '>
                    <div></div>
                    <div className='text-base/5'>
                      <div className='mb-8'>
                          <h4 className='text-blue-900 font-medium'>We Provide</h4>
                          <h3 className='font-bold'>Cross-Platform Assignment Integration</h3>
                          <h3 className='font-light '>Seamlessly add questions from LeetCode, GeeksforGeeks, and other popular coding platforms.</h3>

                      </div>
                     
                    </div>
                  </div>
                </div>

                <div  className=' rounded-xl bg-green-100  p-8'>
                  <div className='grid grid-cols-[3fr_9fr] '>
                    <div></div>
                    <div className='text-base/5'>
                      <div className='mb-8'>
                          <h4 className='text-orange-500 font-medium'>We Provide</h4>
                          <h3 className='font-bold'>Performance Analytics & Dashboards</h3>
                          <h3 className='font-light '>Track every student's progress with detailed analytics and performance insights.</h3>

                      </div>
                     
                    </div>
                  </div>
                </div>

                <div  className=' rounded-xl bg-blue-100  p-8'>
                  <div className='grid grid-cols-[3fr_9fr] '>
                    <div></div>
                    <div className='text-base/5'>
                      <div className='mb-8'>
                          <h4 className='text-blue-500 font-medium'>We Provide</h4>
                          <h3 className='font-bold'>Leaderboards & Gamification</h3>
                          <h3 className='font-light '>Motivate students with weekly leaderboards and recognize top performers institution-wide.</h3>

                      </div>
                     
                    </div>
                  </div>
                </div>
                
                

                

              </div>
              
        </div>

      </section>

    
      {/* Testimonials / Social Proof Section */}
      <section className="relative min-h-[60vh] w-full px-10 py-20 bg-gradient-to-r from-purple-50 via-pink-50 to-orange-50">
        <h1 className="text-5xl font-extrabold text-center mb-14">
          Trusted by <span className="text-purple-600">300+</span> Institutions
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Card 1 */}
          <div className="bg-white rounded-2xl shadow-md border border-dotted p-8 flex flex-col gap-4 hover:shadow-lg transition duration-300">
            <div className="text-xl font-bold text-purple-600">ABC University</div>
            <p className="text-gray-600 leading-relaxed">
              “This platform has completely transformed how we track coding progress.
              Faculty can monitor real-time performance, and students love the
              gamification.”
            </p>
            <div className="flex items-center gap-3 mt-auto">
              <img
                src="https://randomuser.me/api/portraits/men/32.jpg"
                className="h-12 w-12 rounded-full border"
                alt="testimonial"
              />
              <div>
                <p className="font-bold">Dr. Rajesh Verma</p>
                <p className="text-sm text-gray-500">Dean of Engineering</p>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl shadow-md border border-dotted p-8 flex flex-col gap-4 hover:shadow-lg transition duration-300">
            <div className="text-xl font-bold text-orange-600">XYZ Institute of Tech</div>
            <p className="text-gray-600 leading-relaxed">
              “Assignments from LeetCode and GFG integrate seamlessly. No more manual
              work for teachers, and the dashboards give us all the insights we need.”
            </p>
            <div className="flex items-center gap-3 mt-auto">
              <img
                src="https://randomuser.me/api/portraits/women/44.jpg"
                className="h-12 w-12 rounded-full border"
                alt="testimonial"
              />
              <div>
                <p className="font-bold">Prof. Neha Sharma</p>
                <p className="text-sm text-gray-500">Head of CSE Dept.</p>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-2xl shadow-md border border-dotted p-8 flex flex-col gap-4 hover:shadow-lg transition duration-300">
            <div className="text-xl font-bold text-green-600">LMN College</div>
            <p className="text-gray-600 leading-relaxed">
              “Our students are more engaged than ever. Leaderboards & analytics keep
              them motivated, while we ensure progress tracking without extra effort.”
            </p>
            <div className="flex items-center gap-3 mt-auto">
              <img
                src="https://randomuser.me/api/portraits/men/52.jpg"
                className="h-12 w-12 rounded-full border"
                alt="testimonial"
              />
              <div>
                <p className="font-bold">Mr. Arjun Patel</p>
                <p className="text-sm text-gray-500">Training & Placement Head</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats footer */}
        <div className="mt-20 flex flex-col md:flex-row justify-around items-center gap-8 text-center">
          <div>
            <h2 className="text-4xl font-extrabold text-purple-600">300+</h2>
            <p className="text-gray-600">Institutions Onboarded</p>
          </div>
          <div>
            <h2 className="text-4xl font-extrabold text-orange-600">25,000+</h2>
            <p className="text-gray-600">Active Students</p>
          </div>
          <div>
            <h2 className="text-4xl font-extrabold text-green-600">1M+</h2>
            <p className="text-gray-600">Problems Solved</p>
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
              className="h-30 w-50"
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