import { createSlice } from "@reduxjs/toolkit";
import { CAPABILITIES } from "@/lib/permissions";

const initialState = {
  menu: [
    {
      name: "Home",
      route: "/dashboard",
      icon: "Home",
      capability: CAPABILITIES.VIEW_DASHBOARD,
    },
    {
      name: "Analytics",
      route: "/dashboard/analytics",
      icon: "BarChart3",
      capability: CAPABILITIES.VIEW_ANALYTICS,
    },
    {
      name: "suppliers",
      route: "/dashboard/suppliers",
      icon: "ShoppingCart",
      capability: CAPABILITIES.VIEW_SUPPLIERS,
    },
    {
      name: "Supplies",
      route: "/dashboard/supplies",
      icon: "Package",
      capability: CAPABILITIES.VIEW_SUPPLIES,
    },
    {
      name: "Dispensers",
      route: "/dashboard/dispensers",
      icon: "Fuel",
      capability: CAPABILITIES.VIEW_DISPENSERS,
    },
    {
      name: "Prices",
      route: "/dashboard/prices",
      icon: "DollarSign",
      capability: CAPABILITIES.VIEW_PRICES,
    },
    {
      name: "Operation Cost",
      route: "/dashboard/cost",
      icon: "Banknote",
      capability: CAPABILITIES.VIEW_OPERATIONAL_COST,
    },
    {
      name: "Users",
      route: "/dashboard/employees",
      icon: "Users",
      capability: CAPABILITIES.VIEW_EMPLOYEES,
    },
    {
      name: "Roles",
      route: "/dashboard/roles",
      icon: "ShieldCheck",
      capability: CAPABILITIES.EMPLOYEE_MANAGE,
    },
    {
      name: "Settings",
      route: "/dashboard/settings",
      icon: "Settings",
      capability: CAPABILITIES.VIEW_SETTINGS,
    },
    {
      name: "Billing",
      route: "/dashboard/subscribe",
      icon: "CreditCard",
      capability: CAPABILITIES.VIEW_BILLING,
    },
  ],
  activeMenu: "Home",
};

const MenuSlice = createSlice({
  name: "menu",
  initialState,
  reducers: {
    setActiveMenu: (state, action) => {
      state.activeMenu = action.payload;
    },
  },
});

export const { setActiveMenu } = MenuSlice.actions;
export default MenuSlice.reducer;
