export function formatCoordinates(lat?: number | null, lon?: number | null): string {
  if (lat == null || lon == null || isNaN(lat) || isNaN(lon)) {
    return 'Coordinates: N/A';
  }
  const latDir = lat >= 0 ? 'N' : 'S';
  const lonDir = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lon).toFixed(4)}° ${lonDir}`;
}

export function formatElevation(meters?: number | null): string {
  if (meters === undefined || meters === null || isNaN(meters)) return 'Elev: N/A';
  return `${meters} m ASL`;
}

export function formatNumberWithCommas(num: number): string {
  return num.toLocaleString('en-IN');
}
