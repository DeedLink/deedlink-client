import React from "react";

const HeroSection: React.FC = () => {
  return (
    <section className="bg-gradient-to-br from-green-900 via-green-800 to-green-950 py-20 px-6 md:px-16 text-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-green-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-400 rounded-full blur-3xl"></div>
      </div>
      <div className="relative z-10">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Blockchain-Powered Property Registry
        </h1>
        <p className="text-green-100 max-w-3xl mx-auto text-base md:text-lg leading-relaxed">
          DeedLink transforms traditional property deed management into a secure, transparent, and efficient digital system using blockchain technology. Register, transfer, and manage property ownership with complete transparency and immutability.
        </p>
      </div>
    </section>
  );
};

export default HeroSection;