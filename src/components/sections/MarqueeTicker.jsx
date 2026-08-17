import React from 'react';
import { studioData } from '../../data/mockData';

export default function MarqueeTicker() {
  const items = [...studioData.marquee, ...studioData.marquee, ...studioData.marquee, ...studioData.marquee];

  return (
    <div className="w-full bg-black border-y border-[#222222] py-3.5 overflow-hidden select-none">
      <div className="animate-marquee gap-8">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-6">
            <span className="text-xs font-bold tracking-[0.2em] text-[#d4af37] whitespace-nowrap uppercase">
              {item}
            </span>
            <span className="text-[#d4af37]/40 text-[10px]">◆</span>
          </div>
        ))}
      </div>
    </div>
  );
}