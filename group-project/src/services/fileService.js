const API_URL = "https://localhost:7087/api";

export async function uploadCV(token, jobSeekerId, file) {
  if (!token || !jobSeekerId || !file) {
    throw new Error("Token, jobSeekerId, and file are required");
  }

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(`${API_URL}/JobSeeker/${jobSeekerId}/upload-cv`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // Don't set Content-Type for FormData - browser will set it with boundary
      },
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = `Upload failed with status ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.errors?.join(", ") || errorMessage;
      } catch {
        // ignore JSON parse error if no body
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log("CV upload successful:", data);
    return data;
  } catch (error) {
    console.error("CV upload error:", error);
    throw error;
  }
}

export async function getCVInfo(token, jobSeekerId) {
  if (!token || !jobSeekerId) {
    throw new Error("Token and jobSeekerId are required");
  }

  try {
    const response = await fetch(`${API_URL}/JobSeeker/${jobSeekerId}/cv-info`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 404) {
      // No CV uploaded yet
      return null;
    }

    if (!response.ok) {
      throw new Error(`Failed to get CV info: ${response.status}`);
    }

    const data = await response.json();
    console.log("CV info retrieved:", data);
    return data;
  } catch (error) {
    console.error("Get CV info error:", error);
    throw error;
  }
}

export async function downloadCV(token, fileId) {
  if (!token || !fileId) {
    throw new Error("Token and fileId are required");
  }

  try {
    console.log(`Attempting to download CV from: ${API_URL}/FileUpload/cv/${fileId}`);
    
    const response = await fetch(`${API_URL}/FileUpload/cv/${fileId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(`Download response status: ${response.status}`);
    console.log(`Download response headers:`, [...response.headers.entries()]);

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`Download error response body:`, errorText);
      throw new Error(`Failed to download CV: ${response.status} - ${errorText}`);
    }

    // Get the filename from the response headers
    const contentDisposition = response.headers.get("Content-Disposition");
    let filename = "cv-document";
    if (contentDisposition && contentDisposition.includes("filename=")) {
      const matches = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (matches && matches[1]) {
        filename = matches[1].replace(/['"]/g, '');
      }
    }

    const blob = await response.blob();
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    return true;
  } catch (error) {
    console.error("Download CV error:", error);
    throw error;
  }
}

export async function deleteCV(token, fileId) {
  if (!token || !fileId) {
    throw new Error("Token and fileId are required");
  }

  try {
    console.log(`Attempting to delete CV at: ${API_URL}/FileUpload/${fileId}`);
    
    const response = await fetch(`${API_URL}/FileUpload/${fileId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log(`Delete response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`Delete error response body:`, errorText);
      throw new Error(`Failed to delete CV: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("CV deleted successfully:", data);
    return data;
  } catch (error) {
    console.error("Delete CV error:", error);
    throw error;
  }
}

// Profile Picture Functions

export async function uploadProfilePicture(token, file) {
  if (!token || !file) {
    throw new Error("Token and file are required");
  }

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(`${API_URL}/FileUpload/upload-profile-picture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = `Upload failed with status ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.errors?.join(", ") || errorMessage;
      } catch {
        // ignore JSON parse error if no body
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log("Profile picture upload successful:", data);
    return data;
  } catch (error) {
    console.error("Profile picture upload error:", error);
    throw error;
  }
}

export async function uploadProfilePictureBase64(token, base64String, fileName = "camera-capture.jpg", contentType = "image/jpeg") {
  if (!token || !base64String) {
    throw new Error("Token and base64String are required");
  }

  try {
    const response = await fetch(`${API_URL}/FileUpload/upload-profile-picture-base64`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        base64String,
        fileName,
        contentType,
      }),
    });

    if (!response.ok) {
      let errorMessage = `Upload failed with status ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.errors?.join(", ") || errorMessage;
      } catch {
        // ignore JSON parse error if no body
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log("Profile picture (base64) upload successful:", data);
    return data;
  } catch (error) {
    console.error("Profile picture (base64) upload error:", error);
    throw error;
  }
}

export async function uploadCompanyLogo(token, file) {
  if (!token || !file) {
    throw new Error("Token and file are required");
  }

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(`${API_URL}/FileUpload/upload-company-logo`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = `Upload failed with status ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.errors?.join(", ") || errorMessage;
      } catch {
        // ignore JSON parse error if no body
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log("Company logo upload successful:", data);
    return data;
  } catch (error) {
    console.error("Company logo upload error:", error);
    throw error;
  }
}

export function getProfilePictureUrl(fileId) {
  if (!fileId) return null;
  return `${API_URL}/FileUpload/profile-picture/${fileId}`;
}

export async function deleteProfilePicture(token, fileId) {
  if (!token || !fileId) {
    throw new Error("Token and fileId are required");
  }

  try {
    const response = await fetch(`${API_URL}/FileUpload/profile-picture/${fileId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to delete profile picture: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("Profile picture deleted successfully:", data);
    return data;
  } catch (error) {
    console.error("Delete profile picture error:", error);
    throw error;
  }
}