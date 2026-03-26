// import { apiClient } from "./apiClient.js";

// export const authService = {
//   async register(payload) {
//     const { data } = await apiClient.post("/api/auth/register", payload);
//     return data;
//   },
//   async login(payload) {
//     const { data } = await apiClient.post("/api/auth/login", payload);
//     return data;
//   },
//   async me() {
//     const { data } = await apiClient.get("/api/auth/me");
//     return data;
//   }
// };

import { apiClient } from "./apiClient.js";

export const authService = {
  async register(payload) {
    const { data } = await apiClient.post("/auth/register", payload); // remove extra /api
    return data;
  },
  async login(payload) {
    const { data } = await apiClient.post("/auth/login", payload); // remove extra /api
    return data;
  },
  async me() {
    const { data } = await apiClient.get("/auth/me"); // remove extra /api
    return data;
  }
};
