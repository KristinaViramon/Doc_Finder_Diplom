import { $host, $authHost } from "./http";
import { jwtDecode } from "jwt-decode";

export const registration = async (email, password) => {
  const { data } = await $host.post("api/user/registration", {
    email,
    password,
    role: "USER",
  });
  return data;
};
export const login = async (email, password) => {
  const { data } = await $host.post("api/user/login", { email, password });
  localStorage.setItem("token", data.token);
  return jwtDecode(data.token);
};
export const verifyCode = async (email, verificationCode, password) => {
  const { data } = await $host.post("api/user/verify-code", {
    email,
    verificationCode,
    password,
    role: "USER",
  });
  if (data.token) {
    localStorage.setItem("token", data.token);
  }
  return data.message
};
export const check = async () => {
  const { data } = await $authHost.get("api/user/auth");
  localStorage.setItem("token", data.token);
  return jwtDecode(data.token);
};

export const fetchDoctors = async () => {
  const { data } = await $host.get("api/user/doctors");
  return data;
};

export const fetchSpecializations = async () => {
  const { data } = await $host.get("api/user/specializations"); // Предполагаем, что эндпоинт для получения специализаций — /api/specializations
  return data;
};

export const doctorCertificates = async (filePath) => {
  try {
    const { data } = await $host.post("api/user/doctorCertificates", {
      filePath,
    });
    return data;
  } catch (error) {
    throw new Error("Ошибка при получении сертификатов");
  }
};
export const getDoctorSchedule = async (doctorId) => {
  const { data } = await $host.get(`api/user/schedule/${doctorId}`);
  return data;
};

export const getDoctorDataById = async (doctorId) => {
  const { data } = await $host.get(`api/user/getDoctor/${doctorId}`);
  return data;
};

export const getDocReviews = async (doctorId) => {
  const { data } = await $host.get(`api/user/getReviews/${doctorId}`);
  return data;
};
