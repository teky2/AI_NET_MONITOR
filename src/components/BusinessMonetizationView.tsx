import React, { useState } from 'react';
import {
  DollarSign,
  Code,
  Shield,
  Zap,
  CheckCircle2,
  Copy,
  Check,
  Building,
  Sparkles,
  ExternalLink,
  Laptop,
  Globe,
  Sliders,
} from 'lucide-react';

interface BusinessMonetizationViewProps {
  currentTier: 'Free' | 'Pro' | 'Enterprise';
  onSelectTier: (tier: 'Free' | 'Pro' | 'Enterprise') => void;
}

export const BusinessMonetizationView: React.FC<BusinessMonetizationViewProps> = ({
  currentTier,
  onSelectTier,
}) => {
  const [embedCompany, setEmbedCompany] = useState('Acme Telecom');
  const [embedColor, setEmbedColor] = useState('#06b6d4');
  const [embedTheme, setEmbedTheme] = useState<'dark' | 'light'>('dark');
  const [copiedCode, setCopiedCode] = useState(false);
  const [checkoutTier, setCheckoutTier] = useState<string | null>(null);

  const embedCodeSnippet = `<!-- NetPulse AI White-Label Speed Test Embed -->
<iframe
  src="${window.location.origin}/?embed=true&brand=${encodeURIComponent(embedCompany)}&color=${encodeURIComponent(embedColor)}&theme=${embedTheme}"
  width="100%"
  height="680"
  style="border: none; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.3);"
  title="${embedCompany} Network Speed Test"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
></iframe>`;

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedCodeSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-b from-[#131b2e] to-[#090e1a] p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400 border border-amber-500/30 mb-3">
              <DollarSign className="h-3.5 w-3.5" />
              <span>SaaS Business Launch & Income Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Launch Your Own Profitable Network Intelligence Business
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Why settle for Fast.com or Ookla when you can host your own branded telemetry platform?
              Generate recurring revenue with B2B white-label client embeds, monthly ISP SLA compliance subscriptions, and high-CPM telecom sponsorships.
            </p>
          </div>

          <div className="flex-shrink-0 rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4 text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
              Projected Annual Run-Rate
            </span>
            <div className="mt-1 font-mono text-3xl font-black text-white">$48,000+</div>
            <span className="text-[10px] text-slate-400">Based on 20 MSP clients @ $199/mo</span>
          </div>
        </div>
      </div>

      {/* 3 Revenue Stream Pillars */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
          <span>Three Turnkey Revenue Streams Built Into NetPulse AI</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Stream 1 */}
          <div className="rounded-2xl border border-slate-800 bg-[#090e1a]/90 p-5 hover:border-cyan-500/50 transition-all">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800 mb-3">
              <Code className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-white">1. B2B White-Label Embeds</h3>
            <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
              Sell embeddable speed test widgets to web hosting companies, local ISPs, MSPs, and coworking hubs. Charge $49 - $199/month per domain.
            </p>
            <div className="mt-3 text-[11px] font-semibold text-cyan-300">
              ✓ Customizable logos, CSS & telemetry webhooks
            </div>
          </div>

          {/* Stream 2 */}
          <div className="rounded-2xl border border-slate-800 bg-[#090e1a]/90 p-5 hover:border-purple-500/50 transition-all">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-950 text-purple-400 border border-purple-800 mb-3">
              <Shield className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-white">2. SLA Audit & Legal Dispute PDF</h3>
            <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
              Remote workers and enterprises frequently suffer ISP throttling. Charge $19/mo for automated 24/7 background tests and signed SLA compliance certificates.
            </p>
            <div className="mt-3 text-[11px] font-semibold text-purple-300">
              ✓ Cryptographic hash proof for bill discounts
            </div>
          </div>

          {/* Stream 3 */}
          <div className="rounded-2xl border border-slate-800 bg-[#090e1a]/90 p-5 hover:border-emerald-500/50 transition-all">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800 mb-3">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-white">3. Telecom & VPN Sponsorships</h3>
            <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
              Ookla earns millions showing generic banner ads. NetPulse includes native sponsor slots for affiliate VPNs, fiber ISPs, and enterprise routers.
            </p>
            <div className="mt-3 text-[11px] font-semibold text-emerald-300">
              ✓ Built-in clean sponsorship banner unit
            </div>
          </div>
        </div>
      </div>

      {/* Interactive SaaS Pricing Tiers */}
      <div>
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-white">Choose Your Subscription Tier</h2>
          <p className="text-xs text-slate-400 mt-1">
            Simulate the customer checkout experience or upgrade your administrative workspace
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Free Tier */}
          <div
            className={`rounded-2xl border p-5 flex flex-col justify-between transition-all ${
              currentTier === 'Free'
                ? 'border-cyan-500/80 bg-[#0c1424] shadow-lg shadow-cyan-950/40'
                : 'border-slate-800 bg-[#090e1a]'
            }`}
          >
            <div>
              <span className="text-xs font-mono font-bold text-slate-400 uppercase">Starter</span>
              <div className="mt-2 flex items-baseline space-x-1">
                <span className="text-3xl font-black text-white">$0</span>
                <span className="text-xs text-slate-400">/ forever</span>
              </div>
              <p className="mt-2 text-xs text-slate-400">Standard client speed testing</p>

              <div className="mt-4 space-y-2 text-xs text-slate-300 border-t border-slate-800 pt-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Unlimited speed tests</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Bufferbloat grading</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" />
                  <span>10 test history logs</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onSelectTier('Free')}
              className={`mt-6 w-full rounded-xl py-2 text-xs font-bold transition-all cursor-pointer ${
                currentTier === 'Free'
                  ? 'bg-slate-800 text-cyan-300 border border-cyan-800'
                  : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {currentTier === 'Free' ? 'Current Plan' : 'Select Free'}
            </button>
          </div>

          {/* Pro Network Admin Tier */}
          <div
            className={`relative rounded-2xl border p-5 flex flex-col justify-between transition-all ${
              currentTier === 'Pro'
                ? 'border-emerald-500/80 bg-[#0a1820] shadow-xl shadow-emerald-950/40'
                : 'border-emerald-500/40 bg-[#090e1a]'
            }`}
          >
            <div className="absolute -top-3 right-4 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-black">
              Most Popular
            </div>

            <div>
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase">Pro Admin</span>
              <div className="mt-2 flex items-baseline space-x-1">
                <span className="text-3xl font-black text-white">$19</span>
                <span className="text-xs text-slate-400">/ month</span>
              </div>
              <p className="mt-2 text-xs text-slate-400">For consultants & remote engineers</p>

              <div className="mt-4 space-y-2 text-xs text-slate-300 border-t border-slate-800 pt-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Everything in Free</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Unlimited history & CSV export</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Certified PDF SLA Audit Certificates</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>AI ISP dispute escalation scripts</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Zero advertisements</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                onSelectTier('Pro');
                setCheckoutTier('Pro Network Admin ($19/mo)');
              }}
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-2.5 text-xs font-bold text-white hover:brightness-110 transition-all cursor-pointer shadow-md shadow-emerald-950/50"
            >
              {currentTier === 'Pro' ? 'Plan Active ✓' : 'Upgrade to Pro'}
            </button>
          </div>

          {/* Enterprise / ISP Tier */}
          <div
            className={`rounded-2xl border p-5 flex flex-col justify-between transition-all ${
              currentTier === 'Enterprise'
                ? 'border-purple-500/80 bg-[#120f24] shadow-xl shadow-purple-950/40'
                : 'border-slate-800 bg-[#090e1a]'
            }`}
          >
            <div>
              <span className="text-xs font-mono font-bold text-purple-400 uppercase">Enterprise MSP</span>
              <div className="mt-2 flex items-baseline space-x-1">
                <span className="text-3xl font-black text-white">$99</span>
                <span className="text-xs text-slate-400">/ month</span>
              </div>
              <p className="mt-2 text-xs text-slate-400">For ISPs, Web Agencies & Fleets</p>

              <div className="mt-4 space-y-2 text-xs text-slate-300 border-t border-slate-800 pt-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-purple-400" />
                  <span>Everything in Pro</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-purple-400" />
                  <span>White-label embed on unlimited domains</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-purple-400" />
                  <span>Custom domain (speed.yourdomain.com)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-purple-400" />
                  <span>Webhook API for network outages</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-purple-400" />
                  <span>Dedicated multi-stream edge server</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                onSelectTier('Enterprise');
                setCheckoutTier('Enterprise MSP Suite ($99/mo)');
              }}
              className="mt-6 w-full rounded-xl bg-purple-600 py-2.5 text-xs font-bold text-white hover:bg-purple-500 transition-all cursor-pointer shadow-md shadow-purple-950/50"
            >
              {currentTier === 'Enterprise' ? 'Plan Active ✓' : 'Deploy Enterprise'}
            </button>
          </div>
        </div>
      </div>

      {/* White-Label Embed Generator */}
      <div className="rounded-2xl border border-slate-800 bg-[#090e1a]/95 p-6 backdrop-blur-md">
        <div className="flex items-center space-x-2 pb-4 border-b border-slate-800">
          <Code className="h-5 w-5 text-cyan-400" />
          <h2 className="text-base font-bold text-white">White-Label Embed Widget Generator</h2>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">Company / Brand Name</label>
            <input
              type="text"
              value={embedCompany}
              onChange={(e) => setEmbedCompany(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-[#0d1424] px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">Primary Accent Color</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={embedColor}
                onChange={(e) => setEmbedColor(e.target.value)}
                className="h-8 w-10 rounded border border-slate-700 bg-transparent cursor-pointer"
              />
              <input
                type="text"
                value={embedColor}
                onChange={(e) => setEmbedColor(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-[#0d1424] px-3 py-2 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">Theme</label>
            <select
              value={embedTheme}
              onChange={(e) => setEmbedTheme(e.target.value as 'dark' | 'light')}
              className="w-full rounded-xl border border-slate-700 bg-[#0d1424] px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
            >
              <option value="dark">Enterprise Dark Mode</option>
              <option value="light">Clean Light Mode</option>
            </select>
          </div>
        </div>

        {/* Snippet Output */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span>Copy this embed snippet into any client website:</span>
            <button
              onClick={handleCopyEmbed}
              className="flex items-center space-x-1 font-bold text-cyan-400 hover:text-cyan-300 cursor-pointer"
            >
              {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedCode ? 'Copied Snippet!' : 'Copy Code'}</span>
            </button>
          </div>
          <pre className="overflow-x-auto rounded-xl bg-[#060a14] p-3 font-mono text-[11px] text-cyan-300 border border-slate-800">
            {embedCodeSnippet}
          </pre>
        </div>
      </div>

      {/* Simulated Checkout Success Toast / Modal */}
      {checkoutTier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-emerald-500/50 bg-[#0b1424] p-6 text-center shadow-2xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 mb-3">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Plan Upgraded Successfully</h3>
            <p className="mt-2 text-xs text-slate-300">
              You are now operating on the <strong>{checkoutTier}</strong> tier. White-label reports, certified SLA export, and priority multi-stream workers have been unlocked.
            </p>
            <button
              onClick={() => setCheckoutTier(null)}
              className="mt-5 w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 cursor-pointer"
            >
              Return to Telemetry Console
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
