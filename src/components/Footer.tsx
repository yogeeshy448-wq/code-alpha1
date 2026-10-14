import React from 'react';

interface FooterProps {
  onSelectCategory: (category: string) => void;
  onOpenOrders: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectCategory, onOpenOrders }) => {
  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-3">
            <h3 className="text-xl font-serif font-bold text-white tracking-tight">
              Kōbō Store
            </h3>
            <p className="text-stone-400 leading-relaxed text-xs">
              An independent studio workshop dedicated to archival-grade furniture, studio acoustic systems, and contemplative apothecary goods.
            </p>
          </div>

          {/* Catalog Categories */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-stone-200 mb-3 font-semibold">
              Collections
            </h4>
            <ul className="space-y-2 text-stone-400">
              <li>
                <button
                  onClick={() => onSelectCategory('Furniture')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Architectural Furniture
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('Audio & Studio')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Studio Audio & Acoustics
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('Apothecary')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Botanical Fragrances
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('Apparel & Objects')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Selvedge Canvas & Goods
                </button>
              </li>
            </ul>
          </div>

          {/* Client Services */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-stone-200 mb-3 font-semibold">
              Client Care
            </h4>
            <ul className="space-y-2 text-stone-400">
              <li>
                <button
                  onClick={onOpenOrders}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Track Shipments & Orders
                </button>
              </li>
              <li>
                <span className="text-stone-400">Insured Worldwide Courier</span>
              </li>
              <li>
                <span className="text-stone-400">30-Day Studio Trial</span>
              </li>
              <li>
                <span className="text-stone-400">Material Care Guides</span>
              </li>
            </ul>
          </div>

          {/* Studio Workshop Locations */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-stone-200 mb-3 font-semibold">
              Studio & Workshop
            </h4>
            <p className="text-stone-400 leading-relaxed">
              Main Workshop: Higashiyama Ward, Kyoto<br />
              Design Studio: Ballard Maritime District, Seattle<br />
              Client Concierge: concierge@kobo-store.internal
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-500">
          <p>© {new Date().getFullYear()} Kōbō Store Co. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Fair Labor Standard</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
