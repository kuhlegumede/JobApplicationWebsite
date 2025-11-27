const API_URL = "https://localhost:7087/api";

export const userService = {
  async getAllUsers() {
    const token = localStorage.getItem("token");
    console.log("Token being sent:", token);
    try {
      const response = await fetch(`${API_URL}/User`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },

  async deleteUser(userId) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/User/${userId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to delete user");
    }

    return true;
  },

  async updateUserRole(userId, userRole) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/User/${userId}/role`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userRole }),
    });

    if (!response.ok) {
      throw new Error("Failed to update user role");
    }

    return await response.json();
  },
};
