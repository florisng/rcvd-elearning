const API_URL = "http://localhost:4000/api/certificates";

export const requestCertificate = async (courseId, token) => {
  const response = await fetch(`${API_URL}/request/${courseId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to request certificate.");
  }

  return data;
};

export const getMyCertificateRequest = async (courseId, token) => {
  const response = await fetch(`${API_URL}/request/${courseId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to load certificate request.");
  }

  return data;
};
