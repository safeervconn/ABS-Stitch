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
    { icon: Shield, title: 'Reduce IT Overhead', desc: 'Focus on your business' },
    { icon: Clock, title: 'Quick Deployment', desc: 'Minimal downtime' }
  ];

  return (
    <section
      id="home"
      className="min-h-screen flex items-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-blue-950/50 dark:to-slate-950 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-grid-pattern opacity-5" aria-hidden="true"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" aria-hidden="true"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float-delayed" aria-hidden="true"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <AnimatedSection animation="slide-left">
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-full text-blue-700 dark:text-blue-300 text-sm font-medium shadow-lg animate-bounce-gentle">
                  <Zap className="w-4 h-4 mr-2" aria-hidden="true" />
                  Professional IT Infrastructure Solutions
                </div>
                <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
                  Transform Your
                  <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent block">
                    Digital Workspace
                  </span>
                </h1>
                <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                  Expert implementation and support for modern workplace solutions. <strong>Reduce IT overhead by 60%</strong> while maximizing team productivity with our comprehensive infrastructure services.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={scrollToServices}
                  className="group shiny-button text-white px-8 py-4 rounded-xl font-semibold hover:shadow-xl hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-150 flex items-center justify-center shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center">
                    View Packages
                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-150" size={20} />
                  </span>
                </button>
                <button
                  onClick={scrollToContact}
                  className="border-2 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 px-8 py-4 rounded-xl font-semibold hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-900/20 dark:hover:to-blue-800/20 transition-all duration-150 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Free Consultation
                </button>
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection animation="slide-right" delay={200}>
            <div className="relative">
              <div className="relative z-10 bg-gradient-to-br from-white/90 via-blue-50/90 to-white/90 dark:from-slate-800/90 dark:via-blue-900/90 dark:to-slate-800/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-slate-700/30 transform hover:scale-105 transition-all duration-200">
                <div className="space-y-6">
                  {features.map((item, index) => (
                    <AnimatedSection key={index} delay={300 + index * 100}>
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-700 rounded-xl text-white shadow-lg transform hover:scale-110 transition-all duration-150">
                          <item.icon size={24} aria-hidden="true" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-slate-100">{item.title}</h3>
                          <p className="text-slate-600 dark:text-slate-400 text-sm">{item.desc}</p>
                        </div>
                      </div>
                    </AnimatedSection>
                  ))}
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-200 to-blue-300 dark:from-blue-900/30 dark:to-blue-800/30 rounded-3xl transform rotate-3 scale-105 -z-10 shadow-xl" aria-hidden="true"></div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};

export default Hero;