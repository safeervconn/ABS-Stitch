import React from 'react';
import { ArrowRight, Check, X, Headphones, Zap, Shield, Sparkles } from 'lucide-react';
import AnimatedSection from './AnimatedSection';

const Services = () => {
  const packages = [
    {
      name: 'Basic',
      price: '$299',
      description: 'Perfect for small teams',
      features: [
        { name: 'OneDrive Implementation', included: true },
        { name: 'SharePoint Setup', included: true },
        { name: 'Teams Configuration', included: true },
        { name: 'Outlook Integration', included: true },
        { name: 'Basic Training (2 hours)', included: true },
        { name: 'Email Support', included: true },
        { name: 'Advanced Security Settings', included: false },
        { name: 'Custom Workflows', included: false },
        { name: 'Advanced Analytics', included: false },
        { name: 'Priority Support', included: false },
        { name: 'Dedicated Account Manager', included: false },
        { name: 'Enterprise Compliance', included: false },
      ],
      popular: false,
      gradient: 'from-blue-600 to-blue-800'
    },
    {
      name: 'Premium',
      price: '$599',
      description: 'Most popular for growing businesses',
      features: [
        { name: 'OneDrive Implementation', included: true },
        { name: 'SharePoint Setup', included: true },
        { name: 'Teams Configuration', included: true },
        { name: 'Outlook Integration', included: true },
        { name: 'Advanced Training (5 hours)', included: true },
        { name: 'Email + Phone Support', included: true },
        { name: 'Advanced Security Settings', included: true },
        { name: 'Custom Workflows', included: true },
        { name: 'Advanced Analytics', included: true },
        { name: 'Priority Support', included: true },
        { name: 'Dedicated Account Manager', included: false },
        { name: 'Enterprise Compliance', included: false },
      ],
      popular: true,
      gradient: 'from-blue-600 to-blue-800'
    },
    {
      name: 'Enterprise',
      price: '$1,299',
      description: 'Complete solution for large organizations',
      features: [
        { name: 'OneDrive Implementation', included: true },
        { name: 'SharePoint Setup', included: true },
        { name: 'Teams Configuration', included: true },
        { name: 'Outlook Integration', included: true },
        { name: 'Comprehensive Training (10 hours)', included: true },
        { name: '24/7 Support', included: true },
        { name: 'Advanced Security Settings', included: true },
        { name: 'Custom Workflows', included: true },
        { name: 'Advanced Analytics', included: true },
        { name: 'Priority Support', included: true },
        { name: 'Dedicated Account Manager', included: true },
        { name: 'Enterprise Compliance', included: true },
      ],
      popular: false,
      gradient: 'from-blue-600 to-blue-800'
    }
  ];

  const supportPackages = [
    {
      name: 'Basic Support',
      price: '$50-150/month',
      icon: Headphones,
      features: [
        'Email support (48h response)',
        'Basic troubleshooting',
        'Monthly system health check',
        'Documentation access'
      ],
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
      popular: false
    },
    {
      name: 'Premium Support',
      price: '$150-400/month',
      icon: Zap,
      features: [
        'Priority support (24h response)',
        'Phone + email support',
        'Advanced troubleshooting',
        'Bi-weekly optimization',
        'Performance monitoring'
      ],
      gradient: 'from-blue-600 to-blue-700',
      bgGradient: 'from-blue-100 to-blue-200 dark:from-blue-800/20 dark:to-blue-700/20',
      popular: true
    },
    {
      name: 'Enterprise Support',
      price: '$400-1000/month',
      icon: Shield,
      features: [
        '24/7 priority support',
        'Dedicated account manager',
        'Proactive monitoring',
        'Weekly optimization calls',
        'Custom integrations',
        'SLA guarantees'
      ],
      gradient: 'from-blue-700 to-blue-800',
      bgGradient: 'from-blue-200 to-blue-300 dark:from-blue-700/20 dark:to-blue-600/20',
      popular: false
    }
  ];

  const scrollToContact = () => {
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <section id="services" className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-900 dark:via-blue-950/50 dark:to-slate-900">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 dark:from-white dark:via-blue-300 dark:to-white bg-clip-text text-transparent mb-6 leading-[1.1] pb-2">
                Our Service Packages
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                Choose the perfect package for your business. All packages include full implementation, setup, and training to ensure your team stays productive.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {packages.map((pkg, index) => (
              <AnimatedSection key={index} delay={index * 100}>
                <div className={`relative group h-full transform transition-all duration-300 hover:scale-105 ${pkg.popular ? 'scale-105 z-10' : ''}`}>
                  {pkg.popular && (
                    <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-20 transition-all duration-300 group-hover:scale-110">
                      <span className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg sparkle-effect relative overflow-hidden">
                        <span className="relative z-10">Most Popular</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </span>
                    </div>
                  )}
                  
                  <div className={`bg-gradient-to-br from-white via-blue-50/50 to-white dark:from-slate-800 dark:via-blue-900/50 dark:to-slate-800 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden h-full border border-slate-200/50 dark:border-slate-700/50`}>
                    <div className={`bg-gradient-to-r ${pkg.gradient} p-8 text-white text-center relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-blue-500/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative z-10">
                        <h3 className="text-2xl font-bold mb-2">{pkg.name}</h3>
                        <p className="opacity-90 mb-6">{pkg.description}</p>
                        <div className="text-4xl font-bold">
                          {pkg.price}
                          <span className="text-lg font-normal">/month</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-8 flex flex-col h-full">
                      <ul className="space-y-4 mb-8 flex-grow">
                        {pkg.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center">
                            <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mr-4 ${
                              feature.included 
                                ? 'bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30' 
                                : 'bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30'
                            }`}>
                              {feature.included ? (
                                <Check className="w-3 h-3 text-green-600 dark:text-green-400" aria-hidden="true" />
                              ) : (
                                <X className="w-3 h-3 text-red-600 dark:text-red-400" aria-hidden="true" />
                              )}
                            </div>
                            <span className={`text-sm ${
                              feature.included 
                                ? 'text-slate-700 dark:text-slate-300' 
                                : 'text-slate-400 dark:text-slate-500'
                            }`}>
                              {feature.name}
                            </span>
                          </li>
                        ))}
                      </ul>

                      <button
                        onClick={scrollToContact}
                        className={`w-full bg-gradient-to-r ${pkg.gradient} text-white py-4 px-6 rounded-2xl font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center group relative overflow-hidden sparkle-button focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                      >
                        <span className="relative z-10 flex items-center">
                          Consult Now
                          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </button>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-white via-blue-50/30 to-white dark:from-slate-900 dark:via-blue-950/30 dark:to-slate-900 border-t border-gradient-to-r border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h3 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 dark:from-white dark:via-blue-300 dark:to-white bg-clip-text text-transparent mb-6 leading-[1.1] pb-2">
                Ongoing Technical Support
              </h3>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                Professional support services tailored to your package and team size
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {supportPackages.map((support, index) => (
              <AnimatedSection key={index} delay={index * 100}>
                <div className={`relative group h-full transform transition-all duration-300 hover:scale-105 ${support.popular ? 'scale-105 z-10' : ''}`}>
                  {support.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20 transition-all duration-300 group-hover:scale-110">
                      <span className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg sparkle-effect relative overflow-hidden">
                        <span className="relative z-10">Popular Choice</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </span>
                    </div>
                  )}
                  
                  <div className={`relative bg-gradient-to-br from-white via-blue-50/80 to-white dark:from-slate-800 dark:via-blue-900/50 dark:to-slate-800 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 h-full flex flex-col border border-blue-200/50 dark:border-blue-700/50 backdrop-blur-sm ${support.popular ? 'mt-4' : ''}`}>
                    
                    {/* Header with Icon and Title */}
                    <div className="relative mb-8">
                      <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-blue-100/50 to-blue-200/50 dark:from-blue-900/30 dark:to-blue-800/30 rounded-full blur-xl"></div>
                      <div className={`relative w-20 h-20 bg-gradient-to-br ${support.gradient} rounded-3xl flex items-center justify-center mb-6 shadow-2xl group-hover:scale-110 transition-transform duration-300 sparkle-icon`}>
                        <support.icon className="text-white" size={32} />
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl"></div>
                      </div>
                      <h4 className={`text-3xl font-bold bg-gradient-to-r ${support.gradient} bg-clip-text text-transparent mb-3`}>
                        {support.name}
                      </h4>
                      <div className={`text-2xl font-bold bg-gradient-to-r ${support.gradient} bg-clip-text text-transparent`}>
                        {support.price}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">based on team size</div>
                    </div>
                    
                    {/* Features List */}
                    <div className="space-y-4 text-slate-600 dark:text-slate-300 mb-8 flex-grow">
                      {support.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-start space-x-4 group/item">
                          <div className={`flex-shrink-0 w-6 h-6 bg-gradient-to-r ${support.gradient} rounded-lg flex items-center justify-center mt-0.5 group-hover/item:scale-110 transition-transform duration-200`}>
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                          <span className="leading-relaxed">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    {/* CTA Button */}
                    <button
                      onClick={scrollToContact}
                      className={`w-full bg-gradient-to-r ${support.gradient} text-white py-4 px-6 rounded-2xl font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center group/btn relative overflow-hidden sparkle-button focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                    >
                      <span className="relative z-10 flex items-center">
                        Get Started
                        <Sparkles className="ml-2 w-5 h-5 group-hover/btn:rotate-12 transition-transform duration-300" />
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                    </button>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Services;