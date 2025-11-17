export interface Event {
  nombre: string;
  fecha_inicio: string | Date;
}

export const getEventsForDate = (date: Date, events: Event[]) => {
  return events.filter((event) => {
    const eventDate = new Date(event.fecha_inicio);
    return eventDate.toDateString() === date.toDateString();
  });
};
