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
import PageLayout from '../components/layout/PageLayout';
import OptimizedNavbar from '../components/optimized/OptimizedNavbar';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LazyImage from '../components/ui/LazyImage';
import { animationClasses } from '../utils/animations';

/**
 * About page component with SEO optimization and performance enhancements
 */
const About: React.FC = () => {
  return (
    <PageLayout seoPage="about">
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        <OptimizedNavbar />
        
        {/* Header with animation */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-12">
          <div className="container mx-auto px-4">
            <h1 className={`text-4xl md:text-5xl font-extrabold mb-4 ${animationClasses.fadeInUp}`}>
              About ABS STITCH
            </h1>
            <p className={`text-xl text-blue-100 ${animationClasses.fadeInUp}`} style={{ animationDelay: '100ms' }}>
              We're passionate about transforming creative ideas into stunning custom embroidery that makes an impact
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            
            {/* Company Story */}
            <Card
              entranceAnimation="fadeInUp"
              delay={200}
              padding="none"
              shadow="none"
              border={false}
              background="white"
            >
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
            </Card>

            {/* Mission & Values */}
            <Card
              background="gradient"
              entranceAnimation="slideInRight"
              delay={300}
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Our Mission</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                To empower businesses and individuals with exceptional custom embroidery that communicates 
                their unique story and helps them stand out in a crowded marketplace.
              </p>
              
              <div className="space-y-4">
                {[
                  { icon: Heart, text: 'Passion for creativity and excellence', color: 'blue' },
                  { icon: Users, text: 'Client-focused collaborative approach', color: 'blue' },
                  { icon: Award, text: 'Commitment to quality and innovation', color: 'blue' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <item.icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="text-gray-700 font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Why Choose Us section with optimized animations */}
          <div className={`text-center mb-8 ${animationClasses.fadeInUp}`} style={{ animationDelay: '400ms' }}>
            <h3 className="text-2xl font-bold text-gray-800 mb-8">Why Choose ABS STITCH?</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: Clock,
                title: 'Fast Delivery',
                description: 'Most projects completed within 2-3 business days without compromising on quality.',
                gradient: 'from-blue-500 to-cyan-500',
              },
              {
                icon: Award,
                title: 'Professional Quality',
                description: 'High-quality, durable embroidery created by experienced craftspeople.',
                gradient: 'from-purple-500 to-pink-500',
              },
              {
                icon: Users,
                title: 'Personal Service',
                description: 'Direct communication with our design team and unlimited revisions until you\'re satisfied.',
                gradient: 'from-green-500 to-emerald-500',
              },
            ].map((feature, index) => (
              <Card
                key={feature.title}
                entranceAnimation="fadeInUp"
                delay={500 + (index * 100)}
                hoverEffect="lift"
                className="text-center"
              >
                <div className={`bg-gradient-to-r ${feature.gradient} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-gray-800 mb-3">{feature.title}</h4>
                <p className="text-gray-600">{feature.description}</p>
              </Card>
            ))}
          </div>

          {/* Stats section with optimized layout */}
          <Card
            background="gradient"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white mb-16"
            entranceAnimation="fadeInUp"
            delay={800}
          >
            <div className="grid md:grid-cols-4 gap-8 text-center">
              {[
                { value: '500+', label: 'Projects Completed' },
                { value: '300+', label: 'Happy Clients' },
                { value: '4.9', label: 'Average Rating' },
                { value: '24h', label: 'Average Response Time' },
              ].map((stat, index) => (
                <div key={stat.label} style={{ animationDelay: `${900 + (index * 50)}ms` }}>
                  <div className="text-3xl font-bold mb-2">{stat.value}</div>
                  <div className="text-blue-100">{stat.label}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Team section with lazy-loaded images */}
          <div className={`text-center mb-12 ${animationClasses.fadeInUp}`} style={{ animationDelay: '1000ms' }}>
            <h3 className="text-2xl font-bold text-gray-800 mb-8">Meet Our Team</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              {
                name: 'Sarah Johnson',
                role: 'Creative Director',
                description: '10+ years of experience in digital design and brand identity creation.',
                image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=300',
              },
              {
                name: 'Mike Chen',
                role: 'Lead Designer',
                description: 'Specializes in apparel design and digital illustrations with a modern aesthetic.',
                image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=300',
              },
              {
                name: 'Emily Rodriguez',
                role: 'Client Relations Manager',
                description: 'Ensures every client receives personalized attention and exceptional service.',
                image: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=300',
              },
            ].map((member, index) => (
              <Card
                key={member.name}
                entranceAnimation="fadeInUp"
                delay={1100 + (index * 100)}
                hoverEffect="lift"
                className="text-center"
              >
                <LazyImage
                  src={member.image}
                  alt={member.name}
                  className="w-32 h-32 rounded-full object-cover mx-auto mb-4"
                  containerClassName="w-32 h-32 mx-auto mb-4"
                />
                <h4 className="text-xl font-bold text-gray-800 mb-2">{member.name}</h4>
                <p className="text-blue-600 font-medium mb-2">{member.role}</p>
                <p className="text-gray-600 text-sm">{member.description}</p>
              </Card>
            ))}
          </div>

          {/* Call to Action */}
          <Card
            background="gradient"
            entranceAnimation="fadeInUp"
            delay={1400}
            className="text-center"
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Ready to Work With Us?</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Let's bring your creative vision to life. Contact us today to discuss your project 
              and see how we can help you stand out from the competition.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => window.location.href = '/#contact'}
                variant="success"
                size="lg"
                animation="lift"
              >
                Get Started Today
              </Button>
              <Button
                onClick={() => window.location.href = '/catalog'}
                variant="warning"
                size="lg"
                animation="lift"
              >
                Browse Our Work
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default About;