import React from "react";

const CTASection: React.FC = () => {
  return (
    <section className="py-20 px-6 md:px-16 bg-gradient-to-br from-green-900 via-green-800 to-emerald-950 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-400 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Ready to Transform Property Ownership?
        </h2>
        <p className="text-green-100 text-lg mb-8 max-w-2xl mx-auto">
          Join thousands of property owners and investors who trust DeedLink for secure, transparent, and efficient property management.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button className="bg-white text-green-900 px-8 py-4 rounded-lg font-semibold hover:bg-green-50 transition shadow-xl">
            Register Your Property
          </button>
          <button className="bg-green-700 text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-600 transition border border-green-500 shadow-xl">
            Explore Marketplace
          </button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;