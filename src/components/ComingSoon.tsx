import React from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface ComingSoonProps {
  title: string;
}

const ComingSoon: React.FC<ComingSoonProps> = ({ title }) => {
  return (
    <div className="flex-1 flex items-center justify-center p-6 lg:p-10 bg-brand-bg/50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6 max-w-md"
      >
        <div className="inline-flex p-4 rounded-3xl bg-brand-accent/10 border border-brand-accent/20">
          <Sparkles className="w-10 h-10 text-brand-accent animate-pulse" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-white tracking-tight">
            {title}
          </h1>
          <p className="text-brand-accent font-serif italic text-xl">Coming Soon</p>
        </div>
        <p className="text-gray-400 text-lg leading-relaxed">
          We're working hard to bring you the most powerful Instagram analytics tools. Stay tuned for updates!
        </p>
        <div className="pt-4">
          <div className="h-1 w-24 bg-brand-accent mx-auto rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
        </div>
      </motion.div>
    </div>
  );
};

export default ComingSoon;
