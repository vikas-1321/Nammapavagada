/**
 * Namma Pavagada - Services Data Reference
 *
 * NOTE: All active transit corridors, civic desks, and emergency responders
 * are retrieved dynamically from the backend REST API:
 *   - GET /api/buses/routes
 *   - GET /api/locations?category=CIVIC_GOVERNMENT
 *   - GET /api/hospitals
 * Obsolete mock place datasets have been completely removed.
 */

import { TransitScheduleItem, CivicServiceContact, EmergencyContact } from '../types/service';

export const TRANSIT_ROUTES: TransitScheduleItem[] = [];
export const CIVIC_OFFICES: CivicServiceContact[] = [];
export const EMERGENCY_CONTACTS: EmergencyContact[] = [];
