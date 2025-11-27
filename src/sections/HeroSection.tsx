import background from "../assets/images/backgrounds/home.webp";
import { useLogin } from "../contexts/LoginContext";
import { useSignup } from "../contexts/SignupContext";

const heroHighlights = [
  "Digitally register land transfers with tamper-proof audit trails",
  "Verify deed authenticity in seconds with blockchain-backed records",
  "Monitor ownership updates, caveats, and mortgages from one dashboard",
];

const heroStats = [
  { label: "Registered deeds", value: "2,400+" },
  { label: "Fraud alerts prevented", value: "310" },
  { label: "Verification uptime", value: "99.9%" },
];

const HeroSection = () => {
  const { openLogin, user, logout } = useLogin();
  const { openSignup } = useSignup();

  return (
    <section
      className="relative w-full bg-cover bg-center flex flex-col items-start justify-center text-white pb-24 pt-32 px-4 md:px-10"
      style={{
        backgroundImage: `linear-gradient(rgba(0,60,10,0.9), rgba(0,60,10,0.92)), url(${background})`,
      }}
    >
      <div className="max-w-boundary mx-auto w-full px-4 md:px-16">
        <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-widest text-emerald-200 mb-6">
          <span className="bg-white/10 border border-white/20 rounded-full px-3 py-1">
            Sri Lanka National Pilot
          </span>
          <span>Digital Property Assurance Platform</span>
        </div>

        <div className="grid gap-12 lg:gap-16 lg:grid-cols-[minmax(0,3fr)_minmax(280px,2fr)] items-center">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-6">
              Instantly understand every land deed — captured, verified, and
              protected in one secure vault.
            </h1>
            <p className="mb-6 leading-relaxed text-sm md:text-base opacity-90">
              ADeed is the government's trusted web platform for digitizing
              property ownership. From first submission to final registration,
              we surface the status, data, and parties involved so citizens,
              lawyers, and officers know exactly what is happening.
            </p>

            <ul className="space-y-4 mb-8 text-sm md:text-base">
              {heroHighlights.map((highlight) => (
                <li
                  key={highlight}
                  className="flex items-start gap-3 bg-white/5 px-4 py-3 rounded-lg border border-white/10"
                >
                  <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-emerald-300" />
                  <span className="opacity-95">{highlight}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-4">
              {!user ? (
                <>
                  <button
                    onClick={openLogin}
                    className="text-[#00420A] bg-white px-6 py-3 rounded-lg shadow hover:bg-green-100 transition cursor-pointer font-medium"
                  >
                    Login to your vault
                  </button>
                  <button
                    onClick={openSignup}
                    className="bg-green-500 text-white px-6 py-3 rounded-lg shadow hover:bg-green-400 transition cursor-pointer font-medium border border-white/30"
                  >
                    Create account
                  </button>
                </>
              ) : (
                <button
                  onClick={logout}
                  className="px-6 py-3 rounded-lg shadow bg-red-600 hover:bg-red-500 transition cursor-pointer text-white font-medium"
                >
                  Logout
                </button>
              )}
            </div>
          </div>

          <div className="bg-white/5 border border-white/15 rounded-2xl p-6 backdrop-blur">
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-100 mb-2">
              At a glance
            </p>
            <h3 className="text-2xl font-semibold mb-4">
              What this platform delivers
            </h3>
            <p className="text-sm opacity-90 mb-6">
              Real-time deed registration, ownership verification, and document
              collaboration for every stakeholder in the property lifecycle.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {heroStats.map((stat) => (
                <div
                  className="bg-white/10 rounded-xl px-4 py-3 border border-white/10"
                  key={stat.label}
                >
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs uppercase tracking-wide text-emerald-100">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="bg-white text-[#00420A] rounded-xl px-4 py-3 text-sm shadow">
              <p className="font-semibold mb-1">Need instant clarity?</p>
              <p>
                Use ADeed to inspect the chain of ownership, confirm property
                boundaries, and share verified proofs with banks or buyers in
                minutes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
