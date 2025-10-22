/**
 * About Page Component
 * 
 * Features:
 * - Company story and mission
 * - Team information
 * - Why choose us section
 * - Professional and trustworthy design
 */

import React from 'react';
import { Users, Award, Clock, Heart } from 'lucide-react';
import Navbar from '../components/Navbar';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Navigation */}
      <Navbar />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            About ABS STITCH
          </h1>
          <p className="text-xl text-blue-100">
            We're passionate about transforming creative ideas into stunning custom embroidery that makes an impact
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          
          {/* Company Story */}
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Our Story</h3>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                Founded in 2020, ABS STITCH began as a small embroidery studio with a simple mission: 
                to make professional custom stitching accessible to businesses and individuals of all sizes.
              </p>
              <p>
                What started as a passion project has grown into a trusted partner for hundreds of clients 
                worldwide. We've helped startups create their first embroidered logos, assisted established businesses 
                in custom branding, and brought countless creative visions to life through precision stitching.
              </p>
              <p>
                Our team combines artistic talent with technical expertise to deliver embroidery that not only 
                looks amazing but also stands the test of time with superior quality.
              </p>
            </div>
          </div>

          {/* Mission & Values */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Our Mission</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              To empower businesses and individuals with exceptional custom embroidery that communicates 
              their unique story and helps them stand out in a crowded marketplace.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Heart className="h-5 w-5 text-blue-600" />
                </div>
                <span className="text-gray-700 font-medium">Passion for creativity and excellence</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <span className="text-gray-700 font-medium">Client-focused collaborative approach</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Award className="h-5 w-5 text-blue-600" />
                </div>
                <span className="text-gray-700 font-medium">Commitment to quality and innovation</span>
              </div>
            </div>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-8">Why Choose ABS STITCH?</h3>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-white" />
            </div>
            <h4 className="text-xl font-bold text-gray-800 mb-3">Fast Delivery</h4>
            <p className="text-gray-600">
              Most projects completed within 2-3 business days without compromising on quality.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="h-8 w-8 text-white" />
            </div>
            <h4 className="text-xl font-bold text-gray-800 mb-3">Professional Quality</h4>
            <p className="text-gray-600">
              High-quality, durable embroidery created by experienced craftspeople.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h4 className="text-xl font-bold text-gray-800 mb-3">Personal Service</h4>
            <p className="text-gray-600">
              Direct communication with our design team and unlimited revisions until you're satisfied.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 mb-16">
          <div className="grid md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-3xl font-bold mb-2">500+</div>
              <div className="text-blue-100">Projects Completed</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">300+</div>
              <div className="text-blue-100">Happy Clients</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">4.9</div>
              <div className="text-blue-100">Average Rating</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">24h</div>
              <div className="text-blue-100">Average Response Time</div>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="text-center mb-12">
          <h3 className="text-2xl font-bold text-gray-800 mb-8">Meet Our Team</h3>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <img 
              src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=300" 
              alt="Sarah Johnson"
              className="w-32 h-32 rounded-full object-cover mx-auto mb-4"
            />
            <h4 className="text-xl font-bold text-gray-800 mb-2">Sarah Johnson</h4>
            <p className="text-blue-600 font-medium mb-2">Creative Director</p>
            <p className="text-gray-600 text-sm">
              10+ years of experience in digital design and brand identity creation.
            </p>
          </div>

          <div className="text-center">
            <img 
              src="https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=300" 
              alt="Mike Chen"
              className="w-32 h-32 rounded-full object-cover mx-auto mb-4"
            />
            <h4 className="text-xl font-bold text-gray-800 mb-2">Mike Chen</h4>
            <p className="text-blue-600 font-medium mb-2">Lead Designer</p>
            <p className="text-gray-600 text-sm">
              Specializes in apparel design and digital illustrations with a modern aesthetic.
            </p>
          </div>

          <div className="text-center">
            <img 
              src="https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=300" 
              alt="Emily Rodriguez"
              className="w-32 h-32 rounded-full object-cover mx-auto mb-4"
            />
            <h4 className="text-xl font-bold text-gray-800 mb-2">Emily Rodriguez</h4>
            <p className="text-blue-600 font-medium mb-2">Client Relations Manager</p>
            <p className="text-gray-600 text-sm">
              Ensures every client receives personalized attention and exceptional service.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Ready to Work With Us?</h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Let's bring your creative vision to life. Contact us today to discuss your project 
            and see how we can help you stand out from the competition.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => window.location.href = '/#contact'}
              className="btn-success btn-large px-8"
            >
              Get Started Today
            </button>
            <button 
              onClick={() => window.location.href = '/stock-designs'}
              className="btn-purple btn-large px-8"
            >
              Browse Our Work
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;