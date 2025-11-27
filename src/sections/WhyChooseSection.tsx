import { FaCheckCircle } from "react-icons/fa";

const WhyChooseSection = () => {
  const features = [
    {
      title: "Online Registration",
      desc: "Send your deeds from any place at any time with a clear online flow.",
    },
    {
      title: "Secure & Transparent",
      desc: "Strong security keeps data safe and keeps everyone honest.",
    },
    {
      title: "Instant Access",
      desc: "Open key property data in a few clicks whenever you need it.",
    },
    {
      title: "Digital Documentation",
      desc: "Every land record stays in digital form so nothing gets lost.",
    },
    {
      title: "Reduced Paperwork",
      desc: "Less manual paperwork means shorter lines and fewer delays.",
    },
    {
      title: "Cost Savings",
      desc: "Faster reviews and automation cut overall costs for everyone.",
    },
  ];

  return (
    <section className="w-full text-gray-900 px-4 md:px-10">
      <div className="mb-4">
        <span className="text-emerald-600 font-bold text-sm uppercase tracking-wider">
          Benefits
        </span>
      </div>
      <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
        Why Choose Our Digital Deed Registry?
      </h2>
      <p className="text-white mb-12 text-lg">
        See the future of land services with clear and simple tools
      </p>
      
      <div className="grid md:grid-cols-2 gap-6">
        {features.map((feature, index) => (
          <div
            key={index}
            className="group p-6 rounded-2xl bg-white border border-gray-200 hover:border-emerald-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-start gap-4">
              <div className="p-2 bg-emerald-100 rounded-lg group-hover:bg-emerald-500 transition-colors">
                <FaCheckCircle className="text-emerald-600 group-hover:text-white text-xl transition-colors" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2 text-gray-900 group-hover:text-emerald-700 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WhyChooseSection;