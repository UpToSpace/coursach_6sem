// import { useEffect, useState } from "react";
// import { observable, observer, useLocalObservable, useLocalStore } from "mobx-react-lite"
// import { UserService } from "../services/user.service";

import { createContext } from "react";
import { useLocalObservable, observer } from "mobx-react-lite";
import { UserService } from "../services/user.service";

export const StoreContext = createContext(null);

export const StoreProvider = observer(({ children }) => {
  const store = useLocalObservable(() => ({
    userId: null,
    userRole: null,
    ready: false,
    login: async (email, password) => {
      try {
        const data = await UserService().login(email, password);
        store.userId = data.user.id;
        store.userRole = data.user.role;
        localStorage.setItem(
          "userData",
          JSON.stringify({
            userId: data.user.id,
            token: data.token,
          })
        );
      } catch (e) {
        console.log("store.js: login: e.message = ", e.message);
      }
    },
    logout: async () => {
      const data = await UserService().logout();
      store.userId = null;
      store.userRole = null;
      localStorage.removeItem("userData");
    },
  }));

  // Load user data from local storage on mount
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    if (userData && userData.userId && userData.token) {
      store.userId = userData.userId;
      // You could also use the token for authorization here
    }
    store.ready = true;
  }, [store]);

  if (!store.ready) {
    return <div>Loading...</div>;
  }

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
});


// export const Store = observer({
//     userId: null,
//     userRole: null,
//     ready: false,
//     login: () => {},
//     logout: () => {}
// })

// Store.login = async (email, passoword) => {
//     try {
//         const data = await UserService().login(email, passoword);
//         Store.userId = data.user.id
//         Store.userRole = data.user.role;
//         console.log(Store.userId + Store.userRole)
//         localStorage.setItem('userData', JSON.stringify({
//             userId: data.user.id, token: data.token
//         }));
//     } catch (e) {
//         console.log('store.js: login: e.message = ', e.message);
//     }
// }

// Store.logout = async () => {
//     try {
//         Store.userId = null
//         Store.userRole = null;
//         localStorage.removeItem('userData');
//         await UserService.logout();
//     } catch (e) {
//         console.log('store.js: logout: e.message = ', e.message);
//     }
// }

// export const Store = () => {
//     const [userId, setUserId] = useState(null);
//     const [userRole, setUserRole] = useState(null);
//     const [ready, setReady] = useState(false);
//     const { request } = useHttp();

//     const login = async (email, passoword) => {
//         try {
//             const data = await request('/api/auth/login', 'POST', { email, passoword });
//             setUserId(data.user.id);
//             setUserRole(data.user.role);
//             localStorage.setItem('userData', JSON.stringify({
//                 userId: data.user.id, token: data.token
//             }));
//         } catch (e) {
//             console.log('store.js: login: e.message = ', e.message);
//         }
//     }

//     const logout = async () => {
//         try {
//             setUserId(null);
//             setUserRole(null);
//             localStorage.removeItem('userData');
//             const data = await request('/api/auth/logout', 'POST', null);
//         } catch (e) {
//             console.log('store.js: logout: e.message = ', e.message);
//         }
//     }

//     useEffect(() => {
//         setReady(true)
//     }, []);

//     return { login, logout, userId, ready, userRole };
// }