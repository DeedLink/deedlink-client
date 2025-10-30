import { FaCheckCircle } from "react-icons/fa";

const WhyChooseSection = () => {
  const features = [
    {
      title: "Online Registration",
      desc: "Register your deeds from anywhere, at any time. Our intuitive online process makes it efficient and accessible for everyone.",
    },
    {
      title: "Secure & Transparent",
      desc: "Leveraging advanced security protocols and blockchain technology, we ensure data integrity and prevent fraudulent activities.",
    },
    {
      title: "Instant Access",
      desc: "Access crucial property information with just a few clicks. Your data, when you need it.",
    },
    {
      title: "Digital Documentation",
      desc: "All your land records are stored and managed digitally, reducing the risk of loss and making retrieval effortless.",
    },
    {
      title: "Reduced Paperwork",
      desc: "We've virtually eliminated manual paperwork, cutting down on administrative burdens and associated delays.",
    },
    {
      title: "Cost Savings",
      desc: "Experience significant cost savings through streamlined and efficient processes.",
    },
  ];

  return (
    <section className="w-full pb-10 text-gray-900 px-4 md:px-10">
      <div className="mb-4">
        <span className="text-emerald-600 font-bold text-sm uppercase tracking-wider">
          Benefits
        </span>
      </div>
      <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
        Why Choose Our E-Deed Registry?
      </h2>
      <p className="text-gray-600 mb-12 text-lg">
        Experience the future of property management with cutting-edge technology
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