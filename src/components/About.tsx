import React from 'react';
import { Users, Clock, Headphones, Target } from 'lucide-react';
import AnimatedSection from './AnimatedSection';

const About = () => {
  const features = [
    {
      icon: Users,
      title: 'Expert Team',
      description: 'Certified professionals with extensive workplace solutions experience'
    },
    {
      icon: Clock,
      title: 'Quick Setup',
      description: 'Fast deployment with minimal business disruption'
    },
    {
      icon: Headphones,
      title: 'Dedicated Support',
      description: 'Professional support when you need it most'
    },
    {
      icon: Target,
      title: 'Tailored Solutions',
      description: 'Customized implementations for your specific needs'
    }
  ];

  const scrollToContact = () => {
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="about" className="py-20 bg-gradient-to-br from-white via-blue-50/30 to-white dark:from-slate-950 dark:via-blue-950/30 dark:to-slate-950">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl mobile-title font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 dark:from-slate-100 dark:via-blue-300 dark:to-slate-100 bg-clip-text text-transparent mb-6 leading-[1.1] pb-2">
              Why Choose TechFlow Solutions?
            </h2>
            <p className="text-lg sm:text-xl mobile-text text-slate-600 dark:text-slate-300 max-w-4xl mx-auto mb-8">
              We specialize in modern workplace solutions, helping businesses streamline operations and boost productivity through expert implementation and ongoing support. <strong>Reduce your IT overhead by up to 60%</strong> while increasing team efficiency.
            </p>
            <button
              onClick={scrollToContact}
              className="shiny-button text-white px-8 py-4 rounded-xl font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 relative overflow-hidden"
            >
              <span className="relative z-10">
                Consult Our Experts
              </span>
            </button>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <AnimatedSection key={index} delay={index * 100}>
              <div className="group p-6 sm:p-8 mobile-tile bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl hover:shadow-xl transition-all duration-200 hover:-translate-y-2 border border-blue-200/50 dark:border-blue-700/50 transform hover:scale-105 h-full flex flex-col mobile-card">
                <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform duration-150 shadow-lg">
                  <feature.icon className="text-white" size={28} aria-hidden="true" />
                </div>
                <h3 className="text-lg sm:text-xl mobile-title font-semibold text-slate-900 dark:text-slate-100 mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed flex-grow mobile-text">
                  {feature.description}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;