import {
  Banknote,
  BarChart3,
  CreditCard,
  DollarSign,
  Fuel,
  Home,
  Package,
  Settings,
  ShoppingCart,
  Users,
} from "lucide-react";

/** Maps MenuSlice `icon` string keys to Lucide components (keep Redux serializable). */
export const MENU_ICON_MAP = {
  Home,
  BarChart3,
  ShoppingCart,
  Package,
  Fuel,
  DollarSign,
  Banknote,
  Users,
  Settings,
  CreditCard,
};

export function getMenuIconComponent(iconKey) {
  const Cmp = MENU_ICON_MAP[iconKey];
  return Cmp || Home;
}
