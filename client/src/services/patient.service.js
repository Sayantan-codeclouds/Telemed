import api from "@/api/axios";

export const registerPatient = async (data) => {
  const response = await api.post("/patients/register", data);
  return response.data;
};

export const loginPatient = async (data) => {
  const response = await api.post("/patients/login", data);
  return response.data;
};

