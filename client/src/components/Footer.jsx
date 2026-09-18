import React from 'react';
import { Compass, Globe, DollarSign } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-white dark:bg-[#0B0F19] border-t border-slate-200/80 dark:border-slate-800/80 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand to-rose-500 flex items-center justify-center text-white shadow-glow">
                <Compass className="w-5 h-5" />
              </div>
              <span className="font-display font-black text-xl bg-gradient-to-r from-brand to-rose-600 bg-clip-text text-transparent">
                LuxNest
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Curating exceptional vacation rentals, luxury villas, architectural icons, and unique escapes worldwide.
            </p>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Support & Help
            </h4>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <li><a href="#" className="hover:text-brand transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-brand transition-colors">AirCover Protection</a></li>
              <li><a href="#" className="hover:text-brand transition-colors">Anti-discrimination</a></li>
              <li><a href="#" className="hover:text-brand transition-colors">Disability support</a></li>
              <li><a href="#" className="hover:text-brand transition-colors">Cancellation options</a></li>
            </ul>
          </div>

          {/* Hosting */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Hosting
            </h4>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <li><a href="#" className="hover:text-brand transition-colors">Host your home</a></li>
              <li><a href="#" className="hover:text-brand transition-colors">AirCover for Hosts</a></li>
              <li><a href="#" className="hover:text-brand transition-colors">Hosting resources</a></li>
              <li><a href="#" className="hover:text-brand transition-colors">Community forum</a></li>
              <li><a href="#" className="hover:text-brand transition-colors">Hosting responsibly</a></li>
            </ul>
          </div>

          {/* LuxNest */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              LuxNest
            </h4>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <li><a href="#" className="hover:text-brand transition-colors">Newsroom</a></li>
              <li><a href="#" className="hover:text-brand transition-colors">New features</a></li>
              <li><a href="#" className="hover:text-brand transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-brand transition-colors">Investors</a></li>
              <li><a href="#" className="hover:text-brand transition-colors">Gift cards</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex flex-wrap items-center gap-3">
            <span>© {new Date().getFullYear()} LuxNest, Inc.</span>
            <span>•</span>
            <a href="#" className="hover:underline">Privacy</a>
            <span>•</span>
            <a href="#" className="hover:underline">Terms</a>
            <span>•</span>
            <a href="#" className="hover:underline">Sitemap</a>
          </div>

          <div className="flex items-center gap-6 font-semibold text-slate-700 dark:text-slate-300">
            <div className="flex items-center gap-1.5 cursor-pointer hover:text-brand">
              <Globe className="w-4 h-4" />
              <span>English (US)</span>
            </div>
            <div className="flex items-center gap-1.5 cursor-pointer hover:text-brand">
              <DollarSign className="w-4 h-4" />
              <span>USD</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
