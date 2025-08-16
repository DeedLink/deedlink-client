import React from "react";
import TokenCard from "./TokenCard";

export interface Token {
  id: string;
  deedNumber: string;
  type: "NFT" | "FT";
  owner: string;
  share?: number;
  price: number;
  isMine?: boolean;
}

interface TokenGridProps {
  tokens: Token[];
  onBuy?: (tokenId: string) => void;
  onSell?: (tokenId: string) => void;
}

const TokenGrid: React.FC<TokenGridProps> = ({ tokens, onBuy, onSell }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {tokens.map((t) => (
        <TokenCard
          key={t.id}
          deedNumber={t.deedNumber}
          type={t.type}
          owner={t.owner}
          share={t.share}
          price={t.price}
          isMine={t.isMine}
          onBuy={() => onBuy?.(t.id)}
          onSell={() => onSell?.(t.id)}
        />
      ))}
    </div>
  );
};

export default TokenGrid;
