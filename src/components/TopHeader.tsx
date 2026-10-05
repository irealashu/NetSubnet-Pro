import React, { useState, useEffect } from 'react';
import { ActiveTab, ALL_TOOLS } from './Sidebar';
import {
  Menu,
  Moon,
  Sun,
  Search,
  Command,
  ChevronRight,
  ShieldCheck,
  Zap,
  ExternalLink,
  Sparkles,
  Network
} from 'lucide-react';

interface TopHeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  setIsMobileOpen: (val: boolean | ((prev: boolean) => boolean)) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeTab,
  setActiveTab,
  darkMode,
  setDarkMode,
  setIsMobileOpen
}) => {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState('');

  const currentTool = ALL_TOOLS.find(t => t.id === activeTab) || ALL_TOOLS[0];
  const Icon = currentTool.icon;

  // Keyboard shortcut Cmd+K or / to open command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchModalOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsSearchModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const searchResults = ALL_TOOLS.filter(t => {
    if (!paletteQuery.trim()) return true;
    const q = paletteQuery.toLowerCase();
    return t.label.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
  });

  return (
    <>
      <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Site Branding & Active Tool Breadcrumb */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <button
            onClick={() => setIsMobileOpen(prev => !prev)}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
            aria-label="Open mobile navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Primary Site Branding - Always shown on all pages */}
          <div
            onClick={() => setActiveTab('ipv4')}
            className="flex items-center space-x-2.5 cursor-pointer select-none group"
            title="Netvok Tools - Home"
          >
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0 group-hover:scale-105 transition-transform">
              <Network className="h-5 w-5" />
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="font-black text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">
                Netvok
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                Tools
              </span>
            </div>
          </div>

          {/* Vertical divider */}
          <div className="hidden sm:block h-5 w-px bg-slate-200 dark:border-slate-800" />

          {/* Breadcrumb path */}
          <div className="hidden md:flex items-center space-x-2 text-xs sm:text-sm">
            <span className="text-slate-400 dark:text-slate-500 font-medium">
              {currentTool.category}
            </span>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600" />
            <div className="flex items-center space-x-1.5">
              <div className="p-1 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                <Icon className="h-3.5 w-3.5" />
              </div>
              <span className="font-bold text-slate-700 dark:text-slate-200 text-xs">
                {currentTool.label}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Quick Search Button, System Indicator & Dark Mode Switch */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Quick Command Palette search trigger */}
          <button
            onClick={() => setIsSearchModalOpen(true)}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Jump to tool...</span>
            <kbd className="hidden md:inline font-mono text-[10px] px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-400">
              ⌘K
            </kbd>
          </button>

          {/* Theme switch */}
          <button
            onClick={() => setDarkMode(prev => !prev)}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
          </button>
        </div>
      </header>

      {/* Global Command Palette Modal */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
          <div
            onClick={() => setIsSearchModalOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
          />

          <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center px-4 border-b border-slate-200 dark:border-slate-800">
              <Search className="h-4 w-4 text-slate-400 shrink-0 mr-3" />
              <input
                type="text"
                autoFocus
                value={paletteQuery}
                onChange={(e) => setPaletteQuery(e.target.value)}
                placeholder="Type a tool name or category (e.g. IPv6, BGP, PCAP, DMARC)..."
                className="w-full py-3.5 text-sm bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
              />
              <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400">
                ESC
              </kbd>
            </div>

            <div className="max-h-80 overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-800/60">
              {searchResults.length > 0 ? (
                searchResults.map((tool) => {
                  const ToolIcon = tool.icon;
                  const isSelected = tool.id === activeTab;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => {
                        setActiveTab(tool.id);
                        setIsSearchModalOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-colors ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center space-x-3 truncate">
                        <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          <ToolIcon className="h-4 w-4" />
                        </div>
                        <div className="truncate">
                          <div className="font-semibold text-xs text-slate-900 dark:text-white">{tool.label}</div>
                          <div className="text-[11px] text-slate-500 truncate">{tool.desc}</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0">
                        {tool.category}
                      </span>
                    </button>
                  );
                })
              ) : (
                <div className="p-6 text-center text-xs text-slate-400">
                  No tools found matching "{paletteQuery}"
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
