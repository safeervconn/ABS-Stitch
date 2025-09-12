/**
 * About Section Component
 * 
 * Features:
 * - Company story and mission
 * - Team information
 * - Why choose us section
 * - Professional and trustworthy design
 */

import React from 'react';
import { Users, Award, Clock, Heart } from 'lucide-react';

const About: React.FC = () => {
  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white" id="about">
      <div className="container mx-auto px-4">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-4">
            About ArtistryDigital
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We're passionate about transforming creative ideas into stunning digital artwork that makes an impact
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          
          {/* Company Story */}
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Our Story</h3>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                Founded in 2020, ArtistryDigital began as a small creative studio with a simple mission: 
                to make professional digital artwork accessible to businesses and individuals of all sizes.
              </p>
              <p>
                What started as a passion project has grown into a trusted partner for hundreds of clients 
                worldwide. We've helped startups create their first logos, assisted established businesses 
                in rebranding, and brought countless creative visions to life.
              </p>
              <p>
                Our team combines artistic talent with technical expertise to deliver artwork that not only 
                looks amazing but also serves its intended purpose perfectly.
              </p>
            </div>
          </div>

          {/* Mission & Values */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Our Mission</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              To empower businesses and individuals with exceptional digital artwork that communicates 
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
          <h3 className="text-2xl font-bold text-gray-800 mb-8">Why Choose ArtistryDigital?</h3>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
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
              High-resolution, print-ready artwork created by experienced designers.
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
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 mt-16">
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
      </div>
    </section>
  );
};

export default About;