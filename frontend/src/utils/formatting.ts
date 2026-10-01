export function formatCoordinates(lat: number, lon: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lonDir = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lon).toFixed(4)}° ${lonDir}`;
}

export function formatElevation(meters?: number): string {
  if (meters === undefined || meters === null) return 'Elev: N/A';
  return `${meters} m ASL`;
}

export function formatNumberWithCommas(num: number): string {
  return num.toLocaleString('en-IN');
}
