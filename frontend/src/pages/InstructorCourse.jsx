import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API_URL from "../api";

const InstructorCourse = () => {
  const { id } = useParams();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // =========================
  // CHAPTER MANAGEMENT
  // =========================

  const [addingChapter, setAddingChapter] = useState(false);
  const [chapterTitle, setChapterTitle] = useState("");
  const [editingChapterId, setEditingChapterId] = useState(null);
  const [editingChapterTitle, setEditingChapterTitle] = useState("");
  const [chapterSaving, setChapterSaving] = useState(false);

  // =========================
  // SUBCHAPTER MANAGEMENT
  // =========================

  const [addingSubchapterTo, setAddingSubchapterTo] = useState(null);

  const [subchapterForm, setSubchapterForm] = useState({
    title: "",
    content: "",
  });

  const [editingSubchapterId, setEditingSubchapterId] = useState(null);

  const [editingSubchapterForm, setEditingSubchapterForm] = useState({
    title: "",
    content: "",
  });

  const [subchapterSaving, setSubchapterSaving] = useState(false);

  // =========================
  // COURSE FORM
  // =========================

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
  });

  // =========================
  // LOAD COURSE
  // =========================

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/api/instructor/courses/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load course.");
      }

      setCourse(data);

      setForm({
        title: data.title || "",
        description: data.description || "",
        price: data.price || "",
      });
    } catch (err) {
      console.error("Error loading instructor course:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // COURSE FORM CHANGE
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================
  // UPDATE COURSE
  // =========================

  const handleUpdate = async (e) => {
    e.preventDefault();

    setSaving(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/api/instructor/courses/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          price: Number(form.price),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update course.");
      }

      setCourse((prev) => ({
        ...prev,
        ...data.course,
      }));

      setEditing(false);
    } catch (err) {
      console.error("Error updating course:", err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // CREATE CHAPTER
  // =========================

  const handleCreateChapter = async (e) => {
    e.preventDefault();

    if (!chapterTitle.trim()) {
      return;
    }

    setChapterSaving(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/api/courses/${id}/chapters`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: chapterTitle.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create chapter.");
      }

      setCourse((prev) => ({
        ...prev,
        chapters: [...(prev.chapters || []), { ...data, subchapters: [] }],
      }));

      setChapterTitle("");
      setAddingChapter(false);
    } catch (err) {
      console.error("Error creating chapter:", err);
      setError(err.message);
    } finally {
      setChapterSaving(false);
    }
  };

  // =========================
  // UPDATE CHAPTER
  // =========================

  const handleUpdateChapter = async (chapterId) => {
    if (!editingChapterTitle.trim()) {
      return;
    }

    setChapterSaving(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/api/chapters/${chapterId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editingChapterTitle.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update chapter.");
      }

      setCourse((prev) => ({
        ...prev,
        chapters: prev.chapters.map((chapter) =>
          chapter.id === chapterId
            ? { ...chapter, title: data.title }
            : chapter,
        ),
      }));

      setEditingChapterId(null);
      setEditingChapterTitle("");
    } catch (err) {
      console.error("Error updating chapter:", err);
      setError(err.message);
    } finally {
      setChapterSaving(false);
    }
  };

  // =========================
  // DELETE CHAPTER
  // =========================

  const handleDeleteChapter = async (chapterId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this chapter?",
    );

    if (!confirmed) {
      return;
    }

    setChapterSaving(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/api/chapters/${chapterId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete chapter.");
      }

      setCourse((prev) => ({
        ...prev,
        chapters: prev.chapters.filter((chapter) => chapter.id !== chapterId),
      }));
    } catch (err) {
      console.error("Error deleting chapter:", err);
      setError(err.message);
    } finally {
      setChapterSaving(false);
    }
  };

  // =========================
  // SUBCHAPTER FORM CHANGE
  // =========================

  const handleSubchapterChange = (e) => {
    const { name, value } = e.target;

    setSubchapterForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================
  // CREATE SUBCHAPTER
  // =========================

  const handleCreateSubchapter = async (e, chapterId) => {
    e.preventDefault();

    if (!subchapterForm.title.trim() || !subchapterForm.content.trim()) {
      return;
    }

    setSubchapterSaving(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_URL}/api/chapters/${chapterId}/subchapters`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: subchapterForm.title.trim(),
            content: subchapterForm.content.trim(),
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create subchapter.");
      }

      setCourse((prev) => ({
        ...prev,
        chapters: prev.chapters.map((chapter) =>
          chapter.id === chapterId
            ? {
                ...chapter,
                subchapters: [...(chapter.subchapters || []), data],
              }
            : chapter,
        ),
      }));

      setSubchapterForm({
        title: "",
        content: "",
      });

      setAddingSubchapterTo(null);
    } catch (err) {
      console.error("Error creating subchapter:", err);
      setError(err.message);
    } finally {
      setSubchapterSaving(false);
    }
  };

  // =========================
  // EDIT SUBCHAPTER
  // =========================

  const handleEditingSubchapterChange = (e) => {
    const { name, value } = e.target;

    setEditingSubchapterForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================
  // UPDATE SUBCHAPTER
  // =========================

  const handleUpdateSubchapter = async (subchapterId, chapterId) => {
    if (
      !editingSubchapterForm.title.trim() ||
      !editingSubchapterForm.content.trim()
    ) {
      return;
    }

    setSubchapterSaving(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/api/subchapters/${subchapterId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editingSubchapterForm.title.trim(),
          content: editingSubchapterForm.content.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update subchapter.");
      }

      setCourse((prev) => ({
        ...prev,
        chapters: prev.chapters.map((chapter) =>
          chapter.id === chapterId
            ? {
                ...chapter,
                subchapters: chapter.subchapters.map((subchapter) =>
                  subchapter.id === subchapterId ? data : subchapter,
                ),
              }
            : chapter,
        ),
      }));

      setEditingSubchapterId(null);

      setEditingSubchapterForm({
        title: "",
        content: "",
      });
    } catch (err) {
      console.error("Error updating subchapter:", err);
      setError(err.message);
    } finally {
      setSubchapterSaving(false);
    }
  };

  // =========================
  // DELETE SUBCHAPTER
  // =========================

  const handleDeleteSubchapter = async (subchapterId, chapterId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this subchapter?",
    );

    if (!confirmed) {
      return;
    }

    setSubchapterSaving(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/api/subchapters/${subchapterId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete subchapter.");
      }

      setCourse((prev) => ({
        ...prev,
        chapters: prev.chapters.map((chapter) =>
          chapter.id === chapterId
            ? {
                ...chapter,
                subchapters: chapter.subchapters.filter(
                  (subchapter) => subchapter.id !== subchapterId,
                ),
              }
            : chapter,
        ),
      }));
    } catch (err) {
      console.error("Error deleting subchapter:", err);
      setError(err.message);
    } finally {
      setSubchapterSaving(false);
    }
  };

  // =========================
  // LOADING / ERROR
  // =========================

  if (loading) {
    return <p>Loading course...</p>;
  }

  if (error && !course) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  if (!course) {
    return null;
  }

  const isPublished = course.status === "PUBLISHED";

  // =========================
  // RENDER
  // =========================

  return (
    <div className="container py-5">
      {error && <div className="alert alert-danger">{error}</div>}

      {!editing ? (
        <>
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h1>{course.title}</h1>

              <p className="text-muted">{course.description}</p>
            </div>

            <button
              className="btn btn-primary"
              onClick={() => setEditing(true)}
              disabled={isPublished}
            >
              Edit Course
            </button>
          </div>

          <div className="mb-4">
            <strong>Price:</strong> {Number(course.price).toLocaleString()} RWF
          </div>

          <hr />

          {/* =========================
              CHAPTERS
          ========================= */}

          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="mb-0">Chapters</h2>

            {!addingChapter && (
              <button
                className="btn btn-success"
                onClick={() => setAddingChapter(true)}
                disabled={isPublished}
              >
                + Add Chapter
              </button>
            )}
          </div>

          {/* ADD CHAPTER */}

          {addingChapter && (
            <div className="card mb-4">
              <div className="card-body">
                <h5>Add Chapter</h5>

                <form onSubmit={handleCreateChapter}>
                  <div className="mb-3">
                    <label className="form-label">Chapter Title</label>

                    <input
                      type="text"
                      className="form-control"
                      value={chapterTitle}
                      onChange={(e) => setChapterTitle(e.target.value)}
                      placeholder="Enter chapter title"
                      required
                      disabled={isPublished}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-success me-2"
                    disabled={chapterSaving || isPublished}
                  >
                    {chapterSaving ? "Saving..." : "Save Chapter"}
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setAddingChapter(false);
                      setChapterTitle("");
                    }}
                    disabled={chapterSaving}
                  >
                    Cancel
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* CHAPTER LIST */}

          {course.chapters?.length === 0 && (
            <div className="alert alert-info">
              No chapters have been added yet.
            </div>
          )}

          {course.chapters?.map((chapter, index) => (
            <div key={chapter.id} className="card mb-4 shadow-sm">
              {/* CHAPTER HEADER */}

              <div className="card-header">
                {editingChapterId === chapter.id ? (
                  <div>
                    <input
                      type="text"
                      className="form-control mb-2"
                      value={editingChapterTitle}
                      onChange={(e) => setEditingChapterTitle(e.target.value)}
                      disabled={isPublished}
                    />

                    <button
                      className="btn btn-sm btn-success me-2"
                      onClick={() => handleUpdateChapter(chapter.id)}
                      disabled={chapterSaving || isPublished}
                    >
                      Save
                    </button>

                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => {
                        setEditingChapterId(null);
                        setEditingChapterTitle("");
                      }}
                      disabled={chapterSaving}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="d-flex justify-content-between align-items-center">
                    <h4 className="mb-0">
                      Chapter {index + 1}: {chapter.title}
                    </h4>

                    <div>
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => {
                          setEditingChapterId(chapter.id);
                          setEditingChapterTitle(chapter.title);
                        }}
                        disabled={chapterSaving || isPublished}
                      >
                        Edit
                      </button>

                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDeleteChapter(chapter.id)}
                        disabled={chapterSaving || isPublished}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* CHAPTER BODY */}

              <div className="card-body">
                {/* ADD SUBCHAPTER BUTTON */}

                {addingSubchapterTo !== chapter.id && (
                  <button
                    className="btn btn-sm btn-success mb-3"
                    onClick={() => {
                      setAddingSubchapterTo(chapter.id);

                      setSubchapterForm({
                        title: "",
                        content: "",
                      });
                    }}
                    disabled={isPublished}
                  >
                    + Add Subchapter
                  </button>
                )}

                {/* ADD SUBCHAPTER FORM */}

                {addingSubchapterTo === chapter.id && (
                  <div className="card bg-light mb-4">
                    <div className="card-body">
                      <h5>Add Subchapter</h5>

                      <form
                        onSubmit={(e) => handleCreateSubchapter(e, chapter.id)}
                      >
                        <div className="mb-3">
                          <label className="form-label">Subchapter Title</label>

                          <input
                            type="text"
                            name="title"
                            className="form-control"
                            value={subchapterForm.title}
                            onChange={handleSubchapterChange}
                            required
                            disabled={isPublished}
                          />
                        </div>

                        <div className="mb-3">
                          <label className="form-label">Content</label>

                          <textarea
                            name="content"
                            className="form-control"
                            rows="5"
                            value={subchapterForm.content}
                            onChange={handleSubchapterChange}
                            required
                            disabled={isPublished}
                          />
                        </div>

                        <button
                          type="submit"
                          className="btn btn-success me-2"
                          disabled={subchapterSaving || isPublished}
                        >
                          {subchapterSaving ? "Saving..." : "Save Subchapter"}
                        </button>

                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => {
                            setAddingSubchapterTo(null);

                            setSubchapterForm({
                              title: "",
                              content: "",
                            });
                          }}
                          disabled={subchapterSaving}
                        >
                          Cancel
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                {/* SUBCHAPTER LIST */}

                {chapter.subchapters?.length > 0 ? (
                  chapter.subchapters.map((subchapter, subIndex) => (
                    <div key={subchapter.id} className="border-bottom py-3">
                      {editingSubchapterId === subchapter.id ? (
                        <div>
                          <div className="mb-3">
                            <label className="form-label">
                              Subchapter Title
                            </label>

                            <input
                              type="text"
                              name="title"
                              className="form-control"
                              value={editingSubchapterForm.title}
                              onChange={handleEditingSubchapterChange}
                              disabled={isPublished}
                            />
                          </div>

                          <div className="mb-3">
                            <label className="form-label">Content</label>

                            <textarea
                              name="content"
                              className="form-control"
                              rows="5"
                              value={editingSubchapterForm.content}
                              onChange={handleEditingSubchapterChange}
                              disabled={isPublished}
                            />
                          </div>

                          <button
                            className="btn btn-sm btn-success me-2"
                            onClick={() =>
                              handleUpdateSubchapter(subchapter.id, chapter.id)
                            }
                            disabled={subchapterSaving}
                          >
                            Save
                          </button>

                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => {
                              setEditingSubchapterId(null);

                              setEditingSubchapterForm({
                                title: "",
                                content: "",
                              });
                            }}
                            disabled={subchapterSaving}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <h5>
                                {index + 1}.{subIndex + 1} {subchapter.title}
                              </h5>

                              <p className="text-muted mb-2">
                                {subchapter.content}
                              </p>
                            </div>

                            <div className="ms-3 text-nowrap">
                              <button
                                className="btn btn-sm btn-outline-primary me-2"
                                onClick={() => {
                                  setEditingSubchapterId(subchapter.id);

                                  setEditingSubchapterForm({
                                    title: subchapter.title,
                                    content: subchapter.content || "",
                                  });
                                }}
                                disabled={subchapterSaving}
                              >
                                Edit
                              </button>

                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() =>
                                  handleDeleteSubchapter(
                                    subchapter.id,
                                    chapter.id,
                                  )
                                }
                                disabled={subchapterSaving}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-muted mb-0">No subchapters yet.</p>
                )}
              </div>
            </div>
          ))}
        </>
      ) : (
        <>
          <h1 className="mb-4">Edit Course</h1>

          <form onSubmit={handleUpdate}>
            <div className="mb-3">
              <label className="form-label">Course Title</label>

              <input
                type="text"
                name="title"
                className="form-control"
                value={form.title}
                onChange={handleChange}
                required
                disabled={isPublished}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Description</label>

              <textarea
                name="description"
                className="form-control"
                rows="4"
                value={form.description}
                onChange={handleChange}
                required
                disabled={isPublished}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Price (RWF)</label>

              <input
                type="number"
                name="price"
                className="form-control"
                value={form.price}
                onChange={handleChange}
                min="0"
                required
                disabled={isPublished}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary me-2"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setEditing(false)}
              disabled={saving}
            >
              Cancel
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default InstructorCourse;
