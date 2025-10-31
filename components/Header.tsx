import React from 'react';
import { Sparkles } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-10 border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-16">
          <Sparkles className="h-6 w-6 text-indigo-500 mr-3" />
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 font-heading">
            VisionCraft Studio
          </h1>
        </div>
      </div>
    </header>
  );
};

export default Header;