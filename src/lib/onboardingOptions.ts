// Fixed pick-lists for onboarding / profile settings. Kept as plain data
// (not fetched from the backend) since job titles and metro areas are a
// closed, rarely-changing set for this purpose -- picking from a list
// keeps the recommendation matching predictable on the backend side too
// (ILIKE against a known vocabulary rather than arbitrary free text).

export const COMMON_ROLES = [
  'Software Engineer',
  'Senior Software Engineer',
  'Frontend Engineer',
  'Backend Engineer',
  'Full Stack Engineer',
  'Data Engineer',
  'Data Scientist',
  'Data Analyst',
  'Machine Learning Engineer',
  'AI Engineer',
  'DevOps Engineer',
  'Site Reliability Engineer',
  'Cloud Engineer',
  'Security Engineer',
  'QA Engineer',
  'Mobile Engineer',
  'Product Manager',
  'Program Manager',
  'Project Manager',
  'Business Analyst',
  'Financial Analyst',
  'Accountant',
  'Mechanical Engineer',
  'Electrical Engineer',
  'Civil Engineer',
  'Industrial Engineer',
  'Nurse',
  'Research Scientist',
  'UX Designer',
  'UI Designer',
  'Marketing Analyst',
  'Supply Chain Analyst',
] as const

export interface CityOption {
  name: string
  lat: number
  lng: number
}

export const US_CITIES: CityOption[] = [
  { name: 'New York, NY', lat: 40.7128, lng: -74.0060 },
  { name: 'San Francisco, CA', lat: 37.7749, lng: -122.4194 },
  { name: 'San Jose, CA', lat: 37.3382, lng: -121.8863 },
  { name: 'Seattle, WA', lat: 47.6062, lng: -122.3321 },
  { name: 'Austin, TX', lat: 30.2672, lng: -97.7431 },
  { name: 'Dallas, TX', lat: 32.7767, lng: -96.7970 },
  { name: 'Houston, TX', lat: 29.7604, lng: -95.3698 },
  { name: 'Chicago, IL', lat: 41.8781, lng: -87.6298 },
  { name: 'Boston, MA', lat: 42.3601, lng: -71.0589 },
  { name: 'Los Angeles, CA', lat: 34.0522, lng: -118.2437 },
  { name: 'San Diego, CA', lat: 32.7157, lng: -117.1611 },
  { name: 'Denver, CO', lat: 39.7392, lng: -104.9903 },
  { name: 'Atlanta, GA', lat: 33.7490, lng: -84.3880 },
  { name: 'Washington, DC', lat: 38.9072, lng: -77.0369 },
  { name: 'Philadelphia, PA', lat: 39.9526, lng: -75.1652 },
  { name: 'Phoenix, AZ', lat: 33.4484, lng: -112.0740 },
  { name: 'Miami, FL', lat: 25.7617, lng: -80.1918 },
  { name: 'Charlotte, NC', lat: 35.2271, lng: -80.8431 },
  { name: 'Raleigh, NC', lat: 35.7796, lng: -78.6382 },
  { name: 'Minneapolis, MN', lat: 44.9778, lng: -93.2650 },
  { name: 'Detroit, MI', lat: 42.3314, lng: -83.0458 },
  { name: 'Pittsburgh, PA', lat: 40.4406, lng: -79.9959 },
  { name: 'Columbus, OH', lat: 39.9612, lng: -82.9988 },
  { name: 'Salt Lake City, UT', lat: 40.7608, lng: -111.8910 },
  { name: 'Portland, OR', lat: 45.5152, lng: -122.6784 },
  { name: 'Nashville, TN', lat: 36.1627, lng: -86.7816 },
  { name: 'St. Louis, MO', lat: 38.6270, lng: -90.1994 },
  { name: 'Baltimore, MD', lat: 39.2904, lng: -76.6122 },
  { name: 'Sacramento, CA', lat: 38.5816, lng: -121.4944 },
  { name: 'Jersey City, NJ', lat: 40.7178, lng: -74.0431 },
]

function haversineDistanceMiles(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

/** Nearest fixed city (from US_CITIES) to a given lat/lng, e.g. from
 * navigator.geolocation -- avoids needing an external reverse-geocoding
 * API for a simple "near me" shortcut. */
export function nearestCity(lat: number, lng: number): CityOption {
  let closest = US_CITIES[0]
  let closestDist = Infinity
  for (const city of US_CITIES) {
    const dist = haversineDistanceMiles(lat, lng, city.lat, city.lng)
    if (dist < closestDist) {
      closestDist = dist
      closest = city
    }
  }
  return closest
}
