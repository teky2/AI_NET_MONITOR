import React from 'react';
import { ShieldCheck, ExternalLink, Zap } from 'lucide-react';

interface SponsorBannerProps {
  onUpgradeToPro: () => void;
  tier: 'Free' | 'Pro' | 'Enterprise';
}

export const SponsorBanner: React.FC<SponsorBannerProps> = ({ onUpgradeToPro, tier }) => {
  if (tier !== 'Free') {
    return null; // Pro & Enterprise tiers have zero ads
  }

  return (
    <div className="mx-auto my-6 max-w-5xl overflow-hidden rounded-2xl border border-cyan-900/40 bg-gradient-to-r from-[#09101f] via-[#0d162c] to-[#09101f] p-3 sm:p-4 text-xs shadow-md">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-3 text-center sm:text-left">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-cyan-950/80 border border-cyan-800 text-cyan-400">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center justify-center sm:justify-start space-x-2">
              <span className="font-bold text-white">SPONSORED INFRASTRUCTURE PARTNER</span>
              <span className="rounded bg-cyan-950 px-1.5 py-0.2 text-[9px] font-mono text-cyan-300 border border-cyan-800/60 uppercase">
                Ad Slot ($2.40 CPM)
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Tired of ISP bandwidth throttling? Switch to 10Gbps Dedicated Enterprise Fiber with 99.999% SLA.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 flex-shrink-0">
          <button
            onClick={onUpgradeToPro}
            className="rounded-lg border border-slate-700 bg-[#070b14] px-3 py-1.5 text-[11px] font-medium text-slate-300 hover:text-white hover:border-slate-600 transition-colors cursor-pointer"
          >
            Remove Ads with Pro ($19/mo)
          </button>
          <a
            href="#monetization"
            onClick={(e) => {
              e.preventDefault();
              onUpgradeToPro();
            }}
            className="flex items-center space-x-1 rounded-lg bg-cyan-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-cyan-500 transition-colors"
          >
            <span>Learn More</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
