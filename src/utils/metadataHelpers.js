export const highlightKeys = ['comment', 'description', 'author', 'subject', 'gps', 'latitude', 'longitude', 'keywords'];

export function flattenMetadata(value, prefix = '', rows = []) {
  if (value == null) {
    return rows;
  }

  if (value instanceof Date) {
    rows.push({ key: prefix || 'value', value: value.toISOString() });
    return rows;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      rows.push({ key: prefix || 'value', value: '[]' });
      return rows;
    }

    value.forEach((item, index) => {
      const nextPrefix = prefix ? `${prefix}[${index}]` : `[${index}]`;
      flattenMetadata(item, nextPrefix, rows);
    });
    return rows;
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value);
    if (entries.length === 0) {
      rows.push({ key: prefix || 'value', value: '{}' });
      return rows;
    }

    entries.forEach(([key, nestedValue]) => {
      const nextPrefix = prefix ? `${prefix}.${key}` : key;
      flattenMetadata(nestedValue, nextPrefix, rows);
    });
    return rows;
  }

  rows.push({ key: prefix || 'value', value: String(value) });
  return rows;
}

export function formatValue(value) {
  if (value == null) return '—';
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'number' && Number.isFinite(value)) return Number(value.toFixed(6)).toString();
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (Array.isArray(value)) return value.map(formatValue).join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export function isSuspiciousKey(key) {
  const normalized = key.toLowerCase();
  return highlightKeys.some((needle) => normalized.includes(needle));
}

export function extractCoordinates(metadata) {
  const lat = metadata.GPSLatitude ?? metadata.latitude ?? metadata.gpsLatitude;
  const lng = metadata.GPSLongitude ?? metadata.longitude ?? metadata.gpsLongitude;

  if (typeof lat === 'number' && typeof lng === 'number') {
    return { lat, lng };
  }

  if (Array.isArray(lat) && Array.isArray(lng) && lat.length && lng.length) {
    return {
      lat: Number(formatValue(lat[0])),
      lng: Number(formatValue(lng[0])),
    };
  }

  return null;
}
