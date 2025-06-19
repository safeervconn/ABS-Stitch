import React from 'react';
import { ArrowRight, Check, X } from 'lucide-react';
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
      gradient: 'from-indigo-600 via-purple-600 to-indigo-700'
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
      gradient: 'from-indigo-600 via-purple-600 to-indigo-700'
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
      gradient: 'from-indigo-600 via-purple-600 to-indigo-700'
    }
  ];

  const supportPackages = [
    {
      name: 'Basic Support',
      price: '$50-150/month',
      features: [
        'Email support (48h response)',
        'Basic troubleshooting',
        'Monthly system health check'
      ],
      gradient: 'from-indigo-500 to-purple-500',
      bgGradient: 'from-indigo-50 via-purple-50 to-indigo-100 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-indigo-800/20'
    },
    {
      name: 'Premium Support',
      price: '$150-400/month',
      features: [
        'Priority support (24h response)',
        'Phone + email support',
        'Advanced troubleshooting',
        'Bi-weekly optimization'
      ],
      gradient: 'from-purple-500 to-indigo-500',
      bgGradient: 'from-purple-50 via-indigo-50 to-purple-100 dark:from-purple-900/20 dark:via-indigo-900/20 dark:to-purple-800/20',
      popular: true
    },
    {
      name: 'Enterprise Support',
      price: '$400-1000/month',
      features: [
        '24/7 priority support',
        'Dedicated account manager',
        'Proactive monitoring',
        'Weekly optimization calls'
      ],
      gradient: 'from-purple-600 to-indigo-600',
      bgGradient: 'from-purple-100 via-indigo-100 to-purple-200 dark:from-purple-800/20 dark:via-indigo-800/20 dark:to-purple-700/20'
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
      <section id="services" className="py-20 bg-gradient-to-br from-slate-50 via-indigo-50 via-purple-50 to-indigo-50 dark:from-slate-900 dark:via-indigo-950 dark:via-purple-950 dark:to-indigo-950">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 via-indigo-800 via-purple-800 to-slate-900 dark:from-white dark:via-indigo-300 dark:via-purple-300 dark:to-white bg-clip-text text-transparent mb-6 leading-tight">
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
                <div className={`relative group ${pkg.popular ? 'transform scale-105 z-10' : ''}`}>
                  {pkg.popular && (
                    <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-20">
                      <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <div className="bg-gradient-to-br from-white via-indigo-50/50 to-white dark:from-slate-800 dark:via-indigo-900/50 dark:to-slate-800 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-200 overflow-hidden h-full border border-slate-200/50 dark:border-slate-700/50 transform hover:scale-105">
                    <div className={`bg-gradient-to-r ${pkg.gradient} p-8 text-white text-center`}>
                      <h3 className="text-2xl font-bold mb-2">{pkg.name}</h3>
                      <p className="opacity-90 mb-6">{pkg.description}</p>
                      <div className="text-4xl font-bold">
                        {pkg.price}
                        <span className="text-lg font-normal">/month</span>
                      </div>
                    </div>

                    <div className="p-8">
                      <ul className="space-y-4 mb-8">
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
                        className={`w-full bg-gradient-to-r ${pkg.gradient} text-white py-4 px-6 rounded-2xl font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-150 flex items-center justify-center group focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                      >
                        Consult Now
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-150" />
                      </button>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-white via-purple-50/30 to-white dark:from-slate-900 dark:via-purple-950/30 dark:to-slate-900 border-t border-gradient-to-r border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h3 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-purple-800 to-slate-900 dark:from-white dark:via-purple-300 dark:to-white bg-clip-text text-transparent mb-6 leading-tight">
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
                <div className={`relative group ${support.popular ? 'transform scale-105' : ''}`}>
                  {support.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                      <span className="bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                        Popular Choice
                      </span>
                    </div>
                  )}
                  
                  <div className={`relative bg-gradient-to-br ${support.bgGradient} rounded-3xl p-8 border border-indigo-200/30 dark:border-indigo-700/30 hover:shadow-xl transition-all duration-200 transform hover:scale-105 ${support.popular ? 'mt-4' : ''}`}>
                    <div className="mb-6">
                      <div className={`w-16 h-16 bg-gradient-to-br ${support.gradient} rounded-2xl flex items-center justify-center mb-4 shadow-lg`}>
                        <span className="text-white text-2xl font-bold">{support.name.charAt(0)}</span>
                      </div>
                      <h4 className={`text-2xl font-bold bg-gradient-to-r ${support.gradient} bg-clip-text text-transparent mb-2`}>
                        {support.name}
                      </h4>
                    </div>
                    
                    <div className="space-y-4 text-slate-600 dark:text-slate-300 mb-8">
                      {support.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center space-x-3">
                          <div className={`w-2 h-2 bg-gradient-to-r ${support.gradient} rounded-full`}></div>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="pt-6 border-t border-indigo-200/50 dark:border-indigo-700/50">
                      <div className={`text-lg font-bold bg-gradient-to-r ${support.gradient} bg-clip-text text-transparent`}>
                        {support.price}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">based on team size</div>
                    </div>
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