import {configureStore} from '@reduxjs/toolkit';//configurestore ek readymade box hain ...ek store bana do easy tareeke se 

import authReducer from './slices/authSlice'//auth ka data alag alag file mein ho toh iss file mein laao
import workspaceReducer from './slices/workspaceSlice';//workspace ka data alag alag file mein ho toh iss file mein laao
import taskReducer from './slices/taskSlice'; // ADD
import statisticsReducer from './slices/statisticsSlice';
const store =configureStore({//ab ek big register we make it 
reducer:{
    auth:authReducer,//auth ke sare data ko authReducer se leke store mein daal do “Is register ke andar ek section hoga jiska naam hoga 👉 auth”
    workspace:workspaceReducer,//workspace ke sare data ko workspaceReducer se leke store mein daal do “Is register ke andar ek section hoga jiska naam hoga 👉 workspace”
    tasks: taskReducer, // ADD
     statistics: statisticsReducer
},
middleware:(getDefaultMiddleware)=>
    getDefaultMiddleware({
        serializableCheck:false,//Redux ko bolo ki wo zyada strict na bane, complex data ko bhi accept kar le
})
})
export default store;

// Redux, tu zyada strict mat ban
// Login ke time thode complex data aayenge
// unko accept kar lena”