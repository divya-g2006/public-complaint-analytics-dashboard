// import { apiClient } from "./apiClient.js";

// export const complaintService = {
//   async create(payload) {
//     const isFormData = typeof FormData !== "undefined" && payload instanceof FormData;
//     const { data } = await apiClient.post(
//       "/api/complaints",
//       payload,
//       isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : undefined
//     );
//     return data;
//   },
//   async listMine(params) {
//     const { data } = await apiClient.get("/api/complaints/my", { params });
//     return data;
//   },
//   async listAll(params) {
//     const { data } = await apiClient.get("/api/complaints", { params });
//     return data;
//   },
//   async updateStatus(id, status) {
//     const { data } = await apiClient.patch(`/api/complaints/${id}/status`, { status });
//     return data;
//   },
//   async remove(id) {
//     const { data } = await apiClient.delete(`/api/complaints/${id}`);
//     return data;
//   }
// };



import { apiClient } from "./apiClient.js";

export const complaintService = {
  // Create a new complaint
  async create(payload) {
    const isFormData = typeof FormData !== "undefined" && payload instanceof FormData;
    const { data } = await apiClient.post(
      "/complaints", // removed extra /api
      payload,
      isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : undefined
    );
    return data;
  },

  // List complaints for the logged-in user
  async listMine(params) {
    const { data } = await apiClient.get("/complaints/my", { params }); // removed extra /api
    return data;
  },

  // List all complaints (admin)
  async listAll(params) {
    const { data } = await apiClient.get("/complaints", { params }); // removed extra /api
    return data;
  },

  // Update the status of a complaint
  async updateStatus(id, status) {
    const { data } = await apiClient.patch(`/complaints/${id}/status`, { status }); // removed extra /api
    return data;
  },

  // Delete a complaint
  async remove(id) {
    const { data } = await apiClient.delete(`/complaints/${id}`); // removed extra /api
    return data;
  },

  // Submit rating + feedback after complaint is resolved (user only)
  async submitFeedback(id, rating, feedback) {
    const token = localStorage.getItem("token") || localStorage.getItem("cad_token");
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
    const { data } = await apiClient.post(
      `/complaints/${id}/feedback`,
      {
        rating,
        feedback
      },
      config
    );
    return data;
  },

  // User confirmation step for completion
  async confirmCompletion(id, confirmed) {
    const { data } = await apiClient.post(`/complaints/${id}/confirm`, { confirmed });
    return data;
  }
};
