import React, { useState } from 'react';
import { Send, Clock, Phone, Mail, MapPin, Linkedin, Twitter, Github, Instagram, Facebook, AlertCircle } from 'lucide-react';
import AnimatedSection from './AnimatedSection';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    service: '',
    supportPackage: '',
    teamSize: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.company.trim()) {
      newErrors.company = 'Company name is required';
    }

    if (!formData.service) {
      newErrors.service = 'Please select a service package';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Form submitted:', formData);
      alert('Thank you for your inquiry! Our team will contact you within 48 hours to discuss how we can reduce your IT overhead and boost productivity.');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        company: '',
        phone: '',
        service: '',
        supportPackage: '',
        teamSize: '',
        message: ''
      });
      setErrors({});
    } catch (error) {
      console.error('Form submission error:', error);
      alert('There was an error submitting your form. Please try again or contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const socialLinks = [
    { name: 'LinkedIn', icon: Linkedin, url: 'https://linkedin.com/company/techflowsolutions' },
    { name: 'Twitter', icon: Twitter, url: 'https://twitter.com/techflowsolutions' },
    { name: 'Facebook', icon: Facebook, url: 'https://facebook.com/techflowsolutions' },
    { name: 'Instagram', icon: Instagram, url: 'https://instagram.com/techflowsolutions' },
    { name: 'GitHub', icon: Github, url: 'https://github.com/techflowsolutions' }
  ];

  return (
    <section id="contact" className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-950 dark:via-blue-950/50 dark:to-slate-950">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl mobile-title font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 dark:from-slate-100 dark:via-blue-300 dark:to-slate-100 bg-clip-text text-transparent mb-6 leading-[1.1] pb-2">
              Get Your Free IT Infrastructure Consultation
            </h2>
            <p className="text-lg sm:text-xl mobile-text text-slate-600 dark:text-slate-300 max-w-4xl mx-auto">
              Ready to transform your workplace and reduce IT overhead by up to 60%? Let's discuss your requirements and create a customized Office 365 implementation strategy that fits your business needs.
            </p>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          <AnimatedSection className="lg:col-span-3">
            <div className="bg-gradient-to-br from-white/95 via-blue-50/50 to-white/95 dark:from-slate-800/95 dark:via-blue-900/30 dark:to-slate-800/95 backdrop-blur-xl rounded-3xl p-6 sm:p-10 mobile-tile shadow-2xl border border-slate-200/50 dark:border-slate-700/50 mobile-card">
              <h3 className="text-2xl sm:text-3xl mobile-title font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 dark:from-slate-100 dark:via-blue-300 dark:to-slate-100 bg-clip-text text-transparent mb-8 leading-[1.1] pb-2">
                Tell Us About Your IT Infrastructure Needs
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8" noValidate>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-4 sm:px-6 py-3 sm:py-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 transition-all duration-150 text-sm sm:text-base ${
                        errors.name ? 'border-red-500 dark:border-red-400' : 'border-slate-300 dark:border-slate-600'
                      }`}
                      placeholder="Your full name"
                      aria-describedby={errors.name ? 'name-error' : undefined}
                    />
                    {errors.name && (
                      <p id="name-error" className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.name}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 sm:px-6 py-3 sm:py-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 transition-all duration-150 text-sm sm:text-base ${
                        errors.email ? 'border-red-500 dark:border-red-400' : 'border-slate-300 dark:border-slate-600'
                      }`}
                      placeholder="your.email@company.com"
                      aria-describedby={errors.email ? 'email-error' : undefined}
                    />
                    {errors.email && (
                      <p id="email-error" className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      required
                      value={formData.company}
                      onChange={handleChange}
                      className={`w-full px-4 sm:px-6 py-3 sm:py-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 transition-all duration-150 text-sm sm:text-base ${
                        errors.company ? 'border-red-500 dark:border-red-400' : 'border-slate-300 dark:border-slate-600'
                      }`}
                      placeholder="Your company name"
                      aria-describedby={errors.company ? 'company-error' : undefined}
                    />
                    {errors.company && (
                      <p id="company-error" className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.company}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 sm:px-6 py-3 sm:py-4 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 transition-all duration-150 text-sm sm:text-base"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label htmlFor="service" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                      Service Package *
                    </label>
                    <select
                      id="service"
                      name="service"
                      required
                      value={formData.service}
                      onChange={handleChange}
                      className={`w-full px-4 sm:px-6 py-3 sm:py-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 transition-all duration-150 appearance-none cursor-pointer text-sm sm:text-base ${
                        errors.service ? 'border-red-500 dark:border-red-400' : 'border-slate-300 dark:border-slate-600'
                      }`}
                      aria-describedby={errors.service ? 'service-error' : undefined}
                    >
                      <option value="">Select a package</option>
                      <option value="basic">Basic Package - Office 365 Setup ($299/month)</option>
                      <option value="premium">Premium Package - Advanced Implementation ($599/month)</option>
                      <option value="enterprise">Enterprise Package - Complete Solution ($1,299/month)</option>
                      <option value="custom">Custom Solution - Tailored to Your Needs</option>
                    </select>
                    {errors.service && (
                      <p id="service-error" className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.service}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="supportPackage" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                      Support Package
                    </label>
                    <select
                      id="supportPackage"
                      name="supportPackage"
                      value={formData.supportPackage}
                      onChange={handleChange}
                      className="w-full px-4 sm:px-6 py-3 sm:py-4 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 transition-all duration-150 appearance-none cursor-pointer text-sm sm:text-base"
                    >
                      <option value="">Select support package</option>
                      <option value="basic-support">Basic Support ($50-150/month)</option>
                      <option value="premium-support">Premium Support ($150-400/month)</option>
                      <option value="enterprise-support">Enterprise Support ($400-1000/month)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="teamSize" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    Team Size
                  </label>
                  <select
                    id="teamSize"
                    name="teamSize"
                    value={formData.teamSize}
                    onChange={handleChange}
                    className="w-full px-4 sm:px-6 py-3 sm:py-4 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 transition-all duration-150 appearance-none cursor-pointer text-sm sm:text-base"
                  >
                    <option value="">Select team size</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="500+">500+ employees</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    Project Details & Requirements
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 sm:px-6 py-3 sm:py-4 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 transition-all duration-150 resize-none text-sm sm:text-base"
                    placeholder="Tell us about your current IT setup, specific Office 365 requirements, compliance needs, integration requirements, or any questions you have about our services..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full shiny-button-no-slide text-white py-4 sm:py-5 px-8 rounded-xl font-semibold hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-150 flex items-center justify-center text-base sm:text-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center">
                    {isSubmitting ? 'Submitting...' : 'Submit & Consult'}
                    {!isSubmitting && (
                      <Send className="ml-3 w-5 h-5 sm:w-6 sm:h-6" />
                    )}
                  </span>
                </button>

                <p className="text-xs sm:text-sm mobile-text text-slate-600 dark:text-slate-400 text-center flex items-center justify-center">
                  <Clock className="inline w-4 h-4 mr-2" aria-hidden="true" />
                  Our IT specialists will contact you within 48 hours with a customized proposal
                </p>
              </form>
            </div>
          </AnimatedSection>

          <AnimatedSection className="lg:col-span-2 space-y-8" delay={200}>
            <div className="bg-gradient-to-br from-white/95 via-blue-50/50 to-white/95 dark:from-slate-800/95 dark:via-blue-900/30 dark:to-slate-800/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 mobile-tile shadow-2xl border border-slate-200/50 dark:border-slate-700/50 mobile-card">
              <h3 className="text-xl sm:text-2xl mobile-title font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 dark:from-slate-100 dark:via-blue-300 dark:to-slate-100 bg-clip-text text-transparent mb-8 leading-[1.1] pb-2">
                Contact Information
              </h3>

              <div className="space-y-6 sm:space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl shadow-lg">
                    <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-base sm:text-lg mb-1">Phone</h4>
                    <a href="tel:+15551234567" className="text-slate-600 dark:text-slate-300 mb-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm sm:text-base mobile-text">
                      +1 (555) 123-4567
                    </a>
                    <p className="text-xs sm:text-sm mobile-text text-slate-500 dark:text-slate-400">Mon-Fri 9AM-6PM EST</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl shadow-lg">
                    <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-base sm:text-lg mb-1">Email</h4>
                    <a href="mailto:hello@techflowsolutions.com" className="text-slate-600 dark:text-slate-300 mb-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm sm:text-base mobile-text">
                      hello@techflowsolutions.com
                    </a>
                    <p className="text-xs sm:text-sm mobile-text text-slate-500 dark:text-slate-400">We reply within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl shadow-lg">
                    <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-base sm:text-lg mb-1">Office</h4>
                    <address className="text-slate-600 dark:text-slate-300 not-italic text-sm sm:text-base mobile-text">
                      123 Business Ave, Suite 456<br />
                      Tech City, TC 12345
                    </address>
                  </div>
                </div>

                <div className="pt-6 sm:pt-8 border-t border-slate-200 dark:border-slate-700">
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-4 sm:mb-6 text-base sm:text-lg">Follow Us</h4>
                  <div className="flex space-x-3 sm:space-x-4">
                    {socialLinks.map((social) => (
                      <a
                        key={social.name}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 sm:p-3 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg text-blue-600 dark:text-blue-400 hover:from-blue-200 hover:to-blue-300 dark:hover:from-blue-800/50 dark:hover:to-blue-700/50 transition-all duration-150 hover:scale-110 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        title={`Follow us on ${social.name}`}
                        aria-label={`Follow TechFlow Solutions on ${social.name}`}
                      >
                        <social.icon size={18} />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};

export default Contact;