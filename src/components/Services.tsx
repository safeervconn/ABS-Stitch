import React from 'react';
import { ArrowRight, Check, X, Headphones, Zap, Shield } from 'lucide-react';
import AnimatedSection from './AnimatedSection';

const Services = () => {
  const packages = [
    {
      name: 'Basic',
      price: '$299',
      description: 'Perfect for small teams getting started',
      features: [
        { name: 'OneDrive Implementation & Setup', included: true, details: 'Complete file storage and sync configuration' },
        { name: 'SharePoint Basic Setup', included: true, details: 'Document libraries and basic collaboration' },
        { name: 'Teams Configuration', included: true, details: 'Chat, meetings, and basic channels setup' },
        { name: 'Outlook Integration', included: true, details: 'Email setup and calendar synchronization' },
        { name: 'User Management System (up to 25 users)', included: true, details: 'Basic user provisioning and permissions' },
        { name: 'Basic Training (2 hours)', included: true, details: 'Essential features walkthrough' },
        { name: 'Email Support', included: true, details: '48-hour response time' },
        { name: 'Advanced Security & Compliance', included: false },
        { name: 'Custom Workflows & Automation', included: false },
        { name: 'Advanced Analytics & Reporting', included: false },
        { name: 'Priority Support', included: false },
        { name: 'Dedicated Account Manager', included: false },
      ],
      gradient: 'from-blue-600 to-blue-800',
      cardClass: 'basic-card',
      buttonClass: 'shiny-button'
    },
    {
      name: 'Premium',
      price: '$599',
      description: 'Most popular for growing businesses',
      features: [
        { name: 'OneDrive Advanced Implementation', included: true, details: 'Advanced sync policies and external sharing controls' },
        { name: 'SharePoint Advanced Setup', included: true, details: 'Custom sites, workflows, and content types' },
        { name: 'Teams Advanced Configuration', included: true, details: 'Custom apps, governance policies, and integrations' },
        { name: 'Outlook Advanced Integration', included: true, details: 'Advanced rules, shared mailboxes, and distribution lists' },
        { name: 'User Management System (up to 100 users)', included: true, details: 'Advanced provisioning, groups, and role management' },
        { name: 'Comprehensive Training (5 hours)', included: true, details: 'Advanced features and best practices' },
        { name: 'Email + Phone Support', included: true, details: '24-hour response time' },
        { name: 'Advanced Security & Compliance', included: true, details: 'DLP, retention policies, and audit logs' },
        { name: 'Custom Workflows & Automation', included: true, details: 'Power Automate flows and business processes' },
        { name: 'Advanced Analytics & Reporting', included: true, details: 'Usage reports and productivity insights' },
        { name: 'Priority Support', included: true, details: 'Escalated support queue' },
        { name: 'Dedicated Account Manager', included: false },
      ],
      gradient: 'from-purple-600 to-purple-800',
      cardClass: 'premium-card',
      buttonClass: 'shiny-button-premium'
    },
    {
      name: 'Enterprise',
      price: '$1,299',
      description: 'Complete solution for large organizations',
      features: [
        { name: 'OneDrive Enterprise Implementation', included: true, details: 'Multi-geo, advanced compliance, and enterprise-grade security' },
        { name: 'SharePoint Enterprise Setup', included: true, details: 'Hub sites, enterprise search, and custom solutions' },
        { name: 'Teams Enterprise Configuration', included: true, details: 'Enterprise voice, compliance recording, and custom development' },
        { name: 'Outlook Enterprise Integration', included: true, details: 'Advanced threat protection and enterprise archiving' },
        { name: 'User Management System (unlimited users)', included: true, details: 'Enterprise identity management and SSO integration' },
        { name: 'Executive Training (10 hours)', included: true, details: 'Executive briefings and change management' },
        { name: '24/7 Premium Support', included: true, details: 'Immediate response with dedicated support team' },
        { name: 'Enterprise Security & Compliance', included: true, details: 'Advanced threat protection, eDiscovery, and regulatory compliance' },
        { name: 'Custom Enterprise Workflows', included: true, details: 'Complex business process automation and custom applications' },
        { name: 'Enterprise Analytics & BI', included: true, details: 'Power BI integration and executive dashboards' },
        { name: 'White-Glove Priority Support', included: true, details: 'Dedicated support channel with SLA guarantees' },
        { name: 'Dedicated Account Manager', included: true, details: 'Strategic partnership and quarterly business reviews' },
      ],
      gradient: 'from-emerald-600 to-emerald-800',
      cardClass: 'enterprise-card',
      buttonClass: 'shiny-button-enterprise'
    }
  ];

  const supportPackages = [
    {
      name: 'Basic Support',
      price: '$50-150/month',
      icon: Headphones,
      features: [
        'Email support (48h response)',
        'Basic troubleshooting and issue resolution',
        'Monthly system health check and optimization',
        'Access to knowledge base and documentation',
        'Software updates and patch management'
      ],
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
      buttonClass: 'shiny-button-no-slide'
    },
    {
      name: 'Premium Support',
      price: '$150-400/month',
      icon: Zap,
      features: [
        'Priority support (24h response)',
        'Phone + email support with dedicated queue',
        'Advanced troubleshooting and root cause analysis',
        'Bi-weekly system optimization and tuning',
        'Performance monitoring and proactive alerts',
        'User training sessions and best practice guidance'
      ],
      gradient: 'from-purple-600 to-purple-700',
      bgGradient: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20',
      buttonClass: 'shiny-button-premium-no-slide'
    },
    {
      name: 'Enterprise Support',
      price: '$400-1000/month',
      icon: Shield,
      features: [
        '24/7 priority support with immediate response',
        'Dedicated account manager and technical lead',
        'Proactive monitoring with automated remediation',
        'Weekly optimization calls and strategic planning',
        'Custom integrations and development support',
        'SLA guarantees with performance metrics',
        'Executive reporting and business impact analysis'
      ],
      gradient: 'from-emerald-700 to-emerald-800',
      bgGradient: 'from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20',
      buttonClass: 'shiny-button-enterprise-no-slide'
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
      <section id="services" className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-950 dark:via-blue-950/50 dark:to-slate-950">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl mobile-title font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 dark:from-slate-100 dark:via-blue-300 dark:to-slate-100 bg-clip-text text-transparent mb-6 leading-[1.1] pb-2">
                Professional IT Infrastructure Packages
              </h2>
              <p className="text-lg sm:text-xl mobile-text text-slate-600 dark:text-slate-300 max-w-4xl mx-auto">
                Comprehensive Office 365 implementation and management services. All packages include full setup, user training, and ongoing support to maximize productivity while reducing IT overhead by up to 60%.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {packages.map((pkg, index) => (
              <AnimatedSection key={index} delay={index * 100}>
                <div className="relative group h-full transform transition-all duration-300 hover:scale-105">
                  <div className={`${pkg.cardClass} bg-gradient-to-br from-white via-blue-50/50 to-white dark:from-slate-800 dark:via-blue-900/50 dark:to-slate-800 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden h-full border border-slate-200/50 dark:border-slate-700/50 mobile-card flex flex-col`}>
                    <div className={`${pkg.cardClass ? 'text-white' : `bg-gradient-to-r ${pkg.gradient} text-white`} p-6 sm:p-8 mobile-tile text-center relative overflow-hidden`}>
                      <div className="relative z-10">
                        <h3 className="text-xl sm:text-2xl mobile-title font-bold mb-4">{pkg.name}</h3>
                        <p className="opacity-90 mb-6 mobile-text">{pkg.description}</p>
                        <div className="text-sm opacity-75 mb-2">Starting from</div>
                        <div className="text-3xl sm:text-4xl font-bold">
                          {pkg.price}
                          <span className="text-base sm:text-lg font-normal">/month</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 sm:p-8 mobile-tile flex flex-col flex-grow">
                      <ul className="space-y-3 sm:space-y-4 mb-8 flex-grow">
                        {pkg.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start">
                            <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mr-4 mt-0.5 ${
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
                            <div className="flex-grow">
                              <span className={`text-xs sm:text-sm mobile-text font-medium ${
                                feature.included 
                                  ? 'text-slate-700 dark:text-slate-300' 
                                  : 'text-slate-400 dark:text-slate-500'
                              }`}>
                                {feature.name}
                              </span>
                              {feature.details && feature.included && (
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                  {feature.details}
                                </p>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>

                      <button
                        onClick={scrollToContact}
                        className={`w-full ${pkg.buttonClass} text-white py-3 sm:py-4 px-6 rounded-2xl font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mt-auto`}
                        aria-label={`Get started with ${pkg.name} package`}
                      >
                        <span className="relative z-10 flex items-center text-sm sm:text-base">
                          Consult Now
                          <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-white via-blue-50/30 to-white dark:from-slate-950 dark:via-blue-950/30 dark:to-slate-950 border-t border-gradient-to-r border-slate-200 dark:border-slate-800">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h3 className="text-3xl sm:text-4xl mobile-title font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 dark:from-slate-100 dark:via-blue-300 dark:to-slate-100 bg-clip-text text-transparent mb-6 leading-[1.1] pb-2">
                Ongoing Technical Support Services
              </h3>
              <p className="text-lg sm:text-xl mobile-text text-slate-600 dark:text-slate-300 max-w-4xl mx-auto">
                Professional support services tailored to your package and team size. Maintain peak performance and reduce IT overhead with our dedicated technical support team.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {supportPackages.map((support, index) => (
              <AnimatedSection key={index} delay={index * 100}>
                <div className="relative group h-full transform transition-all duration-300 hover:scale-105">
                  <div className={`relative bg-gradient-to-br ${support.bgGradient} rounded-3xl p-6 sm:p-8 mobile-tile shadow-2xl hover:shadow-3xl transition-all duration-300 h-full flex flex-col border border-blue-200/50 dark:border-blue-700/50 backdrop-blur-sm mobile-card`}>
                    
                    <div className="relative mb-8">
                      <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-blue-100/50 to-blue-200/50 dark:from-blue-900/30 dark:to-blue-800/30 rounded-full blur-xl"></div>
                      <div className={`relative w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br ${support.gradient} rounded-3xl flex items-center justify-center mb-6 shadow-2xl group-hover:scale-110 transition-transform duration-300`}>
                        <support.icon className="text-white" size={28} />
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl"></div>
                      </div>
                      <h4 className={`text-2xl sm:text-3xl mobile-title font-bold bg-gradient-to-r ${support.gradient} bg-clip-text text-transparent mb-3`}>
                        {support.name}
                      </h4>
                      <div className="text-xs sm:text-sm mobile-text text-slate-500 dark:text-slate-400 mb-1">Starting from</div>
                      <div className={`text-xl sm:text-2xl font-bold bg-gradient-to-r ${support.gradient} bg-clip-text text-transparent`}>
                        {support.price}
                      </div>
                      <div className="text-xs sm:text-sm mobile-text text-slate-500 dark:text-slate-400 mt-1">based on team size and complexity</div>
                    </div>
                    
                    <div className="space-y-3 sm:space-y-4 text-slate-600 dark:text-slate-300 mb-8 flex-grow">
                      {support.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-start space-x-4 group/item">
                          <div className={`flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r ${support.gradient} rounded-lg flex items-center justify-center mt-0.5 group-hover/item:scale-110 transition-transform duration-200`}>
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                          <span className="leading-relaxed text-sm sm:text-base mobile-text">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <button
                      onClick={scrollToContact}
                      className={`w-full ${support.buttonClass} text-white py-3 sm:py-4 px-6 rounded-2xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mt-auto`}
                      aria-label={`Subscribe to ${support.name}`}
                    >
                      <span className="relative z-10 flex items-center text-sm sm:text-base">
                        Subscribe
                        <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                      </span>
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