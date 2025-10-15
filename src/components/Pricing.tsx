import React from 'react';
import { Package, Zap, Crown } from 'lucide-react';

const Pricing: React.FC = () => {
  const pricingTiers = [
    {
      id: 1,
      title: "Basic Embroidery",
      description: "Perfect for simple logos and small designs on single items",
      icon: Package,
      color: "from-blue-500 to-cyan-500",
      features: [
        "Single color embroidery",
        "Up to 5,000 stitches",
        "Basic logo placement",
        "Standard turnaround time"
      ]
    },
    {
      id: 2,
      title: "Premium Embroidery",
      description: "Ideal for detailed designs and bulk orders with multiple colors",
      icon: Zap,
      color: "from-green-600 to-emerald-600",
      features: [
        "Multi-color embroidery",
        "Up to 15,000 stitches",
        "Custom placement options",
        "Priority turnaround time"
      ]
    },
    {
      id: 3,
      title: "Enterprise Solutions",
      description: "Complete branding packages for businesses and large-scale projects",
      icon: Crown,
      color: "from-orange-500 to-amber-600",
      features: [
        "Unlimited colors & stitches",
        "Complex design support",
        "Multiple item types",
        "Express turnaround time"
      ]
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50" id="pricing">
      <div className="container mx-auto px-4">

        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-4">
            Transparent Pricing
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Quality embroidery services at competitive rates. Choose the package that fits your needs.
          </p>
        </div>

        <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {pricingTiers.map((tier) => {
            const IconComponent = tier.icon;
            return (
              <div
                key={tier.id}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-gray-200 flex flex-col h-full"
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${tier.color} flex items-center justify-center mb-4`}>
                  <IconComponent className="h-6 w-6 text-white" />
                </div>

                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {tier.title}
                </h3>

                <p className="text-gray-600 leading-relaxed mb-4 text-sm">
                  {tier.description}
                </p>

                <div className="mb-4">
                  <div className="text-3xl font-bold text-gray-800">
                    Starting from $10
                  </div>
                  <div className="text-gray-500 text-sm">per item</div>
                </div>

                <div className="border-t border-gray-100 pt-4 mb-4">
                  <ul className="space-y-2">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span className="text-gray-600 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => window.location.href = '/#contact'}
                  className="btn-primary w-full mt-auto"
                >
                  Get Started
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
