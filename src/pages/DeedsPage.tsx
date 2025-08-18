import { useEffect, useMemo, useState } from "react";
import DeedsToolbar from "../components/deeds/DeedsToolbar";
import DeedGrid from "../components/deeds/DeedGrid";
import DeedViewerPopup from "../components/deeds/DeedViewerPopup";
import type { Deed } from "../types/types";
import { CURRENT_USER, SAMPLE_DEEDS } from "../constants/const";
import { useLoader } from "../contexts/LoaderContext";

type SortKey = "newest" | "value" | "area" | "share";

const DeedsPage = () => {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("newest");
  const [viewer, setViewer] = useState<Deed | null>(null);
  const { showLoader, hideLoader } = useLoader();

  useEffect(()=>{
    if(viewer) { 
      document.body.classList.add('no-scroll');
    }
    else { 
      document.body.classList.remove('no-scroll');
    }
  },[viewer])

  useEffect(() => {
    showLoader();
    const timer = setTimeout(() => {
      hideLoader();
    }, 2000);

    return () => clearTimeout(timer);
  },[]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = SAMPLE_DEEDS.filter((d) => {
      const inOwners = d.owners.some((o) => o.address.toLowerCase().includes(q));
      return (
        !q ||
        d.deedNumber.toLowerCase().includes(q) ||
        d.signedby.toLowerCase().includes(q) ||
        inOwners
      );
    });

    const withMyShare = filtered.map((d) => ({
      deed: d,
      myShare:
        d.owners.find((o) => o.address.toLowerCase() === CURRENT_USER.toLowerCase())?.share ?? 0,
    }));

    withMyShare.sort((a, b) => {
      switch (sortBy) {
        case "value":
          return b.deed.value - a.deed.value;
        case "area":
          return b.deed.area - a.deed.area;
        case "share":
          return b.myShare - a.myShare;
        default:
          return b.deed.timestamp - a.deed.timestamp;
      }
    });

    return withMyShare.map((r) => r.deed);
  }, [query, sortBy]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <header className="sticky top-0 z-40 backdrop-blur bg-white/70 border-b border-black/5 pt-20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-bold text-[#00420A]">My Deeds</h1>
            <div className="h-2 w-40 rounded-full bg-gradient-to-r from-green-600 via-emerald-500 to-green-700" />
          </div>
          <div className="mt-4">
            <DeedsToolbar
              query={query}
              setQuery={setQuery}
              sortBy={sortBy}
              setSortBy={setSortBy}
              onReset={() => { setQuery(""); setSortBy("newest"); }}
              total={results.length}
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <DeedGrid deeds={results} currentUser={CURRENT_USER} onOpen={setViewer} />
      </main>

      <DeedViewerPopup currency="LKR" deed={viewer} onClose={() => setViewer(null)} />
    </div>
  );
};

export default DeedsPage;
