export const PERMISSIONS = {
  DASHBOARD_VIEW: "dashboard.view",
  BOOKINGS_VIEW: "bookings.view",
  BOOKINGS_CREATE: "bookings.create",
  BOOKINGS_UPDATE: "bookings.update",
  BOOKINGS_DELETE: "bookings.delete",
  BOOKINGS_CHECKIN: "bookings.checkin",
  CABINS_VIEW: "cabins.view",
  CABINS_MANAGE: "cabins.manage",
  SETTINGS_MANAGE: "settings.manage",
  USERS_MANAGE: "users.manage",
  CALENDAR_VIEW: "calendar.view",
  MAINTENANCE_MANAGE: "maintenance.manage",
  REPORTS_VIEW: "reports.view",
  REPORTS_EXPORT: "reports.export",
  AUDIT_VIEW: "audit.view",
};

const ALL_PERMISSIONS = Object.values(PERMISSIONS);

export const ROLE_PERMISSIONS = {
  owner: ALL_PERMISSIONS,
  manager: ALL_PERMISSIONS.filter(
    (permission) => permission !== PERMISSIONS.USERS_MANAGE,
  ),
  front_desk: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.BOOKINGS_VIEW,
    PERMISSIONS.BOOKINGS_CREATE,
    PERMISSIONS.BOOKINGS_UPDATE,
    PERMISSIONS.BOOKINGS_CHECKIN,
    PERMISSIONS.CABINS_VIEW,
    PERMISSIONS.CALENDAR_VIEW,
  ],
  finance: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.BOOKINGS_VIEW,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_EXPORT,
    PERMISSIONS.AUDIT_VIEW,
  ],
};

export const ROLE_LABELS = {
  owner: "Owner",
  manager: "Manager",
  front_desk: "Front desk",
  finance: "Finance",
};
