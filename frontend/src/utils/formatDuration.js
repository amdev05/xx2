export function formatDuration(totalMinutes) {
  if (!totalMinutes && totalMinutes !== 0) return "";

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0 && minutes > 0) return `${hours}j ${minutes}m`;
  if (hours > 0) return `${hours}j`;
  return `${minutes}m`;
}
