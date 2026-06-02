export const CAPABILITIES = {
  VIEW_DASHBOARD: "view.dashboard",
  VIEW_ANALYTICS: "view.analytics",
  VIEW_DISPENSERS: "view.dispensers",
  VIEW_PRICES: "view.prices",
  VIEW_SETTINGS: "view.settings",
  VIEW_BILLING: "view.billing",
  VIEW_LOCATION_DETAIL: "view.location_detail",
  VIEW_SUPPLIERS: "view.suppliers",
  VIEW_SUPPLIES: "view.supplies",
  VIEW_OPERATIONAL_COST: "view.operational_cost",
  VIEW_EMPLOYEES: "view.employees",
  LOCATION_CREATE: "location.create",
  LOCATION_CHANGE_MANAGER: "location.change_manager",
  DISPENSER_MANAGE: "dispenser.manage",
  PRICE_SET: "price.set",
  SUPPLY_ADD: "supply.add",
  SUPPLY_MANAGE: "supply.manage",
  SUPPLIER_MANAGE: "supplier.manage",
  SALES_ADD: "sales.add",
  SALES_REVERSE: "sales.reverse",
  SALES_EDIT_DATE: "sales.edit_date",
  SALES_UPLOAD_RECEIPT: "sales.upload_receipt",
  SALES_CONFIRM_PAYMENT: "sales.confirm_payment",
  COST_ADD: "cost.add",
  EMPLOYEE_MANAGE: "employee.manage",
  BUSINESS_UPDATE: "business.update",
  SETTINGS_UPDATE: "settings.update",
  BILLING_MANAGE: "billing.manage",
}

/** Location-scoped capabilities — require managed_location_ids unless owner. */
export const LOCATION_SCOPED = new Set([
  CAPABILITIES.VIEW_LOCATION_DETAIL,
  CAPABILITIES.SALES_ADD,
  CAPABILITIES.SALES_REVERSE,
  CAPABILITIES.SALES_EDIT_DATE,
  CAPABILITIES.SALES_UPLOAD_RECEIPT,
  CAPABILITIES.COST_ADD,
])

export const ROUTE_CAPABILITIES = {
  "": CAPABILITIES.VIEW_DASHBOARD,
  analytics: CAPABILITIES.VIEW_ANALYTICS,
  suppliers: CAPABILITIES.VIEW_SUPPLIERS,
  supplies: CAPABILITIES.VIEW_SUPPLIES,
  dispensers: CAPABILITIES.VIEW_DISPENSERS,
  prices: CAPABILITIES.VIEW_PRICES,
  cost: CAPABILITIES.VIEW_OPERATIONAL_COST,
  employees: CAPABILITIES.VIEW_EMPLOYEES,
  settings: CAPABILITIES.VIEW_SETTINGS,
  subscribe: CAPABILITIES.VIEW_BILLING,
}

export function can(permissions, capabilityKey) {
  if (!permissions?.capabilities) return false
  return permissions.capabilities[capabilityKey] === true
}

export function canForLocation(permissions, capabilityKey, locationId) {
  if (!can(permissions, capabilityKey)) return false
  if (permissions.is_owner) return true
  if (!LOCATION_SCOPED.has(capabilityKey)) return true
  if (permissions.managed_location_ids === null) return true
  const managed = (permissions.managed_location_ids ?? []).map(String)
  return managed.includes(String(locationId))
}

export function roleLabel(role) {
  if (!role || role === "none") return "Member"
  if (role === "owner") return "Owner"
  if (role.includes(",")) return role
  switch (role) {
    case "manager":
      return "Location manager"
    case "member":
      return "Member"
    default:
      return role
  }
}

/** Permission keys grouped for role editor UI */
export const PERMISSION_GROUPS = [
  {
    label: "Views",
    keys: [
      CAPABILITIES.VIEW_DASHBOARD,
      CAPABILITIES.VIEW_ANALYTICS,
      CAPABILITIES.VIEW_DISPENSERS,
      CAPABILITIES.VIEW_PRICES,
      CAPABILITIES.VIEW_SETTINGS,
      CAPABILITIES.VIEW_BILLING,
      CAPABILITIES.VIEW_LOCATION_DETAIL,
      CAPABILITIES.VIEW_SUPPLIERS,
      CAPABILITIES.VIEW_SUPPLIES,
      CAPABILITIES.VIEW_OPERATIONAL_COST,
      CAPABILITIES.VIEW_EMPLOYEES,
    ],
  },
  {
    label: "Locations",
    keys: [CAPABILITIES.LOCATION_CREATE, CAPABILITIES.LOCATION_CHANGE_MANAGER],
  },
  {
    label: "Sales",
    keys: [
      CAPABILITIES.SALES_ADD,
      CAPABILITIES.SALES_REVERSE,
      CAPABILITIES.SALES_EDIT_DATE,
      CAPABILITIES.SALES_UPLOAD_RECEIPT,
      CAPABILITIES.SALES_CONFIRM_PAYMENT,
    ],
  },
  {
    label: "Supply & inventory",
    keys: [CAPABILITIES.SUPPLY_ADD, CAPABILITIES.SUPPLY_MANAGE, CAPABILITIES.DISPENSER_MANAGE],
  },
  {
    label: "Suppliers & pricing",
    keys: [CAPABILITIES.SUPPLIER_MANAGE, CAPABILITIES.PRICE_SET, CAPABILITIES.COST_ADD],
  },
  {
    label: "Team & settings",
    keys: [
      CAPABILITIES.EMPLOYEE_MANAGE,
      CAPABILITIES.SETTINGS_UPDATE,
      CAPABILITIES.BUSINESS_UPDATE,
      CAPABILITIES.BILLING_MANAGE,
    ],
  },
]

export function permissionLabel(key) {
  return key.replace(/\./g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}
