import React from 'react';
import { CalendarListEntry } from '../types';
import Loader from './Loader'; // Assuming you have a Loader component

interface CalendarPageProps {
  gapiReady: boolean;
  isSignedIn: boolean;
  onSignIn: () => void;
  onSignOut: () => void;
  calendars: CalendarListEntry[];
  error: string | null;
}

const CalendarPage: React.FC<CalendarPageProps> = ({
  gapiReady,
  isSignedIn,
  onSignIn,
  onSignOut,
  calendars,
  error,
}) => {
  return (
    <div className="p-6 bg-white shadow-lg rounded-lg m-4 flex-grow">
      <h2 className="text-2xl font-semibold text-slate-800 mb-6">Google Calendar Integration</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {!gapiReady && !error && (
        <div className="flex items-center justify-center text-slate-600">
          <Loader size="md" color="text-indigo-600" />
          <span className="ml-3">Initializing Google Calendar API...</span>
        </div>
      )}

      {gapiReady && !isSignedIn && (
        <div className="text-center">
          <p className="mb-4 text-slate-700">Connect your Google Calendar to view and manage events.</p>
          <button
            onClick={onSignIn}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-md shadow-sm transition-colors duration-150 flex items-center justify-center mx-auto"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.19,4.73C14.03,4.73 15.69,5.36 16.95,6.58L19.35,4.19C17.22,2.38 14.86,1.5 12.19,1.5C7,1.5 3,5.58 3,12C3,18.42 7,22.5 12.19,22.5C17.6,22.5 21.7,18.35 21.7,12.33C21.7,11.77 21.57,11.43 21.35,11.1Z"></path></svg>
            Sign in with Google
          </button>
        </div>
      )}

      {gapiReady && isSignedIn && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <p className="text-green-600 font-medium">Successfully connected to Google Calendar.</p>
            <button
              onClick={onSignOut}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md shadow-sm transition-colors duration-150"
            >
              Disconnect
            </button>
          </div>

          <h3 className="text-xl font-medium text-slate-700 mb-3">Your Calendars:</h3>
          {calendars.length > 0 ? (
            <ul className="space-y-2 border border-slate-200 rounded-md p-3 max-h-96 overflow-y-auto custom-scrollbar">
              {calendars.map(calendar => (
                <li key={calendar.id} className="p-3 bg-slate-50 rounded shadow-sm hover:bg-slate-100 transition-colors">
                  <p className="font-semibold text-slate-800">{calendar.summary}</p>
                  {calendar.description && <p className="text-sm text-slate-600">{calendar.description}</p>}
                  <p className="text-xs text-slate-500">ID: {calendar.id}</p>
                   {calendar.primary && <span className="text-xs text-indigo-600 font-semibold">(Primary)</span>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500 italic">No calendars found, or still loading...</p>
          )}
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
