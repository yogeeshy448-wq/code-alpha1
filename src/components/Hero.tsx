import React from 'react';
import { ArrowDown, ShieldCheck, Truck, Sparkles } from 'lucide-react';

interface HeroProps {
  onExploreClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreClick }) => {
  return (
    <section className="relative border-b border-stone-200/80 bg-stone-100/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Editorial Brand & Action */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="text-xs font-mono uppercase tracking-wider text-stone-500 mb-3">
              Autumn · Winter 2026 Collection
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-5.5xl font-serif font-bold text-stone-900 tracking-tight leading-[1.12] mb-5 [text-wrap:balance]">
              Objects shaped for focused daily living.
            </h1>
            
            <p className="text-stone-600 text-base leading-relaxed mb-8 max-w-xl">
              An intentional archive of artisanal furniture, studio audio, botanical fragrances, and heavy canvas goods made to endure generations.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={onExploreClick}
                className="px-6 py-3.5 bg-stone-900 hover:bg-stone-800 text-white text-sm font-semibold rounded-lg shadow-sm transition-all duration-200 flex items-center gap-2 cursor-pointer"
              >
                <span>Explore Catalog</span>
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Column: Hero High-Fidelity Asset */}
          <div className="lg:col-span-7">
            <div className="relative aspect-16/9 rounded-2xl overflow-hidden bg-stone-200 shadow-sm border border-stone-200/60 group">
              <img
                src="/src/assets/images/hero_artisanal_goods_1791970822476.jpg"
                alt="Studio interior showcasing artisanal furniture and ceramics"
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/40 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-stone-100 font-medium drop-shadow-sm">
                <span>The Kyoto Studio Collection</span>
                <span className="font-mono">Handmade in small editions</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3-column Trust Hallmarks row */}
        <div className="mt-12 pt-8 border-t border-stone-200/80 grid grid-cols-1 md:grid-cols-3 gap-6 text-stone-600 text-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-stone-200/70 rounded-lg text-stone-800 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-stone-900 mb-0.5">Natural Authentic Materials</p>
              <p className="leading-normal">Solid white oak, Kurashiki selvedge canvas, and raw botanical essences.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-stone-200/70 rounded-lg text-stone-800 shrink-0">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-stone-900 mb-0.5">Complimentary Delivery</p>
              <p className="leading-normal">Free insured dispatch on all orders over $150 with tracked courier updates.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-stone-200/70 rounded-lg text-stone-800 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-stone-900 mb-0.5">Studio Warranty & Returns</p>
              <p className="leading-normal">30-day effortless in-studio trial and lifetime craftsmanship guarantee.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
