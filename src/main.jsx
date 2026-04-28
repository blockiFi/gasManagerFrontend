import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'react-day-picker/dist/style.css'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { createBrowserRouter, redirect, RouterProvider } from "react-router-dom"
import Home from './pages/Home';
import Landing from './pages/Landing.jsx';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import OperationalCost from './pages/OperationalCost.jsx';
import Prices from './pages/Prices.jsx';
import Supply from './pages/Supply.jsx';
import Suppliers from './pages/Suppliers.jsx';
import Settings from './pages/Settings.jsx';
import Location from './pages/Location.jsx';
import { Provider } from 'react-redux';
import store from './store/index.js';
import { AuthenticateUser, LoadAnalyticsData, LoadCostData, LoadDispensersData, LoadLocationData, LoadPriceData, LoadSalesData, LoadSettingsData, LoadSupplierData, LoadSupplyData, LoadUsersData } from './lib/request.js';
import Locations from './pages/Locations.jsx';
import Analytics from './pages/Analytics.jsx';
import Dispensers from './pages/Dispensers.jsx';
const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing />,
  },
  {
    path: "/login",
    element: <Home />,
  },
  {
    path: "/dashboard",
    element : <Dashboard />,
    loader: async () => {
     const authenticated = await AuthenticateUser();
    
      if(!authenticated){
        return redirect('/login')
      }
      return authenticated;
    },
    children : [
      {
        path: "",
        loader : async () => {
          const {salesData , businessUsers , locations  } = await LoadLocationData();
          return {salesData , businessUsers , locations};
        },
       element : <Locations />
      },
      {
        path: "employees",
        loader: async ()=>{
          const {users} = await LoadUsersData();
          return {users};
        },
       element : <Employees />
      },
      {
        path: "cost",
        loader: async () => {
        const {locationsOperationalCost} = await LoadCostData();
        return {locationsOperationalCost};
        },
       element : <OperationalCost />
      },
      {
        path: "prices",
        loader: async () => {
          const {locationData} = await LoadPriceData();
          return {locationData};
        },
       element : <Prices />
      }
      ,
      {
        path: "supplies",
        loader: async () => {
          const {supplies , locations ,suppliers } = await  LoadSupplyData();
          return {supplies , locations ,suppliers };
        },
       element : <Supply />
      },
      {
        path: "dispensers",
        loader: async () => {
          return LoadDispensersData();
        },
        element: <Dispensers />,
      },
      {
        path: "suppliers",
        loader : async () => {
          const {suppliers} = await LoadSupplierData();
          return {suppliers};
        },
       element : <Suppliers />
      },
      {
        path: "settings",
        loader: async () => {
         const {settings} = await LoadSettingsData();
          return {settings};
        },
       element : <Settings />
      }
      ,
      {
        path: "location/:id",
        loader: async ({params}) => {
          const {sales ,dispensers ,salesData} = await LoadSalesData(params.id);
          return {sales ,dispensers ,salesData};
        },
       element : <Location />
      },
      {
        path: "analytics",
        loader : async () => {
          const {locations  } = await LoadAnalyticsData();
          return {locations};
        },
        element : <Analytics />
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
