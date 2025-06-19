import React from 'react';
import { ArrowRight, Zap, Headphones, Users, Shield, Clock } from 'lucide-react';
import AnimatedSection from './AnimatedSection';

const Hero = () => {
  const scrollToServices = () => {
    const element = document.getElementById('services');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToContact = () => {
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const features = [
    { icon: Headphones, title: '24/7 Support', desc: 'Round-the-clock assistance' },
    { icon: Users, title: 'Expert Consultation', desc: 'Certified professionals' },
    { icon: Shield, title: 'Remove IT Overhead', desc: 'Focus on your business' },
    { icon: Clock, title: 'Quick Deployment', desc: 'Minimal downtime' }
  ];

  return (
    <section
      id="home"
      className="min-h-screen flex items-center bg-gradient-to-br from-slate-50 via-indigo-50 via-purple-50 to-indigo-100 dark:from-slate-900 dark:via-indigo-950 dark:via-purple-950 dark:to-slate-900 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-grid-pattern opacity-5" aria-hidden="true"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" aria-hidden="true"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-700 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float-delayed" aria-hidden="true"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <AnimatedSection animation="slide-left">
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-100 via-purple-100 to-indigo-100 dark:from-indigo-900/30 dark:via-purple-900/30 dark:to-indigo-900/30 rounded-full text-indigo-700 dark:text-indigo-300 text-sm font-medium shadow-lg animate-bounce-gentle">
                  <Zap className="w-4 h-4 mr-2" aria-hidden="true" />
                  Professional IT Solutions
                </div>
                <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 dark:text-white leading-tight">
                  Transform Your
                  <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 bg-clip-text text-transparent block">
                    Digital Workspace
                  </span>
                </h1>
                <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                  Expert implementation and support for modern workplace solutions. Reduce IT overhead while maximizing team productivity.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={scrollToServices}
                  className="group bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-xl hover:shadow-indigo-500/25 transform hover:scale-105 transition-all duration-150 flex items-center justify-center shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  View Packages
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-150" size={20} />
                </button>
                <button
                  onClick={scrollToContact}
                  className="border-2 border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 px-8 py-4 rounded-xl font-semibold hover:bg-gradient-to-r hover:from-indigo-50 hover:via-purple-50 hover:to-indigo-50 dark:hover:from-indigo-900/20 dark:hover:via-purple-900/20 dark:hover:to-indigo-900/20 transition-all duration-150 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Free Consultation
                </button>
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection animation="slide-right" delay={200}>
            <div className="relative">
              <div className="relative z-10 bg-gradient-to-br from-white/90 via-indigo-50/90 to-white/90 dark:from-slate-800/90 dark:via-indigo-900/90 dark:to-slate-800/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-slate-700/30 transform hover:scale-105 transition-all duration-200">
                <div className="space-y-6">
                  {features.map((item, index) => (
                    <AnimatedSection key={index} delay={300 + index * 100}>
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 rounded-xl text-white shadow-lg transform hover:scale-110 transition-all duration-150">
                          <item.icon size={24} aria-hidden="true" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-white">{item.title}</h3>
                          <p className="text-slate-600 dark:text-slate-400 text-sm">{item.desc}</p>
                        </div>
                      </div>
                    </AnimatedSection>
                  ))}
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-200 via-purple-200 to-indigo-300 dark:from-indigo-900/30 dark:via-purple-900/30 dark:to-indigo-800/30 rounded-3xl transform rotate-3 scale-105 -z-10 shadow-xl" aria-hidden="true"></div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};

export default Hero;