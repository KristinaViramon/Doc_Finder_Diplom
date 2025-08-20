import { $host, $authHost } from "./http";

export const saveInfo = async (info) => {
  const { surname, name, lastname, location, image } = info;
  const formData = new FormData();
  formData.append("surname", surname);
  formData.append("name", name);
  formData.append("lastname", lastname);
  formData.append("location", location);
  if (image) {
    formData.append("image", image);
  }

  const { data } = await $authHost.post("api/doc/setInfo", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
};

export const getInfo = async () => {
  const { data } = await $authHost.get("api/doc/getInfo");
  return data;
};

export const saveDateTable = async (date) => {
  const { data } = await $authHost.post("api/doc/saveDateTable", { date });
  return data;
};

export const getDateTable = async () => {
  const { data } = await $authHost.get("api/doc/getDateTable");
  return data;
};

export const saveCertificates = async (formData) => {
  try {
    const { data } = await $authHost.post(
      "api/doc/uploadCertificates",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return data;
  } catch (error) {
    throw new Error("Ошибка при загрузке сертификатов");
  }
};

export const getCertificates = async () => {
  try {
    const { data } = await $authHost.get("api/doc/getCertificates");
    return data;
  } catch (error) {
    throw new Error("Ошибка при получении сертификатов");
  }
};

export const deleteCertificate = async (filePath) => {
  try {
    const { data } = await $authHost.post("api/doc/deleteCertificate", {
      filePath,
    });
    return data;
  } catch (error) {
    throw new Error("Ошибка при удалении сертификата");
  }
};

export const getReviews= async()=>{
  const {data} = await $authHost.get("api/doc/getReviews")
  return data; 
}

export const getPatientBySlot = async( time, dateKey)=>{
  const {data} = await $authHost.get(`api/doc/getPatientBySlot/${dateKey}/${time}`)
  return data;
}
export const cancelAppointment = async (appointmentId,cancelReason) =>{
  const {data} = await $authHost.post("api/doc/cancelEntry", {appointmentId, cancelReason})
}