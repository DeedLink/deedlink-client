import React from "react";
import type { Marketplace } from "../../types/marketplace";
import MarketplaceCard from "./MarketplaceCard";

interface MarketplaceGridProps {
  marketplaces: Marketplace[];
  onUpdate: () => void;
}

const MarketplaceGrid: React.FC<MarketplaceGridProps> = ({ marketplaces, onUpdate }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {marketplaces.map((marketplace) => (
        <MarketplaceCard key={marketplace._id} marketplace={marketplace} onUpdate={onUpdate} />
      ))}
    </div>
  );
};

export default MarketplaceGrid;