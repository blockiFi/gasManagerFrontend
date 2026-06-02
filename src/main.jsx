import { StrictMode, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'react-day-picker/dist/style.css'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { createBrowserRouter, redirect, RouterProvider } from "react-router-dom"
import { Provider } from 'react-redux';
import store from './store/index.js';
import { AuthenticateUser, LoadAnalyticsData, LoadCostData, LoadDispensersData, LoadLocationData, LoadPriceData, LoadRolesData, LoadSalesData, LoadSettingsData, LoadSupplierData, LoadSupplyData, LoadUsersData, subscriptionHasAccess } from './lib/request.js';
import { CAPABILITIES } from './lib/permissions.js';
import { requireRouteCapability, requireLocationDetailCapability } from './lib/routeGuards.js';
import AppShell from '@/components/layout/AppShell.jsx'

const LandingPage = lazy(() => import('./pages/Landing.jsx'))
const HomePage = lazy(() => import('./pages/Home.jsx'))
const DashboardPage = lazy(() => import('./pages/Dashboard.jsx'))
const LocationsPage = lazy(() => import('./pages/Locations.jsx'))
const EmployeesPage = lazy(() => import('./pages/Employees.jsx'))
const OperationalCostPage = lazy(() => import('./pages/OperationalCost.jsx'))
const PricesPage = lazy(() => import('./pages/Prices.jsx'))
const SupplyPage = lazy(() => import('./pages/Supply.jsx'))
const SuppliersPage = lazy(() => import('./pages/Suppliers.jsx'))
const SettingsPage = lazy(() => import('./pages/Settings.jsx'))
const LocationPage = lazy(() => import('./pages/Location.jsx'))
const AnalyticsPage = lazy(() => import('./pages/Analytics.jsx'))
const DispensersPage = lazy(() => import('./pages/Dispensers.jsx'))
const SubscribePage = lazy(() => import('./pages/Subscribe.jsx'))
const RolesPage = lazy(() => import('./pages/Roles.jsx'))

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: "login",
        element: <HomePage />,
      },
      {
        path: "dashboard",
        element : <DashboardPage />,
        loader: async ({ request }) => {
         const authenticated = await AuthenticateUser();

          if(!authenticated){
            return redirect('/login')
          }

          const url = new URL(request.url);
          const isSubscribeRoute = url.pathname.endsWith('/subscribe');
          const subscription = store.getState().authentication.subscription;
          if (!isSubscribeRoute && !subscriptionHasAccess(subscription)) {
            return redirect('/dashboard/subscribe');
          }

          return authenticated;
        },
        children : [
          {
            path: "",
            loader : async () => {
              const denied = await requireRouteCapability(CAPABILITIES.VIEW_DASHBOARD);
              if (denied) return denied;
              const {salesData , businessUsers , locations  } = await LoadLocationData();
              return {salesData , businessUsers , locations};
            },
           element : <LocationsPage />
          },
          {
            path: "employees",
            loader: async () => {
              const denied = await requireRouteCapability(CAPABILITIES.VIEW_EMPLOYEES);
              if (denied) return denied;
              const { users } = await LoadUsersData();
              return { users };
            },
           element : <EmployeesPage />
          },
          {
            path: "roles",
            loader: async () => {
              const denied = await requireRouteCapability(CAPABILITIES.EMPLOYEE_MANAGE);
              if (denied) return denied;
              const { roles } = await LoadRolesData();
              return { roles };
            },
            element: <RolesPage />,
          },
          {
            path: "cost",
            loader: async () => {
              const denied = await requireRouteCapability(CAPABILITIES.VIEW_OPERATIONAL_COST);
              if (denied) return denied;
              const { locationsOperationalCost } = await LoadCostData();
              return { locationsOperationalCost };
            },
           element : <OperationalCostPage />
          },
          {
            path: "prices",
            loader: async () => {
              const denied = await requireRouteCapability(CAPABILITIES.VIEW_PRICES);
              if (denied) return denied;
              const { locationData } = await LoadPriceData();
              return { locationData };
            },
           element : <PricesPage />
          }
          ,
          {
            path: "supplies",
            loader: async () => {
              const denied = await requireRouteCapability(CAPABILITIES.VIEW_SUPPLIES);
              if (denied) return denied;
              const { supplies, locations, suppliers } = await LoadSupplyData();
              return { supplies, locations, suppliers };
            },
           element : <SupplyPage />
          },
          {
            path: "dispensers",
            loader: async () => {
              const denied = await requireRouteCapability(CAPABILITIES.VIEW_DISPENSERS);
              if (denied) return denied;
              return LoadDispensersData();
            },
            element: <DispensersPage />,
          },
          {
            path: "suppliers",
            loader: async () => {
              const denied = await requireRouteCapability(CAPABILITIES.VIEW_SUPPLIERS);
              if (denied) return denied;
              const { suppliers, supplies } = await LoadSupplierData();
              return { suppliers, supplies };
            },
           element : <SuppliersPage />
          },
          {
            path: "settings",
            loader: async () => {
              const denied = await requireRouteCapability(CAPABILITIES.VIEW_SETTINGS);
              if (denied) return denied;
              const { settings } = await LoadSettingsData();
              return { settings };
            },
           element : <SettingsPage />
          }
          ,
          {
            path: "location/:id",
            loader: async ({ params }) => {
              await AuthenticateUser()
              const subscription = store.getState().authentication.subscription
              const lockedIds = (subscription?.locked_location_ids ?? []).map(String)
              if (lockedIds.includes(String(params.id))) {
                return redirect("/dashboard/subscribe")
              }
              const denied = await requireLocationDetailCapability(params.id)
              if (denied) return denied
              const { sales, dispensers, salesData, locationOverview } = await LoadSalesData(params.id)
              return { sales, dispensers, salesData, locationOverview }
            },
           element : <LocationPage />
          },
          {
            path: "subscribe",
            loader: async () => {
              const denied = await requireRouteCapability(CAPABILITIES.VIEW_BILLING);
              if (denied) return denied;
              return null;
            },
            element: <SubscribePage />,
          },
          {
            path: "analytics",
            loader: async () => {
              const denied = await requireRouteCapability(CAPABILITIES.VIEW_ANALYTICS);
              if (denied) return denied;
              const { locations } = await LoadAnalyticsData();
              return { locations };
            },
            element : <AnalyticsPage />
          }
        ]


      }
    ]
  }
]);


createRoot(document.getElementById('root')).render(
  <StrictMode>
      <Provider store={store}>
      <RouterProvider router={router} />
      <ToastContainer
        position="top-right"
        autoClose={10000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      </Provider>

  </StrictMode>,
)
