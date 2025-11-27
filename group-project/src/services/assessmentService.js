const API_BASE_URL = "https://localhost:7087/api";

class AssessmentService {
  getAuthHeader() {
    const token = localStorage.getItem("token");
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }

  async getAllAssessments() {
    const response = await fetch(`${API_BASE_URL}/Assessment`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch assessments");
    }

    return await response.json();
  }

  async getAssessmentsByEmployer(employerId) {
    try {
      console.log('Fetching assessments for employer:', employerId);
      
      if (!employerId || employerId === 'undefined' || employerId === undefined) {
        console.error('❌ Invalid employerId:', employerId);
        throw new Error('Invalid employer ID');
      }

      const token = localStorage.getItem('token');
      console.log('Token exists:', !!token);
      
      const url = `${API_BASE_URL}/Assessment/employer/${employerId}`;
      console.log('Fetching from:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch assessments:', response.status, errorText);
        throw new Error(`Failed to fetch employer assessments: ${response.status}`);
      }

      const result = await response.json();
      console.log(' Assessments loaded:', result.length, 'items');
      return result;
    } catch (error) {
      console.error('❌ Error loading assessments:', error);
      throw error;
    }
  }

  async getAssessmentById(id) {
    const response = await fetch(`${API_BASE_URL}/Assessment/${id}`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch assessment");
    }

    return await response.json();
  }

  async createAssessment(assessmentData) {
    try {
      const token = localStorage.getItem('token');
      console.log('Creating assessment - Token exists:', !!token);
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log(' Assessment data:', JSON.stringify(assessmentData, null, 2));

      const response = await fetch(`${API_BASE_URL}/Assessment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(assessmentData)
      });

      console.log('Assessment creation response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Assessment creation failed:', response.status, errorText);
        throw new Error(`Failed to create assessment: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Assessment created successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Error creating assessment:', error);
      throw error;
    }
  }

  async updateAssessment(id, assessmentData) {
    const response = await fetch(`${API_BASE_URL}/Assessment/${id}`, {
      method: "PUT",
      headers: this.getAuthHeader(),
      body: JSON.stringify(assessmentData),
    });

    if (!response.ok) {
      throw new Error("Failed to update assessment");
    }

    return true;
  }

  async deleteAssessment(id) {
    const response = await fetch(`${API_BASE_URL}/Assessment/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error("Failed to delete assessment");
    }

    return true;
  }

  async toggleActive(id) {
    const response = await fetch(
      `${API_BASE_URL}/Assessment/${id}/toggle-active`,
      {
        method: "PUT",
        headers: this.getAuthHeader(),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to toggle assessment status");
    }

    return await response.json();
  }

  // New methods for job seekers
  async getMyAssignedAssessments() {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching my assigned assessments - Token exists:', !!token);
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const url = `${API_BASE_URL}/Assessment/my-assessments`;
      console.log('Fetching from:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch assigned assessments:', response.status, errorText);
        throw new Error(`Failed to fetch assigned assessments: ${response.status}`);
      }

      const result = await response.json();
      console.log('Assigned assessments loaded:', result.length, 'items');
      return result;
    } catch (error) {
      console.error('❌ Error loading assigned assessments:', error);
      throw error;
    }
  }

  async getAssignmentById(assignmentId) {
    const response = await fetch(`${API_BASE_URL}/Assessment/assignment/${assignmentId}`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch assignment");
    }

    return await response.json();
  }

  async startAssessment(assignmentId) {
    try {
      console.log('Starting assessment:', assignmentId);
      
      const response = await fetch(
        `${API_BASE_URL}/Assessment/assignment/${assignmentId}/start`,
        {
          method: 'PUT',
          headers: this.getAuthHeader(),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to start assessment:', response.status, errorText);
        throw new Error(`Failed to start assessment: ${response.status}`);
      }

      const result = await response.json();
      console.log('Assessment started:', result);
      return result;
    } catch (error) {
      console.error('❌ Error starting assessment:', error);
      throw error;
    }
  }

  async submitAssessment(assignmentId, responses) {
    try {
      console.log('Submitting assessment:', assignmentId, 'with', Object.keys(responses).length, 'answers');
      
      const response = await fetch(
        `${API_BASE_URL}/Assessment/assignment/${assignmentId}/submit`,
        {
          method: 'POST',
          headers: this.getAuthHeader(),
          body: JSON.stringify({ responses })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to submit assessment:', response.status, errorText);
        
        // Try to parse error message
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.message || `Failed to submit assessment: ${response.status}`);
        } catch {
          throw new Error(`Failed to submit assessment: ${response.status}`);
        }
      }

      const result = await response.json();
      console.log('Assessment submitted:', result);
      return result;
    } catch (error) {
      console.error('❌ Error submitting assessment:', error);
      throw error;
    }
  }

  // New methods for employers
  async getAssessmentSubmissions(assessmentId) {
    try {
      console.log('Fetching submissions for assessment:', assessmentId);
      
      const response = await fetch(
        `${API_BASE_URL}/Assessment/${assessmentId}/submissions`,
        {
          headers: this.getAuthHeader(),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch submissions:', response.status, errorText);
        throw new Error(`Failed to fetch submissions: ${response.status}`);
      }

      const result = await response.json();
      console.log('Submissions loaded:', result.length, 'items');
      return result;
    } catch (error) {
      console.error('❌ Error loading submissions:', error);
      throw error;
    }
  }

  async updateAssignmentScore(assignmentId, score) {
    try {
      console.log('Updating score for assignment:', assignmentId, 'to', score);
      
      const response = await fetch(
        `${API_BASE_URL}/Assessment/assignment/${assignmentId}/score`,
        {
          method: 'PUT',
          headers: this.getAuthHeader(),
          body: JSON.stringify({ score })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to update score:', response.status, errorText);
        throw new Error(`Failed to update score: ${response.status}`);
      }

      const result = await response.json();
      console.log('Score updated:', result);
      return result;
    } catch (error) {
      console.error('❌ Error updating score:', error);
      throw error;
    }
  }
}

export const assessmentService = new AssessmentService();
