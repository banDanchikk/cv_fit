import React from 'react'
import Navbar from '../components/Navbar'
import './HomePage.css'
import { LuBrainCircuit } from "react-icons/lu";
import { HiOutlineLightningBolt } from "react-icons/hi";
import { MdOutlineCameraAlt } from "react-icons/md";
import { LuBrain } from "react-icons/lu";
import { FaArrowTrendUp } from "react-icons/fa6";

export default function HomePage() {
  const features = [
    {
      icon: MdOutlineCameraAlt,
      title: 'Real-Time Tracking',
      description: 'Advanced computer vision technology tracks your movements with precision',
    },
    {
      icon: LuBrain,
      title: 'AI-Powered Feedback',
      description: 'Receive instant corrections and guidance from our intelligent trainer',
    },
    {
      icon: HiOutlineLightningBolt,
      title: 'Live Analysis',
      description: 'Get immediate feedback on form, technique, and movement quality',
    },
    {
      icon: FaArrowTrendUp,
      title: 'Progress Tracking',
      description: 'Monitor your improvement with detailed statistics and performance metrics',
    },
  ];

  return (
    <div className='mainContainer'>
      <Navbar />
      <div className="info">
        <div className="img-container">
          <LuBrainCircuit className='img' />
        </div>
        <h2>Your Personal AI Fitness Trainer</h2>
        <h2>Experience the future of fitness training with real-time pose detection, instant technique analysis, and personalized AI-powered coaching. Perfect your form and achieve your fitness goals faster.</h2>
        <button className="getStarted">
          <span className="btn-text">Get Started</span>
          <HiOutlineLightningBolt className="btn-icon" />
        </button>
      </div>
      <div className="info-pt2">
        <block>

        </block>
      </div>

      <div className="features-grid">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div key={index} className="feature-card">
              <div className="feature-icon">
                <Icon className="icon" />
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          );
        })}
      </div>


      <div className="how">
        <div className="how-container">
          <h2>How It Works</h2>

          <div className="how-grid">
            <div className="how-item">
              <div className="step">1</div>
              <p>Choose an exercise or create a custom workout</p>
            </div>

            <div className="how-item">
              <div className="step">2</div>
              <p>Position yourself in front of your camera</p>
            </div>

            <div className="how-item">
              <div className="step">3</div>
              <p>Follow AI guidance and perfect your technique</p>
            </div>
          </div>
        </div>
      </div>

      <footer className="footer">
        <div className="footer-container">
          <div className="footer-brand">
            <h2>CVFit</h2>
            <p>© {new Date().getFullYear()} CVFit. All rights reserved.</p>
          </div>

          <div className="footer-links">
            <div>
              <h4>Product</h4>
              <ul>
                <li><a href="#">Features</a></li>
                <li><a href="#">Workouts</a></li>
                <li><a href="#">Exercises</a></li>
              </ul>
            </div>
            <div>
              <h4>Company</h4>
              <ul>
                <li><a href="#">About</a></li>
                <li><a href="#">Blog</a></li>
                <li><a href="#">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4>Support</h4>
              <ul>
                <li><a href="#">FAQ</a></li>
                <li><a href="#">Help Center</a></li>
                <li><a href="#">Terms</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}
