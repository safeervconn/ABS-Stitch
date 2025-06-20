import React from 'react';
import { ArrowRight, Check, X, Headphones, Zap, Shield } from 'lucide-react';
import AnimatedSection from './AnimatedSection';

const Services = () => {
  const packages = [
    {
      name: 'Basic',
      price: '$299',
      description: 'Essential IT infrastructure setup for small teams',
      features: [
        { name: 'Microsoft 365 Basic Implementation', included: true, details: 'Complete setup and configuration of core M365 services' },
        { name: 'OneDrive Setup & Configuration', included: true, details: 'File storage, sync, and sharing policies implementation' },
        { name: 'SharePoint Basic Deployment', included: true, details: 'Document libraries and team collaboration sites' },
        { name: 'Teams Platform Configuration', included: true, details: 'Chat, meetings, and channel setup with governance' },
        { name: 'Outlook & Exchange Setup', included: true, details: 'Email configuration, calendars, and basic security' },
        { name: 'User Management (up to 25 users)', included: true, details: 'Account provisioning, licensing, and basic permissions' },
        { name: 'IT Infrastructure Assessment', included: true, details: 'Network evaluation and optimization recommendations' },
        { name: 'Basic Training & Documentation', included: true, details: '2 hours of user training and setup guides' },
        { name: 'Email Support', included: true, details: '48-hour response time for technical issues' },
        { name: 'Advanced Security & Compliance', included: false },
        { name: 'Custom Automation & Workflows', included: false },
        { name: 'Advanced Analytics & Reporting', included: false },
        { name: 'Priority Support & Monitoring', included: false },
        { name: 'Dedicated IT Account Manager', included: false },
      ],
      gradient: 'from-blue-600 to-blue-800',
      cardClass: 'basic-card',
      buttonClass: 'shiny-button'
    },
    {
      name: 'Premium',
      price: '$599',
      description: 'Complete IT outsourcing for growing businesses',
      features: [
        { name: 'Microsoft 365 Advanced Implementation', included: true, details: 'Full M365 suite with advanced features and integrations' },
        { name: 'OneDrive Advanced Management', included: true, details: 'Advanced sync policies, external sharing controls, and governance' },
        { name: 'SharePoint Advanced Deployment', included: true, details: 'Custom sites, workflows, content types, and automation' },
        { name: 'Teams Enterprise Configuration', included: true, details: 'Custom apps, governance policies, and third-party integrations' },
        { name: 'Outlook Advanced Integration', included: true, details: 'Advanced rules, shared mailboxes, distribution lists, and archiving' },
        { name: 'User Management (up to 100 users)', included: true, details: 'Advanced provisioning, groups, roles, and access management' },
        { name: 'IT Infrastructure Management', included: true, details: 'Network monitoring, security implementation, and optimization' },
        { name: 'Comprehensive Training Program', included: true, details: '5 hours of advanced training and best practices guidance' },
        { name: 'Priority Support (24h response)', included: true, details: 'Phone and email support with dedicated queue' },
        { name: 'Advanced Security & Compliance', included: true, details: 'DLP, retention policies, audit logs, and threat protection' },
        { name: 'Custom Automation & Workflows', included: true, details: 'Power Automate flows and business process automation' },
        { name: 'Advanced Analytics & Reporting', included: true, details: 'Usage reports, productivity insights, and performance metrics' },
        { name: 'Priority Support & Monitoring', included: true, details: 'Proactive monitoring with escalated support queue' },
        { name: 'Dedicated IT Account Manager', included: false },
      ],
      gradient: 'from-purple-600 to-purple-800',
      cardClass: 'premium-card',
      buttonClass: 'shiny-button-premium'
    },
    {
      name: 'Enterprise',
      price: '$1,299',
      description: 'Full IT outsourcing solution for large organizations',
      features: [
        { name: 'Microsoft 365 Enterprise Implementation', included: true, details: 'Complete M365 enterprise suite with multi-geo and advanced compliance' },
        { name: 'OneDrive Enterprise Management', included: true, details: 'Multi-geo deployment, advanced compliance, and enterprise-grade security' },
        { name: 'SharePoint Enterprise Deployment', included: true, details: 'Hub sites, enterprise search, custom solutions, and integrations' },
        { name: 'Teams Enterprise Platform', included: true, details: 'Enterprise voice, compliance recording, custom development, and integrations' },
        { name: 'Outlook Enterprise Integration', included: true, details: 'Advanced threat protection, enterprise archiving, and compliance features' },
        { name: 'Unlimited User Management', included: true, details: 'Enterprise identity management, SSO integration, and advanced governance' },
        { name: 'Complete IT Infrastructure Outsourcing', included: true, details: 'Full network management, security, monitoring, and optimization' },
        { name: 'Executive Training & Change Management', included: true, details: '10 hours of executive briefings and organizational change support' },
        { name: '24/7 Premium Support', included: true, details: 'Immediate response with dedicated support team and SLA guarantees' },
        { name: 'Enterprise Security & Compliance', included: true, details: 'Advanced threat protection, eDiscovery, regulatory compliance, and auditing' },
        { name: 'Custom Enterprise Automation', included: true, details: 'Complex business process automation and custom application development' },
        { name: 'Enterprise Analytics & BI', included: true, details: 'Power BI integration, executive dashboards, and business intelligence' },
        { name: 'White-Glove Priority Support', included: true, details: 'Dedicated support channel with guaranteed response times and SLAs' },
        { name: 'Dedicated IT Account Manager', included: true, details: 'Strategic IT partnership with quarterly business reviews and planning' },
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
        'Email support for IT infrastructure and M365 issues (48h response)',
        'Basic troubleshooting and technical issue resolution',
        'Monthly system health checks and performance optimization',
        'Access to IT knowledge base and documentation library',
        'Software updates and security patch management',
        'Basic user account management and licensing support'
      ],
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
      buttonClass: 'shiny-button'
    },
    {
      name: 'Premium Support',
      price: '$150-400/month',
      icon: Zap,
      features: [
        'Priority IT support for infrastructure and M365 (24h response)',
        'Phone and email support with dedicated technical queue',
        'Advanced troubleshooting and root cause analysis',
        'Bi-weekly system optimization and performance tuning',
        'Proactive monitoring with automated alerts and remediation',
        'User training sessions and IT best practice guidance',
        'Security incident response and threat management'
      ],
      gradient: 'from-purple-600 to-purple-700',
      bgGradient: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20',
      buttonClass: 'shiny-button-premium'
    },
    {
      name: 'Enterprise Support',
      price: '$400-1000/month',
      icon: Shield,
      features: [
        '24/7 priority IT support with immediate response and escalation',
        'Dedicated account manager and senior technical lead assignment',
        'Proactive infrastructure monitoring with automated remediation',
        'Weekly optimization calls and strategic IT planning sessions',
        'Custom integrations and enterprise development support',
        'SLA guarantees with performance metrics and reporting',
        'Executive IT reporting and business impact analysis',
        'Disaster recovery planning and business continuity support'
      ],
      gradient: 'from-emerald-700 to-emerald-800',
      bgGradient: 'from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20',
      buttonClass: 'shiny-button-enterprise'
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
              <h2 className="text-3xl sm:text-4xl lg:text-5xl mobile-title font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 dark:from-slate-100 dark:via-blue-300 dark:to-slate-100 bg-clip-text text-transparent mb-6 leading-[1.1] pb-4">
                IT Infrastructure & Microsoft 365 Services
              </h2>
              <p className="text-lg sm:text-xl mobile-text text-slate-600 dark:text-slate-300 max-w-4xl mx-auto pb-2">
                Outsource your IT management and Microsoft 365 implementation to our expert team. We handle everything from infrastructure setup to ongoing support, so you can focus on growing your business while reducing IT overhead by up to 60%.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {packages.map((pkg, index) => (
              <AnimatedSection key={index} delay={index * 100}>
                <div className="relative group h-full transform transition-all duration-300 hover:scale-105">
                  <div className={`${pkg.cardClass} bg-gradient-to-br from-white via-blue-50/50 to-white dark:from-slate-800 dark:via-blue-900/50 dark:to-slate-800 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden h-full border border-slate-200/50 dark:border-slate-700/50 mobile-card flex flex-col`}>
                    <div className={`${pkg.cardClass ? 'text-grey' : `bg-gradient-to-r ${pkg.gradient} text-white`} p-6 sm:p-8 mobile-tile text-center relative overflow-hidden`}>
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
                            <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mr-4 mt-0.5 shadow-sm ${
                              feature.included 
                                ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                                : 'bg-gradient-to-r from-red-500 to-red-600'
                            }`}>
                              {feature.included ? (
                                <Check className="w-3 h-3 text-white font-bold" strokeWidth={3} aria-hidden="true" />
                              ) : (
                                <X className="w-3 h-3 text-white font-bold" strokeWidth={3} aria-hidden="true" />
                              )}
                            </div>
                            <div className="flex-grow">
                              <span className={`text-sm sm:text-base mobile-text font-semibold ${
                                feature.included 
                                  ? 'text-slate-800 dark:text-slate-100' 
                                  : 'text-white dark:text-white'
                              }`}>
                                {feature.name}
                              </span>
                              {feature.details && feature.included && (
                                <p className={`text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed ${
                                  feature.included ? 'opacity-90' : 'opacity-60'
                                }`}>
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
                          Get Started
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
              <h3 className="text-3xl sm:text-4xl mobile-title font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 dark:from-slate-100 dark:via-blue-300 dark:to-slate-100 bg-clip-text text-transparent mb-6 leading-[1.1] pb-4">
                Ongoing IT Support & Management Services
              </h3>
              <p className="text-lg sm:text-xl mobile-text text-slate-600 dark:text-slate-300 max-w-4xl mx-auto pb-2">
                Comprehensive IT support services for your infrastructure and Microsoft 365 environment. Our managed services ensure your systems run smoothly while you focus on your core business operations.
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
                      <h4 className={`text-2xl sm:text-3xl mobile-title font-bold bg-gradient-to-r ${support.gradient} bg-clip-text text-transparent mb-3 pb-2`}>
                        {support.name}
                      </h4>
                      <div className="text-xs sm:text-sm mobile-text text-slate-500 dark:text-slate-400 mb-1">Starting from</div>
                      <div className={`text-xl sm:text-2xl font-bold bg-gradient-to-r ${support.gradient} bg-clip-text text-transparent pb-1`}>
                        {support.price}
                      </div>
                      <div className="text-xs sm:text-sm mobile-text text-slate-500 dark:text-slate-400 mt-1">based on infrastructure complexity</div>
                    </div>
                    
                    <div className="space-y-3 sm:space-y-4 text-slate-700 dark:text-slate-200 mb-8 flex-grow">
                      {support.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-start space-x-4 group/item">
                          <div className={`flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r ${support.gradient} rounded-lg flex items-center justify-center mt-0.5 group-hover/item:scale-110 transition-transform duration-200`}>
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                          <span className="leading-relaxed text-sm sm:text-base mobile-text font-medium">{feature}</span>
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