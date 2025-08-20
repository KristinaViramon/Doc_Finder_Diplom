import React, { useContext, useEffect, useState } from "react";
import { BrowserRouter, data } from "react-router-dom";
import "./styles/styles.css";
import AppRouter from "./components/AppRouter";
import { observer } from "mobx-react-lite";
import { Context } from "./index";
import { check } from "./http/userAPI";
const App = observer(() => {
  const { user } = useContext(Context);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  check().then(data => {
    user.setUser(data); // желательно сохранять реальные данные пользователя
    user.setIsAuth(true);
    if(data.role === "DOCTOR"){
      user.setIsDoctor(true);
    }
    if(data.role === "ADMIN"){
      user.setIsAdmin(true);
    }
  }).catch(() => {
    user.setUser({});
    user.setIsAuth(false);
    user.setIsDoctor(false);
    localStorage.removeItem('token');
  }).finally(() => {
    setLoading(false);
  });
}, []);
  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  );
});

export default App;
