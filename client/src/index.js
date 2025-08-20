import React, { createContext } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import UserStore from './store/UserStore';
export const Context = createContext(null)
const root = ReactDOM.createRoot(document.getElementById('base'));
console.log(process.env.REACT_APP_API_URL)
root.render(
    <Context.Provider value={{
        user: new UserStore()
    }}>
  <App/>
    </Context.Provider>,
   document.getElementById("main")
);
