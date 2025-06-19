import React from 'react';
import { Phone, Mail, MapPin, Linkedin, Twitter, Github, Instagram, Facebook, Zap } from 'lucide-react';

const Footer = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const socialLinks = [
    { name: 'LinkedIn', icon: Linkedin, url: 'https://linkedin.com/company/techflowsolutions' },
    { name: 'Twitter', icon: Twitter, url: 'https://twitter.com/techflowsolutions' },
    { name: 'Facebook', icon: Facebook, url: 'https://facebook.com/techflowsolutions' },
    { name: 'Instagram', icon: Instagram, url: 'https://instagram.com/techflowsolutions' },
    { name: 'GitHub', icon: Github, url: 'https://github.com/techflowsolutions' }
  ];

  const navItems = ['home', 'about', 'services', 'testimonials', 'contact'];

  return (
    <footer className="bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-white">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 mb-12">
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl shadow-lg">
                <Zap className="text-white" size={24} aria-hidden="true" />
              </div>
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                TechFlow Solutions
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed text-sm max-w-sm mobile-text">
              Your trusted partner for workplace technology implementation and support. Reduce IT overhead while maximizing productivity.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-blue-400 transition-colors duration-150 p-2 rounded-lg hover:bg-slate-800/50 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                  title={`Follow us on ${social.name}`}
                  aria-label={`Follow TechFlow Solutions on ${social.name}`}
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-base sm:text-lg font-semibold text-slate-100">Quick Links</h3>
            <nav>
              <ul className="space-y-3 text-sm">
                {navItems.map((item) => (
                  <li key={item}>
                    <button
                      onClick={() => scrollToSection(item)}
                      className="text-slate-300 hover:text-blue-400 transition-colors duration-150 hover:translate-x-1 transform focus:outline-none focus:text-blue-400 mobile-text"
                    >
                      {item.charAt(0).toUpperCase() + item.slice(1)}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="space-y-6">
            <h3 className="text-base sm:text-lg font-semibold text-slate-100">Contact</h3>
            <div className="space-y-4 text-sm">
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-blue-400" aria-hidden="true" />
                <a href="tel:+15551234567" className="text-slate-300 hover:text-blue-400 transition-colors mobile-text">
                  +1 (555) 123-4567
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-blue-400" aria-hidden="true" />
                <a href="mailto:hello@techflowsolutions.com" className="text-slate-300 hover:text-blue-400 transition-colors mobile-text">
                  hello@techflowsolutions.com
                </a>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-blue-400 mt-0.5" aria-hidden="true" />
                <address className="text-slate-300 not-italic mobile-text">
                  <div>123 Business Ave, Suite 456</div>
                  <div>Tech City, TC 12345</div>
                </address>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-700 pt-8 text-center">
          <div className="text-sm text-slate-400 mobile-text">
            © {new Date().getFullYear()} TechFlow Solutions. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;