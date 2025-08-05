import React, { useState, useEffect } from 'react';
import { CalendarListEntry } from '../types';
import Loader from './Loader';
import CustomCalendar from './CustomCalendar';
import CreateEventModal from './CreateEventModal';

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  location?: string;
  color?: string;
  calendarId: string;
}

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
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  // Fetch events from Google Calendar
  const fetchEvents = async () => {
    if (!isSignedIn || calendars.length === 0) return;
    
    setLoadingEvents(true);
    try {
      const allEvents: CalendarEvent[] = [];
      
      // Get events from the next 30 days
      const timeMin = new Date();
      const timeMax = new Date();
      timeMax.setDate(timeMax.getDate() + 30);
      
      // Fetch events from primary calendar
      const primaryCalendar = calendars.find(cal => cal.primary) || calendars[0];
      if (primaryCalendar) {
        const response = await (window as any).gapi.client.calendar.events.list({
          calendarId: primaryCalendar.id,
          timeMin: timeMin.toISOString(),
          timeMax: timeMax.toISOString(),
          showDeleted: false,
          singleEvents: true,
          orderBy: 'startTime'
        });
        
        const calendarEvents = response.result.items || [];
        const formattedEvents = calendarEvents.map((event: any) => ({
          id: event.id,
          title: event.summary || 'No Title',
          start: new Date(event.start.dateTime || event.start.date),
          end: new Date(event.end.dateTime || event.end.date),
          description: event.description,
          location: event.location,
          color: 'bg-indigo-100 text-indigo-800',
          calendarId: primaryCalendar.id
        }));
        
        allEvents.push(...formattedEvents);
      }
      
      setEvents(allEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoadingEvents(false);
    }
  };

  // Fetch events when signed in and calendars are loaded
  useEffect(() => {
    if (isSignedIn && calendars.length > 0) {
      fetchEvents();
    }
  }, [isSignedIn, calendars]);

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setShowCreateEvent(true);
  };

  const handleEventCreated = () => {
    fetchEvents(); // Refresh events after creating new one
  };
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

          {/* Calendar Controls */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-medium text-slate-700">Team Schedule</h3>
            <div className="flex space-x-2">
              <button
                onClick={fetchEvents}
                disabled={loadingEvents}
                className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {loadingEvents ? 'Loading...' : 'Refresh Events'}
              </button>
            </div>
          </div>

          {/* Calendar View */}
          {loadingEvents ? (
            <div className="flex items-center justify-center py-12">
              <Loader size="md" color="text-indigo-600" />
              <span className="ml-3 text-slate-600">Loading calendar events...</span>
            </div>
          ) : (
            <CustomCalendar
              events={events}
              onEventClick={handleEventClick}
              onDateClick={handleDateClick}
            />
          )}

          {/* Calendar List (Collapsible) */}
          <details className="mt-6">
            <summary className="cursor-pointer text-lg font-medium text-slate-700 hover:text-slate-900">
              Connected Calendars ({calendars.length})
            </summary>
            <div className="mt-3">
              {calendars.length > 0 ? (
                <ul className="space-y-2 border border-slate-200 rounded-md p-3 max-h-48 overflow-y-auto custom-scrollbar">
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
          </details>
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Event Details</h3>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-slate-500 hover:text-slate-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-slate-700">Title</h4>
                <p className="text-slate-600">{selectedEvent.title}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-slate-700">Date & Time</h4>
                <p className="text-slate-600">
                  {selectedEvent.start.toLocaleDateString()} at {selectedEvent.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              
              {selectedEvent.location && (
                <div>
                  <h4 className="font-medium text-slate-700">Location</h4>
                  <p className="text-slate-600">{selectedEvent.location}</p>
                </div>
              )}
              
              {selectedEvent.description && (
                <div>
                  <h4 className="font-medium text-slate-700">Description</h4>
                  <p className="text-slate-600">{selectedEvent.description}</p>
                </div>
              )}
            </div>
            
            <div className="mt-6">
              <button
                onClick={() => setSelectedEvent(null)}
                className="w-full bg-slate-600 hover:bg-slate-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={showCreateEvent}
        onClose={() => setShowCreateEvent(false)}
        selectedDate={selectedDate}
        onEventCreated={handleEventCreated}
      />
    </div>
  );
};

export default CalendarPage;
