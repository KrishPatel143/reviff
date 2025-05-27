import apiClient from "../apiClient";

export const getServices = async (queryParams) => {
  try {
    const response = await apiClient.get(`/?${queryParams}`);

    return response.data;
  } catch (error) {
    console.error("Login error", error);
    throw error;
  }
};
export const getServiceById = async (id) => {
  try {
    const response = await apiClient.get(`/service/${id}`);

    return response.data;
  } catch (error) {
    console.error("Login error", error);
    throw error;
  }
};
export const getSellerServices = async () => {
  try {
    const response = await apiClient.get(`/seller/services`);

    return response.data;
  } catch (error) {
    console.error("Login error", error);
    throw error;
  }
};
export const deleteService = async (id) => {
  try {
    const response = await apiClient.delete(`/delete/${id}`);

    return response.data;
  } catch (error) {
    console.error("Login error", error);
    throw error;
  }
};
export const AddService = async (data) => {
  try {
    console.log(data);
    const response = await apiClient.post(`/add`,data);

    return response.data;
  } catch (error) {
    console.error("Login error", error);
    throw error;
  }
};
export const updateService = async (id,data) => {
  try {
    const response = await apiClient.put(`/update/${id}`,data);
    return response;
  } catch (error) {
    console.error("Login error", error);
    throw error;
  }
};
