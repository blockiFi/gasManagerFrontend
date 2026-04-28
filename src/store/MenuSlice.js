import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  menu: [
    {
      name: "Home",
      route: "/dashboard",
      icon: "Home",
    },
    {
      name: "Analytics",
      route: "/dashboard/analytics",
      icon: "BarChart3",
    },
    {
      name: "suppliers",
      route: "/dashboard/suppliers",
      icon: "ShoppingCart",
    },
    {
      name: "Supplies",
      route: "/dashboard/supplies",
      icon: "Package",
    },
    {
      name: "Dispensers",
      route: "/dashboard/dispensers",
      icon: "Fuel",
    },
    {
      name: "Prices",
      route: "/dashboard/prices",
      icon: "DollarSign",
    },
    {
      name: "Operation Cost",
      route: "/dashboard/cost",
      icon: "Banknote",
    },
    {
      name: "Users",
      route: "/dashboard/employees",
      icon: "Users",
    },
    {
      name: "Settings",
      route: "/dashboard/settings",
      icon: "Settings",
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
