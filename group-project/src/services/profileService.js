const API_URL = "https://localhost:7087/api";

export async function getProfileData(token, userId) {
  if (!token || !userId) {
    console.error("Missing required parameters:", { token: !!token, userId });
    throw new Error("Token and userId are required");
  }

  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await fetch(`${API_URL}/User/${userId}`, { headers });
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      console.error("Profile fetch failed:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Failed to fetch user data: ${response.status} ${response.statusText}`);
    }

    const userData = await response.json();
    console.log("Profile data fetched successfully:", userData);
    return userData;
  } catch (error) {
    console.error("Error in getProfileData:", error);
    throw error;
  }
}

export async function updateJobSeekerProfile(token, jobSeekerId, updatedData) {
  if (!token || !jobSeekerId) {
    throw new Error("Token and jobSeekerId are required");
  }

  try {
    console.log("Sending update request with data:", updatedData);

    // Create the DTO matching backend expectations
    const dto = {
      jobSeekerId: updatedData.jobSeekerId,
      userId: updatedData.userId,
      resumeFileId: updatedData.resumeFileId || null,
      skills: updatedData.skills,
      experience: updatedData.experience || "",
      education: updatedData.education,
      coverLetter: updatedData.coverLetter || "",
      phoneNumber: updatedData.phoneNumber,
    };

    const response = await fetch(`${API_URL}/JobSeeker/${jobSeekerId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dto),
    });

    // Log the raw response
    console.log("Response status:", response.status);

    if (!response.ok) {
      let errorMessage = `Server returned ${response.status}`;
      try {
        const errorData = await response.json();
        console.error("Error details:", errorData);
        
        // Handle validation errors
        if (errorData.errors) {
          const errorMessages = Object.entries(errorData.errors)
            .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
            .join("\n");
          errorMessage = errorMessages || errorMessage;
        } else {
          errorMessage = errorData.message || errorData.title || errorMessage;
        }
      } catch {
        // ignore JSON parse error if no body
        const errorText = await response.text();
        if (errorText) errorMessage = errorText;
      }
      throw new Error(errorMessage);
    }

    // Only parse JSON if there is content
    if (response.status !== 204) {
      const data = await response.json();
      console.log("Response data:", data);
      return data;
    }

    console.log("Profile updated successfully (204 No Content)");
    return null; // No content to return for 204
  } catch (error) {
    console.error("Profile update error:", error);
    throw error;
  }
}
export async function updateEmployerProfile(token, employerId, updatedData) {
  if (!token || !employerId) {
    throw new Error("Token and employerId are required");
  }

  try {
    console.log("Updating employer profile");
    console.log("Employer ID:", employerId);
    console.log("Update data:", JSON.stringify(updatedData, null, 2));

    // Create the DTO matching backend expectations
    const dto = {
      employerId: updatedData.employerId,
      userId: updatedData.userId,
      companyName: updatedData.companyName,
      companyDescription: updatedData.companyDescription || "",
      location: updatedData.location,
      website: updatedData.website || "",
    };

    const response = await fetch(`${API_URL}/Employer/${employerId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dto),
    });

    console.log("Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Update failed - Raw error:", errorText);
      
      let errorMessage = `Server returned ${response.status}`;
      try {
        const errorData = JSON.parse(errorText);
        console.error("Parsed error:", errorData);
        
        // Handle validation errors
        if (errorData.errors) {
          console.error("Validation errors:", errorData.errors);
          const errorMessages = Object.entries(errorData.errors)
            .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
            .join("\n");
          errorMessage = errorMessages || errorMessage;
        } else {
          errorMessage = errorData.message || errorData.title || errorMessage;
        }
      } catch {
        console.error("Could not parse error as JSON");
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    // Only parse JSON if there is content
    if (response.status !== 204) {
      const data = await response.json();
      console.log("Profile updated successfully:", data);
      return data;
    }

    console.log("Profile updated (204 No Content)");
    return null; // No content to return for 204
  } catch (error) {
    console.error("❌ Employer profile update error:", error);
    throw error;
  }
}
