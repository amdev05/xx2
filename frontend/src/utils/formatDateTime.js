export function formatDateTime(date, start_time) {
  try {
    // Handle if date is already a Date object
    let dateObj;
    if (date instanceof Date) {
      dateObj = date;
    } else {
      dateObj = new Date(date);
    }

    // Extract time from start_time (could be full datetime or just time)
    let hours, minutes;
    if (start_time) {
      const timeDate = new Date(start_time);
      if (!isNaN(timeDate.getTime())) {
        hours = timeDate.getHours();
        minutes = timeDate.getMinutes();
      } else {
        // Try parsing as HH:MM format
        const timeParts = start_time.split(":");
        hours = parseInt(timeParts[0]) || 0;
        minutes = parseInt(timeParts[1]) || 0;
      }
    } else {
      hours = dateObj.getHours();
      minutes = dateObj.getMinutes();
    }

    // Combine date and time
    const combinedDate = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), hours, minutes);

    if (isNaN(combinedDate.getTime())) {
      return "Invalid Date";
    }

    const datePart = combinedDate.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const timePart = combinedDate.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    return `${datePart}, ${timePart}`;
  } catch (error) {
    console.error("Error formatting date:", error, { date, start_time });
    return "Invalid Date";
  }
}
