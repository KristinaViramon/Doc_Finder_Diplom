import { $authHost } from "./http";

export const saveInfo = async (info) => {
  const { surname, name, lastname, location, birthDate, phone } = info;
  const { data } = await $authHost.post("api/patient/setInfo", {
    surname,
    name,
    lastname,
    location,
    birthDate,
    phone,
  });

  return data;
};
export const getInfo = async () => {
  const { data } = await $authHost.get("api/patient/getInfo");
  return data;
};

export const saveEntry = async ({doctorId, date, time }) => {
  const { data } = await $authHost.post("api/patient/entry", {
    doctorId,
    date,
    time,
  });
  return data;
};

export const entryHistory = async () => {
  const {data} = await $authHost.get("api/patient/getEntryHistory");
  return data;
}

export const cancelAppointment = async (appointmentId) =>{
  const {data} = await $authHost.post("api/patient/cancelEntry", {appointmentId})
}

export const submitReview = async (selectedEntryId, selectedRating, reviewText) =>{
  const {data} = await $authHost.post("api/patient/sendReview", {selectedEntryId, selectedRating, reviewText})
}