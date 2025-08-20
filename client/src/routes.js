import Profile from "./pages/profile";
import {
  CALENDAR_ROUTE,
  DOCTOR_ROUTE,
  LIST_ROUTE,
  LOGIN_ROUTE,
  MAIN_ROUTE,
  MAP_ROUTE,
  PROFILE_ROUTE,
  REGISTRATION_ROUTE,
} from "./utils/consts";
import MainPage from "./pages/main_page";
import DoctorListPage from "./pages/doctor_list_page";
import Auth from "./pages/auth";
import { Component } from "react";
import DoctorPage from "./pages/doctor_page";
import Calendaric from "./components/calendar";

export const authRoutes = [
  {
    path: PROFILE_ROUTE,
    Component: Profile,
  },
];

export const publicRoutes = [
  {
    path: MAIN_ROUTE,
    Component: MainPage,
  },
  {
    path: LIST_ROUTE,
    Component: DoctorListPage,
  },
  {
    path: LOGIN_ROUTE,
    Component: Auth,
  },
  {
    path: REGISTRATION_ROUTE,
    Component: Auth,
  },
  {
    path: DOCTOR_ROUTE,
    Component: DoctorPage,
  },
  {
    path: MAP_ROUTE,
    Component: DoctorListPage,
  },
  {
    path: CALENDAR_ROUTE,
    Component: Calendaric,
  },
];
