/** @format */

// Export user data utilities
export const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) {
    alert('Không có dữ liệu để xuất');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape commas and quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
};

export const exportToJSON = (data, filename) => {
  if (!data) {
    alert('Không có dữ liệu để xuất');
    return;
  }

  const jsonContent = JSON.stringify(data, null, 2);
  downloadFile(jsonContent, filename, 'application/json');
};

const downloadFile = (content, filename, type) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Export user profile data
export const exportUserProfile = (user, registrations, attendances) => {
  const profileData = {
    userInfo: {
      userName: user.userName,
      email: user.userEmail,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
    },
    personalInfo: user.personalInformation || {},
    statistics: {
      eventsCompleted: user.eventsCompleted || 0,
      totalHours: user.totalHours || 0,
      interactions: user.interactions || 0,
      reactionsReceived: user.reactionsReceived || 0,
      attendanceRate: user.attendanceRate || 0,
      earlyCheckins: user.earlyCheckins || 0,
    },
    registrations: registrations || [],
    attendances: attendances || [],
  };

  return profileData;
};

// Export event to Google Calendar format
export const exportToGoogleCalendar = (event) => {
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);

  // Format dates for Google Calendar
  const formatDate = (date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
    details: event.description || '',
    location: event.location || '',
  });

  const url = `https://calendar.google.com/calendar/render?${params.toString()}`;
  window.open(url, '_blank');
};

// Export event to iCal format (for Apple Calendar, Outlook)
export const exportToICal = (event) => {
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);

  const formatDate = (date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const icalContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//VolunteerHub//Event//EN',
    'BEGIN:VEVENT',
    `UID:${event._id}@volunteerhub.org`,
    `DTSTAMP:${formatDate(new Date())}`,
    `DTSTART:${formatDate(startDate)}`,
    `DTEND:${formatDate(endDate)}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${(event.description || '').replace(/\n/g, '\\n')}`,
    `LOCATION:${event.location || ''}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  downloadFile(icalContent, `${event.title}.ics`, 'text/calendar');
};
