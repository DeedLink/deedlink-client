const QuickLinks = () => {
  const links = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Deeds Registration", href: "/deeds-registration" },
    { label: "My Deeds", href: "/deeds" },
    { label: "Marketplace", href: "/market" },
  ];

  return (
    <div className="flex flex-col gap-4 text-white">
      <h3 className="font-semibold text-lg">Quick Links</h3>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              className="text-sm opacity-90 hover:text-emerald-300 hover:opacity-100 transition-colors inline-block"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default QuickLinks;

