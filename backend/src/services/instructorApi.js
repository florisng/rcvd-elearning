const API = "http://localhost:4000/api";

export const createCourse = async (instructorId, data) => {
  const res = await fetch(`${API}/instructor/${instructorId}/courses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const createChapter = async (courseId, data) => {
  const res = await fetch(`${API}/courses/${courseId}/chapters`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const createSubchapter = async (chapterId, data) => {
  const res = await fetch(`${API}/chapters/${chapterId}/subchapters`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res.json();
};
