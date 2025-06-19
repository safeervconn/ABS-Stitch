import React, { useEffect, useRef } from 'react';
import { Star, Quote } from 'lucide-react';
import AnimatedSection from './AnimatedSection';
import LazyImage from './LazyImage';

const Testimonials = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const testimonials = [
    {
      name: 'Sarah Johnson',
      position: 'CTO',
      company: 'TechStart Inc.',
      content: 'TechFlow Solutions transformed our entire workflow. The implementation was seamless and their support team is exceptional. Our productivity increased by 40% within the first month while reducing IT overhead significantly.',
      rating: 5,
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    },
    {
      name: 'Michael Chen',
      position: 'Operations Director', 
      company: 'Global Dynamics',
      content: 'The premium package was perfect for our growing team. Professional setup, excellent training, and ongoing support that actually works. We reduced our IT costs by 50% while improving efficiency.',
      rating: 5,
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    },
    {
      name: 'Emily Rodriguez',
      position: 'IT Manager',
      company: 'Creative Solutions',
      content: 'Outstanding service from start to finish. They handled everything while we focused on our business. The enterprise package features are exactly what we needed for compliance and security.',
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

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let scrollAmount = 0;
    const scrollStep = 1;
    const scrollDelay = 30;

    const scroll = () => {
      scrollAmount += scrollStep;
      if (scrollAmount >= scrollContainer.scrollWidth / 2) {
        scrollAmount = 0;
      }
      scrollContainer.scrollLeft = scrollAmount;
    };

    const intervalId = setInterval(scroll, scrollDelay);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <>
      <section id="testimonials" className="py-20 bg-gradient-to-br from-white via-blue-50/30 to-white dark:from-slate-950 dark:via-blue-950/30 dark:to-slate-950">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 dark:from-slate-100 dark:via-blue-300 dark:to-slate-100 bg-clip-text text-transparent mb-6 leading-[1.1] pb-2">
                What Our Clients Say
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                Don't just take our word for it. Here's what business leaders say about our IT infrastructure services and how we've helped them reduce overhead while boosting productivity.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <AnimatedSection key={index} delay={index * 100}>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-200 hover:-translate-y-2 border border-blue-200/50 dark:border-blue-700/50 relative transform hover:scale-105">
                  <div className="absolute top-6 right-6 text-blue-200 dark:text-blue-800">
                    <Quote size={32} aria-hidden="true" />
                  </div>

                  <div className="flex items-center mb-6">
                    <LazyImage
                      src={testimonial.avatar}
                      alt={`${testimonial.name} - ${testimonial.position} at ${testimonial.company}`}
                      className="w-16 h-16 rounded-full object-cover mr-4 border-4 border-white dark:border-slate-600 shadow-lg"
                    />
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-lg">
                        {testimonial.name}
                      </h4>
                      <p className="text-slate-600 dark:text-slate-400">{testimonial.position}</p>
                      <p className="text-blue-600 dark:text-blue-400 font-medium">{testimonial.company}</p>
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

      <section className="py-16 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 dark:from-slate-100 dark:via-blue-300 dark:to-slate-100 bg-clip-text text-transparent mb-4 leading-[1.1] pb-2">
                Trusted Partners
              </h3>
              <p className="text-lg text-slate-600 dark:text-slate-300">
                We work with industry-leading companies to deliver the best solutions
              </p>
            </div>
          </AnimatedSection>

          <div className="overflow-hidden">
            <div 
              ref={scrollRef}
              className="flex space-x-8 animate-scroll"
              style={{ width: 'calc(200% + 2rem)' }}
            >
              {[...partners, ...partners].map((partner, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-48 h-32 bg-gradient-to-br from-white via-blue-50/50 to-white dark:from-slate-800 dark:via-blue-900/50 dark:to-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-150 hover:-translate-y-1 border border-slate-200/50 dark:border-slate-700/50 text-center transform hover:scale-105 flex flex-col items-center justify-center"
                >
                  <div className="text-4xl mb-3" aria-hidden="true">{partner.logo}</div>
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {partner.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Testimonials;