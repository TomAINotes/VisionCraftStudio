import React from 'react';

interface TabButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
}

const TabButton: React.FC<TabButtonProps> = ({ label, isActive, onClick, icon }) => {
  const baseClasses = "flex items-center space-x-2 px-1 pb-3 md:px-4 text-base font-semibold font-heading border-b-2 transition-colors duration-300";
  const activeClasses = "text-indigo-600 border-indigo-600";
  const inactiveClasses = "text-gray-400 border-transparent hover:text-indigo-500 hover:border-indigo-300";

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

export default TabButton;