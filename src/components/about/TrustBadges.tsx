import React from "react";
import { FaCheckCircle } from "react-icons/fa";

const TrustBadges: React.FC = () => {
  const badges = [
    'Blockchain Secured',
    'Government Verified',
    'ISO Certified',
    'Smart Contract Audited',
    '24/7 Support'
  ];

  return (
    <section className="py-12 bg-gradient-to-r from-green-50 to-emerald-50 border-y border-green-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-wrap justify-center items-center gap-8">
          {badges.map((badge, idx) => (
            <div key={idx} className="flex items-center gap-2 text-green-800">
              <FaCheckCircle className="text-green-600" />
              <span className="font-medium">{badge}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBadges;