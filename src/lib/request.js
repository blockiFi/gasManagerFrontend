import store from '../store/index';
import axios from './axios';
import { setToken, setUser ,setUserBusiness } from '@/store/AuthenticationSlice';

export const LoadSettingsData = async () => {
   await AuthenticateUser();
   const state = store.getState();
   const settings = await getBusinessSettings(state.authentication.token , state.authentication.business.id);
   return {settings}; 
}
export const LoadAnalyticsData = async () => {
   await AuthenticateUser();
   const state = store.getState();

   const locations =  await getBusinessLocations(state.authentication.token , state.authentication.business.id);
   if (locations && Array.isArray(locations.data)) {
      const token = state.authentication.token;
      const businessId = state.authentication.business.id;
      await Promise.all(
         locations.data.map(async (loc) => {
            const salesData = await getSalesByGroup(token, businessId, loc.id, 'weekly');
            loc.salesData = salesData.data;
         })
      );

      return {locations}
   }

}
export const LoadUsersData = async () => {
   await AuthenticateUser();
   const state = store.getState();
   const users = await getBusinessUsers(state.authentication.token , state.authentication.business.id);
   return {users}; 
}

export const LoadCostData = async () => {
   await AuthenticateUser();
   const state = store.getState();
   const locationsOperationalCost = await getAllLocationOperationalCostSummery(state.authentication.token , state.authentication.business.id);
   return {locationsOperationalCost}; 
}
export const LoadPriceData = async () => {
   await AuthenticateUser();
   const state = store.getState();
   const locationData = await getBusinessLocations(state.authentication.token , state.authentication.business.id, 'price');
   return {locationData};
}
export const LoadSupplyData = async () => {
   await AuthenticateUser();
   const state = store.getState();
   const token = state.authentication.token;
   const businessId = state.authentication.business.id;
   const [supplies, locations, suppliers] = await Promise.all([
      getBusinessSupplies(token, businessId),
      getBusinessLocations(token, businessId),
      getBusinessSuppliers(token, businessId),
   ]);

   return {supplies , locations ,suppliers };
}
export const LoadSupplierData = async () => {
   await AuthenticateUser();
    const state = store.getState();
    const suppliers = await getBusinessSuppliers(state.authentication.token , state.authentication.business.id); 
    return {suppliers};
}
export const LoadDispensersData = async () => {
  await AuthenticateUser();
  const state = store.getState();
  const token = state.authentication.token;
  const businessId = state.authentication.business.id;
  const dispensers = await getAllBusinessDispensers(token);
  const locations = await getBusinessLocations(token, businessId);
  return { dispensers, locations };
}
export const LoadLocationData =async () =>{
    // {salesData , businessUsers}
    await AuthenticateUser();
    const state = store.getState();
    const token = state.authentication.token;
    const businessId = state.authentication.business.id;
    const [salesData, businessUsers, locations] = await Promise.all([
      getBusinessSalesData(token, businessId),
      getBusinessUsers(token, businessId),
      getBusinessLocations(token, businessId),
    ]);

    return  {salesData , businessUsers , locations};
}
export const LoadSalesData = async (id) => {
   await AuthenticateUser();
    const state = store.getState();
    const token = state.authentication.token || getToken()
    const businessId = state.authentication.business.id
    const now = new Date()
    const [[sales, dispensers], [salesData, monthAnalytics]] = await Promise.all([
      Promise.all([
        getLocationSales(token, businessId, id),
        getLocationDispensers(token, businessId, id),
      ]),
      Promise.all([
        getSalesByGroup(token, businessId, id, "weekly"),
        getMonthSalesData(
          token,
          businessId,
          id,
          now.getMonth() + 1,
          now.getFullYear()
        ),
      ]),
    ])
    return { sales, dispensers, salesData, monthAnalytics }
}
export const AuthenticateUser = async () => {
    
    const state = store.getState();
    if(state.authentication.authenticated){
        return true;
    }
    const token = getToken();
    const user = await getUser(token);

    const userBusiness =  await getUserBusiness(token);
    if(user.success && userBusiness.success){
        store.dispatch(setToken(token));
        store.dispatch(setUser(user.data));
        store.dispatch(setUserBusiness(userBusiness.data));
        
        return true;
    }
    return false;
}
export   const getUser = async(token) => {
    try {
     const response = await  axios.get("/api/user" ,{ headers: {"Authorization" : `Bearer ${token}`} } )
     if(response.status === 200){
        return {
         success : true,
         data : response.data
        }
     }else{
        return { success : false,
         error: [`Authenication Failed!!! ${response.status}`]}
     }
    } catch (error) {
     console.log(error)
     return { success : false,
        error: ["Error getting data"]}
    
    }
 }
 export const addSalesRecord = async (token , data) => {
// 
try {
   const response = await  axios.post("api/business/location/add_sales" , data ,{ headers: {"Authorization" : `Bearer ${token}`} })
   if(response.status === 200){
      return {
       success : true,
       data : response.data
      }
   }else{
      return { success : false,
       error: [`Authenication Failed!!! ${response.status}`]}
   }
  } catch (error) {
   console.log(error)
   return { success : false,
      error: error.response.data.errors || ["Error getting data"]}
  
  }
 }
 export   const analyseImage = async(token , data ) => {
   try {
    const response = await  axios.post("/api/analyze-image" , data , 
      { headers: { 'Content-Type': 'multipart/form-data',"Authorization" : `Bearer ${token}`} })
    if(response.status === 200){
       return {
        success : true,
        data : response.data
       }
    }else{
       return { success : false,
        error: [`Authenication Failed!!! ${response.status}`]}
    }
   } catch (error) {
    console.log(error)
    return { success : false,
       error: error.response.data.errors || ["Error getting data"]}
   
   }
}
export   const UserLogin = async(email ,password ) => {
    try {
     const response = await  axios.post("/api/login" , {
         email,
         password
     })
     if(response.status === 200){
        return {
         success : true,
         data : response.data
        }
     }else{
        return { success : false,
         error: [`Authenication Failed!!! ${response.status}`]}
     }
    } catch (error) {
     console.log(error)
     return { success : false,
        error: error.response.data.errors || ["Error getting data"]}
    
    }
 }
 export const getBusinessSalesData = async(token ,business_id ) => {
    const response = await  axios.post("api/get_business/get_sales_data" , {"business_id" : business_id},  { headers: {"Authorization" : `Bearer ${token}`} })
    if(response.status === 200){
       return {
        success : true,
        data : response.data.data 
       }
    }else{
       return { success : false,
        error: "User Have sale Data"}
    }
 }


export const getUserBusiness = async(token) => {
    const response = await  axios.get("/api/get_business" ,  { headers: {"Authorization" : `Bearer ${token}`} })
    if(response.status === 200){
       return {
        success : true,
        data : response.data.data 
       }
    }else{
       return { success : false,
        error: "User Have no Busines"}
    }
}
export   const getAllLocationOperationalCostSummery = async(token ,businessId ) => {
   try {
    const response = await  axios.post("/api/get_business/operational_cost_details" , {
        "business_id" : businessId
    },  { headers: {"Authorization" : `Bearer ${token}`} })
    if(response.status === 200){
       return {
        success : true,
        data : response.data.data
       }
    }else{
       return { success : false,
        error: "User Have no Location"}
    }
   } catch (error) {
    console.log(error)
    return { success : false,
       error: "User Have no Location"}
   
   }
}
// 


export   const getBusinessSettings = async(token ,businessId ) => {
   try {
    const response = await  axios.post("/api/get_business/settings/get_settings" , {
        "business_id" : businessId
    },  { headers: {"Authorization" : `Bearer ${token}`} })
    if(response.status === 200){
       return {
        success : true,
        data : response.data.data
       }
    }else{
       return { success : false,
        error: "User Have no Location"}
    }
   } catch (error) {
    console.log(error)
    return { success : false,
       error: "User Have no Location"}
   
   }
}
export   const getBusinessUsers = async(token ,businessId ) => {
   try {
    const response = await  axios.post("/api/business/users/get_business_users" , {
        "business_id" : businessId
    },  { headers: {"Authorization" : `Bearer ${token}`} })
    if(response.status === 200){
       return {
        success : true,
        data : response.data.data
       }
    }else{
       return { success : false,
        error: "User Have no Location"}
    }
   } catch (error) {
    console.log(error)
    return { success : false,
       error: "User Have no Location"}
   
   }
}
export   const getBusinessLocations = async(token ,businessId  , param = '') => {
    try {
     const response = await  axios.post(`/api/get_business/locations/${param}` , {
         "business_id" : businessId
     },  { headers: {"Authorization" : `Bearer ${token}`} })
     if(response.status === 200){
        return {
         success : true,
         data : response.data.data.locations
        }
     }else{
        return { success : false,
         error: "User Have no Location"}
     }
    } catch (error) {
     console.log(error)
     return { success : false,
        error: "User Have no Location"}
    
    }
 }

 export const getLocationSales = async (token , businessId ,locationId) =>{
    try {
        const response = await  axios.post("/api/get_business/location/sales" ,
         {
            "business_id" : businessId,
            "location_id" : locationId,
            
        }, 
         { headers: {"Authorization" : `Bearer ${token}`} })
        if(response.status === 200){
           return {
            success : true,
            data : response.data.data,
            miniData : response.data.miniData,
            location : response.data.location
           }
        }else{
           return { success : false,
            error: "User Have no Busines"}
        }
       } catch (error) {
        console.log(error)
       }
 }

export const getMonthSalesData = async (_token, businessId, locationId, month, year) => {
  try {
    const response = await axios.post("api/get_business/get_month_sales_data", {
      business_id: businessId,
      location_id: locationId,
      month: String(month),
      year: String(year),
    })
    if (response.status >= 200 && response.status < 300) {
      const body = response.data
      const payload =
        body && typeof body === "object" && body.data != null && typeof body.data === "object"
          ? body.data
          : body
      return { success: true, data: payload }
    }
    return { success: false, data: null }
  } catch (error) {
    console.log(error)
    return { success: false, data: null, error: error.response?.data ?? error.message }
  }
}

export const getAllBusinessDispensers = async (token) => {
  try {
    const response = await axios.get("api/get_business/all_dispenser", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.status === 200) {
      return { success: true, data: response.data.data };
    }
    return { success: false, data: [], error: "Could not load dispensers." };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      data: [],
      error: error.response?.data?.message ?? "Could not load dispensers.",
    };
  }
}

 export const getLocationDispensers = async(token ,business_id ,  locationID) => {
    const response = await  axios.post("api/get_business/location/dispenser" , {"business_id" : business_id , "location_id" : locationID},  { headers: {"Authorization" : `Bearer ${token}`} })
    if(response.status === 200){
       return {
        success : true,
        data : response.data.data 
       }
    }else{
       return { success : false,
        error: "User Have no Busines"}
    }
}

export const getSalesReceipt = async (token , salesID , businessID , LocationID) => {
   try {
    const response = await  axios.post(`api/get_business/location/dispenser/${LocationID}` , 
    {
        'business_id' : businessID,
        'location_id' : LocationID,
        'sales_id' : salesID
    }
    ,{ headers: {"Authorization" : `Bearer ${token}`} })
    if(response.status === 200){
       return {
        success : true,
        data : response.data.data 
       }
    }else{
       return { success : false,
        error: "User Have no Busines"}
    }
   } catch {
    return { success : false,
        error: "Something happened "}
   }
}

export const getBusinessSuppliers = async (token , business_id) => {
    try {
        const response = await  axios.post("api/business/supplier/get_business_suppliers" , 
        {
            'business_id' : business_id
        }
        ,{ headers: {"Authorization" : `Bearer ${token}`} })
        if(response.status === 200){
           return {
            success : true,
            data : response.data.data 
           }
        }else{
           return { success : false,
            error: "User Have no Busines"}
        }
       } catch (error) {
        console.log(error)
        return { success : false,
            error: "Something happened "}
       }
}
 
export const getSalesByGroup = async (token , business_id , location_id ,groupParameter , all = false) => {
   try {
       const response = await  axios.post("api/get_business/sales_by_group" , 
       {
           'business_id' : business_id,
           'location_id' : location_id,
           'groupParameter' : groupParameter,
           'all' : all
       }
       ,{ headers: {"Authorization" : `Bearer ${token}`} })
       if(response.status === 200){
          return {
           success : true,
           data : response.data.data 
          }
       }else{
          return { success : false,
           error: "User Have no Busines"}
       }
      } catch (error) {
       console.log(error)
       return { success : false,
           error: "Something happened "}
      }
}
export const getBusinessSupplies = async (token , business_id) => {
   try {
       const response = await  axios.post("api/business/supply/get_business_supplies" , 
       {
           'business_id' : business_id
       }
       ,{ headers: {"Authorization" : `Bearer ${token}`} })
       if(response.status === 200){
          return {
           success : true,
           data : response.data.data 
          }
       }else{
          return { success : false,
           error: "User Have no Busines"}
       }
      } catch (error) {
       console.log(error)
       return { success : false,
           error: "Something happened "}
      }
}

export const getSupplyDetails = async (token, business_id, supply_id) => {
  try {
    const response = await axios.post(
      "api/business/supply/get_supply_details",
      { business_id, supply_id },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    if (response.status === 200) {
      return { success: true, data: response.data.data }
    }
    return { success: false, error: "Could not load supply details." }
  } catch (error) {
    console.log(error)
    return {
      success: false,
      error: error?.response?.data?.errors?.[0] ?? "Could not load supply details.",
    }
  }
}

export const transferSupply = async (token, payload) => {
  try {
    const res = await axios.post("api/business/supply/transfer_business_supply", payload, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.status === 200 && res.data?.code === 200) {
      return { success: true, data: res.data.data, message: res.data.message }
    }
    return { success: false, error: res.data?.errors?.[0] ?? "Transfer failed." }
  } catch (e) {
    return { success: false, error: e?.response?.data?.errors?.[0] ?? "Transfer failed." }
  }
}
 export const storeToken = (token) => {
    localStorage.setItem('authToken', token);
  };
  export const getToken = () => {
    return localStorage.getItem('authToken');
  };
  