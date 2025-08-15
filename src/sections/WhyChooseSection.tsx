const WhyChooseSection = () => {
  const features = [
    "Online Registration: Register your deeds from anywhere, at any time. Our intuitive online process makes it efficient and accessible for everyone.",
    "Secure & Transparent: Leveraging advanced security protocols and blockchain technology, we ensure data integrity and prevent fraudulent activities, giving you peace of mind.",
    "Instant Access: Access crucial property information with just a few clicks. Your data, when you need it.",
    "Digital Documentation: All your land records are stored and managed digitally, reducing the risk of loss and making retrieval effortless.",
    "Reduced Paperwork: We’ve virtually eliminated manual paperwork, cutting down on administrative burdens and associated delays.",
    "Cost Savings: Experience significant cost savings for both citizens and the government through our streamlined and efficient processes.",
  ];

  return (
    <section className="w-full px-6 md:px-16 py-16 text-black">
      <h2 className="text-2xl md:text-3xl font-bold mb-8">
        Why Choose Our E-Deed Registry?
      </h2>
      <ul className="list-disc pl-6 space-y-4">
        {features.map((feature, index) => (
          <li key={index}>{feature}</li>
        ))}
      </ul>
    </section>
  );
};

export default WhyChooseSection;
