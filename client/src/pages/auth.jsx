import React, { useContext, useState } from "react";
import Input from "../components/input";
import Header from "../components/header";
import ShineButton from "../components/shine-button";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LOGIN_ROUTE,
  MAIN_ROUTE,
  PROFILE_ROUTE,
  REGISTRATION_ROUTE,
} from "../utils/consts";
import { login, registration, verifyCode } from "../http/userAPI";
import { Context } from "../index";
import { observer } from "mobx-react-lite";
const Auth = observer(() => {
  const { user } = useContext(Context);
  const location = useLocation();
  const navigate = useNavigate();
  const isLogin = location.pathname === LOGIN_ROUTE;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password_again, setPasswordagain] = useState("");
  const [verificationCode, setVerificationCode] = useState(""); // Состояние для кода
  const [isRegistered, setIsRegistered] = useState(false); // Состояние для проверки, что регистрация началась
  const click = async () => {
    try {
      let data;
      if (isLogin) {
        data = await login(email, password);
      }
      user.setUser(user);
      user.setIsAuth(true);
      if (data.role === "DOCTOR") {
        user.setIsDoctor(true);
      }
      if (data.role === "ADMIN") {
        user.setIsAdmin(true);
      }
      console.log(user);
      navigate(PROFILE_ROUTE);
    } catch (e) {
      alert(e.response.data.message);
    }
  };
  const handleRegister = async () => {
    if(!email.includes("@")){
      alert("Некорректный адресс почты");
      return
    }
    try {
      if (password === password_again) {
        const data = await registration(email, password); // Ожидаем отправки письма
        alert(data.message); // Выводим сообщение о том, что код отправлен
        if (
          data.message === "На вашу почту был отправлен код для подтверждения."
        ) {
          setIsRegistered(true); // После отправки кода, переходим на страницу ввода кода
        }
      } else {
        alert("Пароли не совпадают");
      }
    } catch (e) {
      alert(e.response.data.message);
    }
  };
  const handleVerifyCode = async () => {
    try {
      const data = await verifyCode(email, verificationCode, password); // Отправляем код на сервер для проверки
      if (data === "Регистрация успешна") {
        alert(data); // Выводим сообщение о успешной регистрации
        user.setUser(user);
        user.setIsAuth(true);
        navigate(PROFILE_ROUTE); // Переход на страницу профиля
      } else {
        alert(data); // Сообщение о неправильном коде
      }
    } catch (e) {
      alert(e.response.data.message);
    }
  };

  return (
    <>
      <Header />
      {isLogin ? (
        <div className="auth-block">
          <div style={{ color: "white", fontSize: "x-large" }}>Авторизация</div>
          <Input
            name="Введите вашу почту "
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            name="Введите пароль"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <ShineButton name="войти" onClick={click} />
          <NavLink to={REGISTRATION_ROUTE} style={{ color: "white" }}>
            Зарегистрироваться
          </NavLink>
        </div>
      ) : (
        <div className="auth-block">
          <div style={{ color: "white", fontSize: "x-large" }}>Регистрация</div>
          <Input
            name=" Введите вашу почту "
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            name=" Введите пароль"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Input
            name=" Повторите пароль"
            type="password"
            value={password_again}
            onChange={(e) => setPasswordagain(e.target.value)}
          />
          {isRegistered ? (
            <div>
              <Input
                type="text"
                placeholder="Введите код подтверждения"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                style={{ width: "auto" }}
              />
              <ShineButton name="подтвердить" onClick={handleVerifyCode} />
            </div>
          ) : (
            <ShineButton name="зарегистрироваться" onClick={handleRegister} />
          )}
          <NavLink to={LOGIN_ROUTE} style={{ color: "white" }}>
            Уже есть аккаунт
          </NavLink>
        </div>
      )}
    </>
  );
});

export default Auth;
