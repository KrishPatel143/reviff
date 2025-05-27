import apiClient from "../apiClient";

const ORDER_BASE = '/order';

export const addOrder = async (data) => {
  try {
    const response = await apiClient.post(`${ORDER_BASE}/create`, data);
    return response.data;
  } catch (error) {
    console.error("Order creation error", error);
    throw error;
  }
};

export const getOrders = async () => {
  try {
    const response = await apiClient.get(`${ORDER_BASE}`);
    return response.data;
  } catch (error) {
    console.error("Get orders error", error);
    throw error;
  }
};

export const getBuyerOrders = async () => {
  try {
    const response = await apiClient.get(`${ORDER_BASE}/buyer`);
    return response.data;
  } catch (error) {
    console.error("Get buyer orders error", error);
    throw error;
  }
};

export const getSellerOrders = async () => {
  try {
    const response = await apiClient.get(`${ORDER_BASE}/seller`);
    return response.data;
  } catch (error) {
    console.error("Get seller orders error", error);
    throw error;
  }
};

export const getOrderById = async (orderId) => {
  try {
    const response = await apiClient.get(`${ORDER_BASE}/${orderId}`);
    return response.data;
  } catch (error) {
    console.error("Get order by ID error", error);
    throw error;
  }
};

export const updateOrder = async (orderId, data) => {
  try {
    const response = await apiClient.put(`${ORDER_BASE}/updateOrder/${orderId}`, data);
    return response.data;
  } catch (error) {
    console.error("Update order error", error);
    throw error;
  }
};  

export const deleteOrder = async (orderId) => {
  try {
    const response = await apiClient.delete(`${ORDER_BASE}/deleteOrder/${orderId}`);
    return response.data;
  } catch (error) {
    console.error("Delete order error", error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId, statusData) => {
  try {
    const response = await apiClient.put(`${ORDER_BASE}/${orderId}/status`, statusData);
    return response.data;
  } catch (error) {
    console.error("Update order status error", error);
    throw error;
  }
};

export const addMessage = async (orderId, messageData) => {
  try {
    console.log(messageData);
    
    const response = await apiClient.post(`${ORDER_BASE}/${orderId}/message`, messageData);
    return response.data;
  } catch (error) {
    console.error("Add message error", error);
    throw error;
  }
};

export const extendDelivery = async (orderId, extensionData) => {
  try {
    const response = await apiClient.put(`${ORDER_BASE}/${orderId}/extend-delivery`, extensionData);
    return response.data;
  } catch (error) {
    console.error("Extend delivery error", error);
    throw error;
  }
};

// Updated milestone completion function to work with milestone ID
export const completeMilestone = async (orderId, milestoneId, milestoneData) => {
  try {
    const response = await apiClient.post(`${ORDER_BASE}/${orderId}/milestone/${milestoneId}/complete`, milestoneData);
    return response.data;
  } catch (error) {
    console.error("Complete milestone error", error);
    throw error;
  }
};

// Add new milestone to order
export const addMilestone = async (orderId, milestoneData) => {
  try {
    const response = await apiClient.post(`${ORDER_BASE}/${orderId}/milestone`, milestoneData);
    return response.data;
  } catch (error) {
    console.error("Add milestone error", error);
    throw error;
  }
};

// Update milestone (for status changes, notes, etc.)
export const updateMilestone = async (orderId, milestoneId, milestoneData) => {
  try {
    const response = await apiClient.put(`${ORDER_BASE}/${orderId}/milestone/${milestoneId}`, milestoneData);
    return response.data;
  } catch (error) {
    console.error("Update milestone error", error);
    throw error;
  }
};


// Delete milestone
export const deleteMilestone = async (orderId, milestoneId) => {
  try {
    const response = await apiClient.delete(`${ORDER_BASE}/${orderId}/milestone/${milestoneId}`);
    return response.data;
  } catch (error) {
    console.error("Delete milestone error", error);
    throw error;
  }
};

// Request milestone revision
export const requestMilestoneRevision = async (orderId, milestoneId, revisionData) => {
  try {
    const response = await apiClient.post(`${ORDER_BASE}/${orderId}/milestone/${milestoneId}/revision`, revisionData);
    return response.data;
  } catch (error) {
    console.error("Request milestone revision error", error);
    throw error;
  }
};

// Approve milestone (buyer action)
export const approveMilestone = async (orderId, milestoneId, approvalData) => {
  try {
    const response = await apiClient.post(`${ORDER_BASE}/${orderId}/milestone/${milestoneId}/approve`, approvalData);
    return response.data;
  } catch (error) {
    console.error("Approve milestone error", error);
    throw error;
  }
};

export const uploadFile = async (orderId, fileData) => {
  try {
    const response = await apiClient.post(`${ORDER_BASE}/${orderId}/file`, fileData);
    return response.data;
  } catch (error) {
    console.error("Upload file error", error);
    throw error;
  }
};

export const submitReview = async (orderId, reviewData) => {
  try {
    const response = await apiClient.post(`${ORDER_BASE}/${orderId}/review`, reviewData);
    return response.data;
  } catch (error) {
    console.error("Submit review error", error);
    throw error;
  }
};

export const requestCancellation = async (orderId, cancellationData) => {
  try {
    const response = await apiClient.post(`${ORDER_BASE}/${orderId}/cancel`, cancellationData);
    return response.data;
  } catch (error) {
    console.error("Request cancellation error", error);
    throw error;
  }
};
const FILE_BASE = '';
export const uploadSingleFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post(`${FILE_BASE}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error("Single file upload error", error);
    throw error;
  }
};

// Multiple files upload function
export const uploadMultipleFiles = async (files) => {
  try {
    const formData = new FormData();
    
    // Append multiple files to FormData
    Array.from(files).forEach((file, index) => {
      formData.append('files', file);
    });
    
    const response = await apiClient.post(`${FILE_BASE}/upload-multiple`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error("Multiple files upload error", error);
    throw error;
  }
};

// Function to get uploaded file URL or serve file
export const getUploadedFile = async (filename) => {
  try {
    const response = await apiClient.get(`${FILE_BASE}/uploads/${filename}`);
    return response.data;
  } catch (error) {
    console.error("Get uploaded file error", error);
    throw error;
  }
};

// Function to get file URL for direct access (useful for images, etc.)
export const getFileUrl = (filename) => {
  return `${FILE_BASE}/uploads/${filename}`;
};
