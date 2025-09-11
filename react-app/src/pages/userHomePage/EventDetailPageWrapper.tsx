import React from 'react';
import { EventDetailProvider } from '../../shared/context/EventDetailContext';
import EventDetailPage from './EventDetailPage';

const EventDetailPageWrapper: React.FC = () => {
  return (
    <EventDetailProvider>
      <EventDetailPage />
    </EventDetailProvider>
  );
};

export default EventDetailPageWrapper;
