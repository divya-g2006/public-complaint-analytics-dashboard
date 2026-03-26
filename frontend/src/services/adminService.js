import { apiClient } from "./apiClient.js";

export const adminService = {
  async updateProfile({ email, password } = {}) {
    // Send only provided fields (password can be omitted to update email only)
    const payload = {};
    if (email !== undefined) payload.email = email;
    if (password !== undefined) payload.password = password;

    const { data } = await apiClient.put("/admin/update-profile", payload);
    return data;
  }
};

