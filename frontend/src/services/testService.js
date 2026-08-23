const API_URL = "https://rcvd-elearning-production.up.railway.app/api";

// Start a test
export const startTest = async (testId, token) => {
  const response = await fetch(`${API_URL}/tests/${testId}/start`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to start test.");
  }

  return data;
};

// Get test attempts
export const getTestAttempts = async (testId, token) => {
  const response = await fetch(`${API_URL}/tests/${testId}/attempts`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to load test attempts.");
  }

  return data;
};

// Resume an attempt
export const resumeTest = async (attemptId, token) => {
  const response = await fetch(
    `${API_URL}/tests/attempts/${attemptId}/resume`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to resume test.");
  }

  return data;
};

// Save an answer
export const saveAnswer = async (attemptId, questionId, optionId, token) => {
  const response = await fetch(`${API_URL}/attempts/${attemptId}/answers`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      question_id: questionId,
      option_id: optionId,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to save answer.");
  }

  return data;
};

// Submit a test
export const submitTest = async (attemptId, answers, token) => {
  const response = await fetch(
    `${API_URL}/tests/attempts/${attemptId}/submit`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        answers,
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to submit test.");
  }

  return data;
};
