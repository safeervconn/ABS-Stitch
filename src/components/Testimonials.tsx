import React from 'react';
import { Star, Quote } from 'lucide-react';
import AnimatedSection from './AnimatedSection';
import LazyImage from './LazyImage';

const Testimonials = () => {
  const testimonials = [
    {
      name: 'Sarah Johnson',
      position: 'CTO',
      company: 'TechStart Inc.',
      content: 'TechFlow Solutions transformed our entire workflow. The implementation was seamless and their support team is exceptional. Our productivity increased by 40% within the first month.',
      rating: 5,
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    },
    {
      name: 'Michael Chen',
      position: 'Operations Director', 
      company: 'Global Dynamics',
      content: 'The premium package was perfect for our growing team. Professional setup, excellent training, and ongoing support that actually works. Highly recommend their services.',
      rating: 5,
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    },
    {
      name: 'Emily Rodriguez',
      position: 'IT Manager',
      company: 'Creative Solutions',
      content: 'Outstanding service from start to finish. They handled everything while we focused on our business. The enterprise package features are exactly what we needed for compliance.',
      rating: 5,
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    }
  ];

  const partners = [
    { name: 'Microsoft', logo: '🏢' },
    { name: 'Amazon Web Services', logo: '☁️' },
    { name: 'Google Cloud', logo: '🔧' },
    { name: 'Salesforce', logo: '⚡' },
    { name: 'Slack', logo: '💬' },
    { name: 'Zoom', logo: '📹' }
  ];

  return (
    <>
      <section id="testimonials" className="py-20 bg-gradient-to-br from-white via-purple-50/30 to-white dark:from-slate-900 dark:via-purple-950/30 dark:to-slate-900">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 via-purple-800 to-slate-900 dark:from-white dark:via-purple-300 dark:to-white bg-clip-text text-transparent mb-6 leading-tight">
                What Our Clients Say
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                Don't just take our word for it. Here's what business leaders say about our services.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <AnimatedSection key={index} delay={index * 100}>
                <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-indigo-100 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-indigo-800/20 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-200 hover:-translate-y-2 border border-indigo-200/50 dark:border-indigo-700/50 relative transform hover:scale-105">
                  <div className="absolute top-6 right-6 text-indigo-200 dark:text-indigo-800">
                    <Quote size={32} aria-hidden="true" />
                  </div>

                  <div className="flex items-center mb-6">
                    <LazyImage
                      src={testimonial.avatar}
                      alt={`${testimonial.name} - ${testimonial.position} at ${testimonial.company}`}
                      className="w-16 h-16 rounded-full object-cover mr-4 border-4 border-white dark:border-slate-600 shadow-lg"
                    />
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white text-lg">
                        {testimonial.name}
                      </h4>
                      <p className="text-slate-600 dark:text-slate-400">{testimonial.position}</p>
                      <p className="text-indigo-600 dark:text-indigo-400 font-medium">{testimonial.company}</p>
                    </div>
                  </div>

                  <div className="flex mb-4" role="img" aria-label={`${testimonial.rating} out of 5 stars`}>
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" aria-hidden="true" />
                    ))}
                  </div>

                  <blockquote className="text-slate-700 dark:text-slate-300 leading-relaxed italic">
                    "{testimonial.content}"
                  </blockquote>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-100 dark:from-indigo-950 dark:via-purple-950 dark:to-indigo-900">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-purple-800 to-slate-900 dark:from-white dark:via-purple-300 dark:to-white bg-clip-text text-transparent mb-4 leading-tight">
                Trusted Partners
              </h3>
              <p className="text-lg text-slate-600 dark:text-slate-300">
                We work with industry-leading companies to deliver the best solutions
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {partners.map((partner, index) => (
              <AnimatedSection key={index} delay={index * 50}>
                <div className="bg-gradient-to-br from-white via-indigo-50/50 to-white dark:from-slate-800 dark:via-indigo-900/50 dark:to-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-150 hover:-translate-y-1 border border-slate-200/50 dark:border-slate-700/50 text-center transform hover:scale-105">
                  <div className="text-4xl mb-3" aria-hidden="true">{partner.logo}</div>
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {partner.name}
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

export default Testimonials;