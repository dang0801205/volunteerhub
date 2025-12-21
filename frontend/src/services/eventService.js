/** @format */

export const getEventStatus = (event) => {
  const now = new Date();
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);

  if (now < startDate) return "upcoming";
  if (now > endDate) return "past";
  return "ongoing";
};

export const isEventFull = (event) => {
  return event.currentParticipants >= event.maxParticipants;
};

export const getEventCapacityPercentage = (event) => {
  if (!event.maxParticipants) return 0;
  return Math.round((event.currentParticipants / event.maxParticipants) * 100);
};

export const filterEvents = (events, filters) => {
  const {
    search = "",
    category = "Tất cả",
    status = "all",
    timeFilter = "all",
    selectedDate = "",
  } = filters;

  return events.filter((event) => {
    const matchesSearch =
      !search ||
      event.title?.toLowerCase().includes(search.toLowerCase()) ||
      event.description?.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      category === "Tất cả" || event.category === category;

    const matchesStatus = status === "all" || event.status === status;

    const now = new Date();
    const eventStart = new Date(
      event.startDate || `${event.date}T${event.startTime}`
    );
    const eventEnd = new Date(
      event.endDate || `${event.date}T${event.endTime}`
    );

    const matchesTime =
      timeFilter === "all" ||
      (timeFilter === "upcoming" && eventStart > now) ||
      (timeFilter === "ongoing" && eventStart <= now && eventEnd >= now) ||
      (timeFilter === "past" && eventEnd < now);

    const matchesDate =
      !selectedDate ||
      event.date === selectedDate ||
      event.startDate?.startsWith(selectedDate);

    return (
      matchesSearch &&
      matchesCategory &&
      matchesStatus &&
      matchesTime &&
      matchesDate
    );
  });
};

export const sortEvents = (events, sortBy = "date", order = "asc") => {
  const sorted = [...events].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "date":
        comparison = new Date(a.startDate) - new Date(b.startDate);
        break;
      case "participants":
        comparison =
          (a.currentParticipants || 0) - (b.currentParticipants || 0);
        break;
      case "title":
        comparison = (a.title || "").localeCompare(b.title || "");
        break;
      default:
        comparison = 0;
    }

    return order === "asc" ? comparison : -comparison;
  });

  return sorted;
};
