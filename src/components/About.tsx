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

  return (
    <section id="about" className="py-20 bg-gradient-to-br from-white via-indigo-50/30 to-white dark:from-slate-900 dark:via-indigo-950/30 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <AnimatedSection>
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 via-indigo-800 to-slate-900 dark:from-white dark:via-indigo-300 dark:to-white bg-clip-text text-transparent mb-6 leading-tight">
              Why Choose TechFlow Solutions?
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              We specialize in modern workplace solutions, helping businesses streamline operations and boost productivity through expert implementation and ongoing support.
            </p>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <AnimatedSection key={index} delay={index * 100}>
              <div className="group p-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-indigo-100 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-indigo-800/20 rounded-2xl hover:shadow-xl transition-all duration-200 hover:-translate-y-2 border border-indigo-200/50 dark:border-indigo-700/50 transform hover:scale-105">
                <div className="p-4 bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform duration-150 shadow-lg">
                  <feature.icon className="text-white" size={28} aria-hidden="true" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
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