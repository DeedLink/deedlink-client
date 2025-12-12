import mergedVideo from "../assets/video/v0_merged.mp4";

const RextroVideo = () => {
    return (
        <div className="fixed flex w-full h-screen items-center justify-center z-[3000] backdrop-blur-3xl">
            <video
                className="w-full h-full object-contain"
                autoPlay
                muted
                playsInline
                loop
            >
                <source src={mergedVideo} type="video/mp4" />
            </video>
            <div className="absolute bottom-1 right-1 sm:bottom-2 xl:bottom-7 sm:right-2 bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-lg px-6 py-2 sm:py-4 xl:py-7 shadow-lg backdrop-blur-sm border border-emerald-400/30 min-w-[140px] max-w-[200px] md:max-w-[300px] xl:max-w-[640px] w-full">
                <div className="flex items-center gap-2.5 justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse"></div>
                <span className="text-white font-bold text-base tracking-wide">DeedLink</span>
                </div>
            </div>
        </div>
    );
};

export default RextroVideo;