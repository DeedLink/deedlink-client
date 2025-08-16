import React from "react";

const HeroSection: React.FC = () => {
  return (
    <section className="bg-gradient-to-r from-green-100 to-emerald-50 py-24 px-6 md:px-16 text-center">
      <h1 className="text-5xl md:text-6xl font-bold text-[#00420A] mb-6">
        Revolutionizing Property Ownership
      </h1>
      <p className="text-gray-700 max-w-3xl mx-auto text-lg md:text-xl leading-relaxed">
        Our platform transforms traditional property deeds into secure blockchain tokens. With NFTs representing full ownership and fractional tokens (FTs) enabling shared ownership, investing in real estate has never been more accessible, transparent, and trustworthy.
      </p>
    </section>
  );
};

export default HeroSection;
