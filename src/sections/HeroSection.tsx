import background from "../assets/images/backgrounds/home.webp";
import { useLogin } from "../contexts/LoginContext";
import { useSignup } from "../contexts/SignupContext";

const HeroSection = () => {
  const { openLogin, user, logout } = useLogin();
  const { openSignup } = useSignup();

  return (
    <section
      className="relative w-full bg-cover bg-center flex flex-col items-start justify-center text-white pb-20 pt-32 px-4 md:px-10"
      style={{
        backgroundImage: `linear-gradient(rgba(0,60,10,0.85), rgba(0,60,10,0.85)), url(${background})`,
      }}
    >
      <div className="max-w-boundary mx-auto w-full">
        <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-6">
          Simplify property ownership with our secure digital deed registry
        </h1>
        <p className="mb-8 leading-relaxed text-sm md:text-base opacity-90">
          In today's fast-paced world, managing property deeds can feel
          overwhelming. Our E-Deed Registry System brings transparency,
          security, and efficiency right to your fingertips. Say goodbye to
          piles of paperwork and endless queues – we’re revolutionizing how you
          interact with your most valuable assets.
        </p>
        <p className="mb-8 leading-relaxed text-sm md:text-base opacity-90">
          This system is designed to streamline deed registration, significantly
          reduce fraud, and provide secure, instant access to your land records.
          Whether you’re a citizen, a legal professional, or a government
          stakeholder, you’ll benefit from a system built on trust and
          cutting-edge technology.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          {!user ? (
            <>
              <button
                onClick={openLogin}
                className="text-[#00420A] bg-white px-6 py-3 rounded-lg shadow hover:bg-green-100 transition cursor-pointer"
              >
                Login
              </button>
              <button
                onClick={openSignup}
                className="bg-green-600 text-white px-6 py-3 rounded-lg shadow hover:bg-green-700 transition cursor-pointer"
              >
                Register
              </button>
            </>
          ) : (
            <button
              onClick={logout}
              className="px-6 py-3 rounded-lg shadow bg-red-600 hover:bg-red-500 transition cursor-pointer text-white"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
