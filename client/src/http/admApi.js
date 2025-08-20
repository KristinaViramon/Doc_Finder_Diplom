import { $authHost } from "./http";

export const getUsers = async () => {
  const { data } = await $authHost.get("api/adm/getUsers");
  return data;
};

export const saveData = async (
  selectedEmail,
  selectedRole,
  selectedSpecialization,
  description,
  experience
) => {
  const { data } = await $authHost.post("api/adm/saveData", {
    selectedEmail,
    selectedRole,
    selectedSpecialization,
    description,
    experience,
  });
  return data;
};

export const deleteReview = async (
 idReview
) => {
  const { data } = await $authHost.post("api/adm/deleteReview", {
    idReview
  });
  return data;
};
