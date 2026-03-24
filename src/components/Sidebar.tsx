import React from 'react';
import { 
  Compass,
  LayoutDashboard, 
  Rss, 
  Library, 
  Users, 
  Video, 
  Settings, 
  LogOut,
  Zap,
  X,
  CreditCard,
  User as UserIcon,
  Shield,
  Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: User;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, user, onLogout }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'videos', label: 'Discovery', icon: Compass },
    { id: 'discovery', label: 'Feed', icon: Rss },
    { id: 'library', label: 'Library', icon: Library },
    { id: 'channels', label: 'Channels', icon: Users },
  ];

  return (
    <>
      <motion.div 
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        initial={false}
        animate={{ width: isExpanded ? 260 : 80 }}
        className="h-screen bg-brand-surface border-r border-brand-border flex flex-col py-8 fixed left-0 top-0 z-50 shadow-[20px_0_50px_rgba(0,0,0,0.5)] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]"
      >
        <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar">
          {/* Logo Section */}
          <div className="flex flex-col gap-10 w-full px-5 mb-10">
            <div className="flex items-center gap-4 h-12">
              <div className="w-10 h-10 bg-brand-accent rounded-xl flex items-center justify-center shadow-lg shadow-brand-accent/20 flex-shrink-0 relative group">
                <div className="absolute inset-0 bg-brand-accent blur-md opacity-20 group-hover:opacity-40 transition-opacity" />
                <Zap className="text-white w-5 h-5 fill-current relative z-10" />
              </div>
              <AnimatePresence>
                {isExpanded && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="flex flex-col"
                  >
                    <span className="text-xl font-serif italic font-bold text-white whitespace-nowrap tracking-tight">
                      InstaCore
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-brand-accent font-bold -mt-1">
                      Analytics
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-1.5 w-full">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative w-full h-11 flex items-center rounded-lg transition-all duration-300 group px-3.5 ${
                    activeTab === item.id || (activeTab === 'analysis' && item.id === 'library')
                      ? 'bg-white/5 text-white' 
                      : 'text-zinc-500 hover:bg-white/[0.03] hover:text-zinc-300'
                  }`}
                >
                  <item.icon className={`w-5 h-5 flex-shrink-0 transition-colors duration-300 ${activeTab === item.id || (activeTab === 'analysis' && item.id === 'library') ? 'text-brand-accent' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
                  
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.span 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className={`ml-4 text-sm font-medium whitespace-nowrap transition-colors duration-300 ${activeTab === item.id ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'}`}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {(activeTab === item.id || (activeTab === 'analysis' && item.id === 'library')) && (
                    <motion.div 
                      layoutId="active-indicator"
                      className="absolute left-0 w-1 h-5 bg-brand-accent rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                    />
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Bottom Section */}
          <div className="mt-auto flex flex-col gap-2 w-full px-4 pb-4">
            <div className="h-px bg-brand-border w-full mb-2 opacity-50" />
            
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="w-full h-10 flex items-center rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03] transition-all duration-300 px-3 group"
            >
              <Settings className="w-5 h-5 flex-shrink-0" />
              <AnimatePresence>
                {isExpanded && (
                  <motion.span 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="ml-3 text-sm font-medium whitespace-nowrap"
                  >
                    Settings
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {/* Profile Section */}
            <div className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.02] border border-white/[0.05] transition-all duration-300 min-h-[48px]">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-accent to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-inner">
                {user.name[0]}
              </div>
              <AnimatePresence>
                {isExpanded && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="flex flex-col min-w-0"
                  >
                    <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                    <p className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold">{user.plan} Active</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Logout Button */}
            <button 
              onClick={onLogout}
              className="w-full h-10 flex items-center rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/5 transition-all duration-300 px-3 group"
            >
              <LogOut className="w-5 h-5 flex-shrink-0 transition-colors group-hover:text-red-400" />
              <AnimatePresence>
                {isExpanded && (
                  <motion.span 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="ml-3 text-sm font-medium whitespace-nowrap"
                  >
                    Sign Out
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-accent/10 flex items-center justify-center">
                    <Settings className="w-5 h-5 text-brand-accent" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Settings</h2>
                    <p className="text-xs text-zinc-500">Manage your account and preferences</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Sidebar Tabs */}
                  <div className="flex flex-col gap-1">
                    <button className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-brand-accent/10 text-brand-accent text-sm font-bold">
                      <UserIcon className="w-4 h-4" />
                      Account
                    </button>
                    <button className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 text-sm font-bold transition-all">
                      <CreditCard className="w-4 h-4" />
                      Subscription
                    </button>
                    <button className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 text-sm font-bold transition-all">
                      <Bell className="w-4 h-4" />
                      Notifications
                    </button>
                    <button className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 text-sm font-bold transition-all">
                      <Shield className="w-4 h-4" />
                      Security
                    </button>
                  </div>

                  {/* Main Panel */}
                  <div className="md:col-span-2 flex flex-col gap-8">
                    {/* Profile Section */}
                    <section>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Profile Details</h3>
                      <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-accent to-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                            {user.name[0]}
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-white">{user.name}</h4>
                            <p className="text-sm text-zinc-500">{user.email}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-zinc-500 uppercase font-bold">Full Name</span>
                            <span className="text-sm text-zinc-300">{user.name}</span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-zinc-500 uppercase font-bold">Email Address</span>
                            <span className="text-sm text-zinc-300">{user.email}</span>
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Subscription Section */}
                    <section>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Subscription Plan</h3>
                      <div className="bg-brand-accent/5 border border-brand-accent/20 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-brand-accent flex items-center justify-center">
                              <Zap className="w-5 h-5 text-white fill-current" />
                            </div>
                            <div>
                              <h4 className="text-base font-bold text-white">{user.plan} Plan</h4>
                              <p className="text-xs text-brand-accent font-bold">Active Subscription</p>
                            </div>
                          </div>
                          <span className="px-3 py-1 rounded-full bg-brand-accent text-white text-[10px] font-black uppercase tracking-widest">
                            Current
                          </span>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-zinc-400">Videos Analyzed</span>
                            <span className="text-white font-bold">{user.usage.videosAnalyzed} / {user.usage.limit}</span>
                          </div>
                          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${(user.usage.videosAnalyzed / user.usage.limit) * 100}%` }}
                              className="h-full bg-brand-accent"
                            />
                          </div>
                          <p className="text-[11px] text-zinc-500 italic">
                            Your plan resets on the 1st of next month.
                          </p>
                        </div>

                        <button className="w-full mt-6 py-2.5 rounded-lg bg-white text-black font-bold text-sm hover:bg-zinc-200 transition-all">
                          Manage Subscription
                        </button>
                      </div>
                    </section>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-white/10 bg-white/[0.01] flex justify-end">
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-6 py-2 rounded-lg bg-white/5 text-white font-bold text-sm hover:bg-white/10 transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
