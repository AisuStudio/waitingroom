// Synthetic sample data — citizen registration office.
//
// Entirely invented. No real cases, no real people, no connection to any
// actual office. The domain is chosen on purpose: it has the same shape as a
// waiting list in a clinical setting (person, number, purpose, status, desk)
// while touching nothing confidential.
//
// The lists are cut by length because length is the parameter that triggers
// the rule here — the content is not what is being tested.

export const services = [
  'Apply for an ID card',
  'Apply for a passport',
  'Register an address',
  'Change of address',
  'Deregister an address',
  'Certificate of good conduct',
  'Registration certificate',
  'Certify a document',
  'Resident parking permit',
  'Register a business',
  'Register for dog tax',
  'Give notice of marriage',
];

// A slice of length n — lets the threshold be driven past on a slider
// without maintaining a separate list for every count.
export function serviceList(n) {
  return services.slice(0, Math.max(0, Math.min(n, services.length)));
}

export const MAX_SERVICES = services.length;
