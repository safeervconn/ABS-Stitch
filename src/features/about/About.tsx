/**
 * About Page Component
 * 
 * Company information page featuring:
 * - Company story and mission statement
 * - Team member profiles
 * - Core values and differentiators
 * - Performance statistics
 * - SEO optimization with structured data
 * - Call-to-action sections
 */

import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Users, Award, Clock, Heart } from 'lucide-react';
import Navbar from '../../layout/Navbar';

const About: React.FC = React.memo(() => {
  /**
   * Company statistics for credibility
   */
  const stats = useMemo(() => [
    { value: '500+', label: 'Projects Completed' },
    { value: '300+', label: 'Happy Clients' },
    { value: '4.9', label: 'Average Rating' },
    { value: '24h', label: 'Average Response Time' }
  ], []);

  /**
   * Core values and mission points
   */
  const values = useMemo(() => [
    {
      icon: Heart,
      text: 'Passion for creativity and excellence',
      color: 'blue'
    },
    {
      icon: Users,
      text: 'Client-focused collaborative approach',
      color: 'blue'
    },
    {
      icon: Award,
      text: 'Commitment to quality and innovation',
      color: 'blue'
    }
  ], []);

  /**
   * Why choose us features
   */
  const features = useMemo(() => [
    {
      icon: Clock,
      title: 'Fast Delivery',
      description: 'Most projects completed within 2-3 business days without compromising on quality.',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Award,
      title: 'Professional Quality',
      description: 'High-quality, durable embroidery created by experienced craftspeople.',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: Users,
      title: 'Personal Service',
      description: 'Direct communication with our design team and unlimited revisions until you\'re satisfied.',
      gradient: 'from-green-500 to-emerald-500'
    }
  ], []);

  /**
   * Team member profiles
   */
  const teamMembers = useMemo(() => [
    {
      name: 'Sarah Johnson',
      role: 'Creative Director',
      image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=300',
      description: '10+ years of experience in digital design and brand identity creation.'
    },
    {
      name: 'Mike Chen',
      role: 'Lead Designer',
      image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=300',
      description: 'Specializes in apparel design and digital illustrations with a modern aesthetic.'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Client Relations Manager',
      image: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=300',
      description: 'Ensures every client receives personalized attention and exceptional service.'
    }
  ], []);

  /**
   * Handle navigation to contact section
   */
  const handleGetStarted = () => {
    window.location.href = '/#contact';
  };

  /**
   * Handle navigation to catalog
   */
  const handleBrowseWork = () => {
    window.location.href = '/catalog';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* SEO Optimization */}
      <Helmet>
        <title>About ABS STITCH | Professional Custom Embroidery Team</title>
        <meta name="description" content="Learn about ABS STITCH's mission, team, and commitment to delivering exceptional custom embroidery services. Founded in 2020, serving 300+ happy clients worldwide." />
        <meta name="keywords" content="about ABS STITCH, embroidery company, custom stitching team, professional embroidery services" />
        <link rel="canonical" href="https://absstitch.com/about" />
      </Helmet>

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
              {values.map((value, index) => {
                const IconComponent = value.icon;
                return (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <IconComponent className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="text-gray-700 font-medium">{value.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-8">Why Choose ABS STITCH?</h3>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={index} className="text-center">
                <div className={`bg-gradient-to-r ${feature.gradient} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <IconComponent className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-gray-800 mb-3">{feature.title}</h4>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Stats */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 mb-16">
          <div className="grid md:grid-cols-4 gap-8 text-center text-white">
            {stats.map((stat, index) => (
              <div key={index}>
                <div className="text-3xl font-bold mb-2">{stat.value}</div>
                <div className="text-blue-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="text-center mb-12">
          <h3 className="text-2xl font-bold text-gray-800 mb-8">Meet Our Team</h3>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {teamMembers.map((member, index) => (
            <div key={index} className="text-center">
              <img 
                src={member.image}
                alt={member.name}
                className="w-32 h-32 rounded-full object-cover mx-auto mb-4"
                loading="lazy"
              />
              <h4 className="text-xl font-bold text-gray-800 mb-2">{member.name}</h4>
              <p className="text-blue-600 font-medium mb-2">{member.role}</p>
              <p className="text-gray-600 text-sm">
                {member.description}
              </p>
            </div>
          ))}
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
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg font-semibold"
            >
              Get Started Today
            </button>
            <button 
              onClick={handleBrowseWork}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg font-semibold"
            >
              Browse Our Work
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default About;