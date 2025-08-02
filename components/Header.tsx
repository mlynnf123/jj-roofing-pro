
import React from 'react';
import Image from 'next/image';
import { PlusIcon } from './icons/PlusIcon';

type CurrentPage = 'kanban' | 'calendar' | 'leads-list';

interface HeaderProps {
  onSearch: (term: string) => void;
  onAddLead: () => void;
  currentPage: CurrentPage;
  onNavigate: (page: CurrentPage) => void;
  isCalendarEnabled: boolean;
}

const Header: React.FC<HeaderProps> = ({ onSearch, onAddLead, currentPage, onNavigate, isCalendarEnabled }) => {
  
  return (
    <header className="bg-slate-800 text-white p-4 shadow-md">
      <div className="flex items-center justify-between mb-4 lg:mb-0 gap-4">
        <div className="flex items-center gap-4 flex-shrink-0">
          <Image 
            src="/Austin, TX.png" 
            alt="JJ Roofing Logo" 
            width={60} 
            height={60}
            className="object-contain"
          />
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight">JJ Roofing Pros</h1>
        </div>
        <button
          onClick={onAddLead}
          className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-3 lg:px-4 rounded-md shadow-sm transition-colors duration-150 flex-shrink-0"
          aria-label="Add new lead"
        >
          <PlusIcon className="w-4 h-4 lg:w-5 lg:h-5 mr-1 lg:mr-2" />
          <span className="hidden sm:inline">Add Lead</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>
      
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-4">
        <nav className="flex items-center gap-1 lg:gap-2 overflow-x-auto">
          <button
            onClick={() => onNavigate('kanban')}
            className={`px-2 lg:px-3 py-1 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${currentPage === 'kanban' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
          >
            Board
          </button>
          <button
            onClick={() => onNavigate('leads-list')}
            className={`px-2 lg:px-3 py-1 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${currentPage === 'leads-list' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
          >
            List
          </button>
          {isCalendarEnabled && (
            <button
              onClick={() => onNavigate('calendar')}
              className={`px-2 lg:px-3 py-1 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${currentPage === 'calendar' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
            >
              Calendar
            </button>
          )}
        </nav>
        
        <div className="flex-1 lg:flex-initial lg:min-w-0">
          <input
            type="search"
            placeholder="Search leads..."
            className="w-full lg:w-64 px-3 py-2 rounded-md bg-slate-700 text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow"
            onChange={(e) => onSearch(e.target.value)}
            aria-label="Search leads"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
