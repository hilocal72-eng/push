
import React from 'react';
import { HistoryItem } from '../types';

interface HistoryListProps {
  history: HistoryItem[];
  onClear: () => void;
}

const HistoryList: React.FC<HistoryListProps> = ({ history, onClear }) => {
  if (history.length === 0) return null;

  return (
    <div className="mt-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Recent Notifications</h3>
        <button 
          onClick={onClear}
          className="text-sm text-red-500 hover:text-red-600 font-medium transition-colors"
        >
          Clear History
        </button>
      </div>
      <div className="space-y-3">
        {history.map((item) => (
          <div key={item.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex items-start space-x-3">
            <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${item.type === 'local' ? 'bg-blue-500' : 'bg-purple-500'}`} />
            <div>
              <p className="text-sm font-bold text-gray-900">{item.title}</p>
              <p className="text-xs text-gray-600 line-clamp-1">{item.body}</p>
              <p className="text-[10px] text-gray-400 mt-1">
                {item.timestamp.toLocaleTimeString()} • {item.type}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryList;
