import React from "react";
import MarketPropertyCard from "./MarketPropertyCard";
import type { IDeed } from "../../types/responseDeed";
import type { Title } from "../../types/title";

export interface MarketProperty {
  deed: IDeed;
  transaction: Title;
  isMine?: boolean;
}

interface MarketPropertyGridProps {
  properties: MarketProperty[];
  onBuy?: (transactionId: string, deedId: string) => void;
  onViewDetails?: (deedNumber: string) => void;
}

const MarketPropertyGrid: React.FC<MarketPropertyGridProps> = ({
  properties,
  onBuy,
  onViewDetails,
}) => {
  if (properties.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[#FEFBF6]/70 text-lg">No properties available in the market.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property) => (
        <MarketPropertyCard
          key={property.transaction._id || property.deed._id}
          deed={property.deed}
          transaction={property.transaction}
          isMine={property.isMine}
          onBuy={onBuy}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
};

export default MarketPropertyGrid;

