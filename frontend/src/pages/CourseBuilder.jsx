import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API_URL from "../api";
import "./css/CourseBuilder.css";

const CourseBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Edit course
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [coursePrice, setCoursePrice] = useState("");
  const [courseDuration, setCourseDuration] = useState("");
  const [savingCourse, setSavingCourse] = useState(false);

  // Chapter form
  const [showChapterForm, setShowChapterForm] = useState(false);
  const [chapterTitle, setChapterTitle] = useState("");
  const [savingChapter, setSavingChapter] = useState(false);

  // Edit chapter
  const [editingChapter, setEditingChapter] = useState(null);
  const [editingChapterTitle, setEditingChapterTitle] = useState("");
  const [savingEditedChapter, setSavingEditedChapter] = useState(false);

  // Subchapter form
  const [activeSubchapterChapter, setActiveSubchapterChapter] = useState(null);
  const [subchapterTitle, setSubchapterTitle] = useState("");
  const [subchapterContent, setSubchapterContent] = useState("");
  const [savingSubchapter, setSavingSubchapter] = useState(false);

  // Edit subchapter
  const [editingSubchapter, setEditingSubchapter] = useState(null);
  const [savingEditedSubchapter, setSavingEditedSubchapter] = useState(false);

  // Delete confirmation modal
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    type: null,
    id: null,
    chapterId: null,
    title: "",
  });

  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadCourse = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch(
          `${API_URL}/api/instructor/courses/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load course.");
        }

        setCourse(data);
      } catch (err) {
        console.error("Error loading course:", err);
        setError(err.message || "Failed to load course.");
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [id, navigate]);

  /**
   * Open Delete Modal
   */
  const openDeleteModal = ({ type, id, chapterId = null, title = "" }) => {
    setError("");

    setDeleteModal({
      open: true,
      type,
      id,
      chapterId,
      title,
    });
  };

  /**
   * Close Delete Modal
   */
  const closeDeleteModal = () => {
    if (deleting) {
      return;
    }

    setDeleteModal({
      open: false,
      type: null,
      id: null,
      chapterId: null,
      title: "",
    });
  };

  /**
   * Confirm Delete
   */
  const handleConfirmDelete = async () => {
    if (!deleteModal.id || !deleteModal.type) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      const token = localStorage.getItem("token");

      let response;

      if (deleteModal.type === "chapter") {
        response = await fetch(`${API_URL}/api/chapters/${deleteModal.id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      if (deleteModal.type === "subchapter") {
        response = await fetch(`${API_URL}/api/subchapters/${deleteModal.id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete item.");
      }

      if (deleteModal.type === "chapter") {
        const chapterId = deleteModal.id;

        setCourse((prev) => ({
          ...prev,
          chapters: prev.chapters.filter((chapter) => chapter.id !== chapterId),
        }));

        if (editingChapter?.id === chapterId) {
          setEditingChapter(null);
          setEditingChapterTitle("");
        }

        if (activeSubchapterChapter === chapterId) {
          setActiveSubchapterChapter(null);
          setSubchapterTitle("");
          setSubchapterContent("");
        }
      }

      if (deleteModal.type === "subchapter") {
        const subchapterId = deleteModal.id;
        const chapterId = deleteModal.chapterId;

        setCourse((prev) => ({
          ...prev,
          chapters: prev.chapters.map((chapter) =>
            chapter.id === chapterId
              ? {
                  ...chapter,
                  subchapters: (chapter.subchapters || []).filter(
                    (subchapter) => subchapter.id !== subchapterId,
                  ),
                }
              : chapter,
          ),
        }));

        if (editingSubchapter?.id === subchapterId) {
          setEditingSubchapter(null);
          setSubchapterTitle("");
          setSubchapterContent("");
        }
      }

      setDeleteModal({
        open: false,
        type: null,
        id: null,
        chapterId: null,
        title: "",
      });
    } catch (err) {
      console.error("Error deleting item:", err);
      setError(err.message || "Failed to delete item.");
    } finally {
      setDeleting(false);
    }
  };

  /**
   * Add Chapter
   */
  const handleAddChapter = async (e) => {
    e.preventDefault();

    if (!chapterTitle.trim()) {
      setError("Please enter a chapter title.");
      return;
    }

    try {
      setSavingChapter(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/api/courses/${id}/chapters`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: chapterTitle.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create chapter.");
      }

      setCourse((prev) => ({
        ...prev,
        chapters: [
          ...(prev.chapters || []),
          {
            ...data,
            subchapters: [],
          },
        ],
      }));

      setChapterTitle("");
      setShowChapterForm(false);
    } catch (err) {
      console.error("Error creating chapter:", err);
      setError(err.message || "Failed to create chapter.");
    } finally {
      setSavingChapter(false);
    }
  };

  /**
   * Edit Chapter
   */
  const handleEditChapter = async (e) => {
    e.preventDefault();

    if (!editingChapterTitle.trim()) {
      setError("Please enter a chapter title.");
      return;
    }

    try {
      setSavingEditedChapter(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/api/chapters/${editingChapter.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: editingChapterTitle.trim(),
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update chapter.");
      }

      setCourse((prev) => ({
        ...prev,
        chapters: prev.chapters.map((chapter) =>
          chapter.id === editingChapter.id
            ? {
                ...chapter,
                title: data.title,
              }
            : chapter,
        ),
      }));

      setEditingChapter(null);
      setEditingChapterTitle("");
    } catch (err) {
      console.error("Error updating chapter:", err);
      setError(err.message || "Failed to update chapter.");
    } finally {
      setSavingEditedChapter(false);
    }
  };

  /**
   * Edit Course
   */
  const handleEditCourse = async (e) => {
    e.preventDefault();

    if (!courseTitle.trim()) {
      setError("Please enter a course title.");
      return;
    }

    if (!courseDescription.trim()) {
      setError("Please enter a course description.");
      return;
    }

    if (!coursePrice || Number(coursePrice) < 0) {
      setError("Please enter a valid course price.");
      return;
    }

    if (!courseDuration || Number(courseDuration) <= 0) {
      setError("Please enter a valid course duration.");
      return;
    }

    try {
      setSavingCourse(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/api/instructor/courses/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: courseTitle.trim(),
          description: courseDescription.trim(),
          price: Number(coursePrice),
          duration: Number(courseDuration) * 60,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update course.");
      }

      setCourse((prev) => ({
        ...prev,
        title: courseTitle.trim(),
        description: courseDescription.trim(),
        price: Number(coursePrice),
        duration: Number(courseDuration) * 60,
      }));

      setShowCourseForm(false);
      setCourseTitle("");
      setCourseDescription("");
      setCoursePrice("");
      setCourseDuration("");
    } catch (err) {
      console.error("Error updating course:", err);
      setError(err.message || "Failed to update course.");
    } finally {
      setSavingCourse(false);
    }
  };

  /**
   * Add Subchapter
   */
  const handleAddSubchapter = async (e, chapterId) => {
    e.preventDefault();

    if (!subchapterTitle.trim()) {
      setError("Please enter a subchapter title.");
      return;
    }

    try {
      setSavingSubchapter(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/api/chapters/${chapterId}/subchapters`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: subchapterTitle.trim(),
            content: subchapterContent,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
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

      setSubchapterTitle("");
      setSubchapterContent("");
      setActiveSubchapterChapter(null);
    } catch (err) {
      console.error("Error creating subchapter:", err);
      setError(err.message || "Failed to create subchapter.");
    } finally {
      setSavingSubchapter(false);
    }
  };

  /**
   * Update Subchapter
   */
  const handleUpdateSubchapter = async (e) => {
    e.preventDefault();

    if (!editingSubchapter) {
      return;
    }

    if (!subchapterTitle.trim()) {
      setError("Please enter a subchapter title.");
      return;
    }

    try {
      setSavingEditedSubchapter(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/api/subchapters/${editingSubchapter.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: subchapterTitle.trim(),
            content: subchapterContent,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update subchapter.");
      }

      setCourse((prev) => ({
        ...prev,
        chapters: prev.chapters.map((chapter) => ({
          ...chapter,
          subchapters: (chapter.subchapters || []).map((subchapter) =>
            subchapter.id === editingSubchapter.id ? data : subchapter,
          ),
        })),
      }));

      setEditingSubchapter(null);
      setSubchapterTitle("");
      setSubchapterContent("");
    } catch (err) {
      console.error("Error updating subchapter:", err);
      setError(err.message || "Failed to update subchapter.");
    } finally {
      setSavingEditedSubchapter(false);
    }
  };

  /**
   * Loading
   */
  if (loading) {
    return (
      <div className="course-builder-page">
        <div className="course-builder-container">
          <div className="course-builder-content">
            <p>Loading course...</p>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Error
   */
  if (error && !course) {
    return (
      <div className="course-builder-page">
        <div className="course-builder-container">
          <div className="course-builder-content">
            <div className="course-builder-error">
              <i className="bi bi-exclamation-circle-fill me-2"></i>
              {error}
            </div>

            <button
              className="course-builder-btn course-builder-btn-primary"
              onClick={() => navigate("/instructor/dashboard")}
            >
              <i className="bi bi-arrow-left"></i>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <div className="course-builder-page">
      <div className="course-builder-container">
        {/* =========================
            COURSE HEADER
        ========================== */}

        <div className="course-builder-header">
          <div className="course-builder-header-top">
            <div>
              <div className="course-builder-label">
                <i className="bi bi-pencil-square"></i>
                Course Builder
              </div>

              <h1>{course.title}</h1>

              <p className="course-builder-description">{course.description}</p>
            </div>

            <div className="course-builder-header-actions">
              <button
                type="button"
                className="course-builder-btn course-builder-btn-primary"
                onClick={() => {
                  setError("");
                  setCourseTitle(course.title);
                  setCourseDescription(course.description || "");
                  setCoursePrice(course.price || "");
                  setCourseDuration(
                    course.duration ? Math.floor(course.duration / 60) : "",
                  );
                  setShowCourseForm(true);
                }}
              >
                <i className="bi bi-pencil"></i>
                Edit Course
              </button>

              <button
                type="button"
                className="course-builder-btn course-builder-btn-secondary"
                onClick={() => navigate("/instructor/dashboard")}
              >
                <i className="bi bi-arrow-left"></i>
                Dashboard
              </button>
            </div>
          </div>

          <div className="course-builder-meta">
            <div className="course-builder-meta-item">
              <i className="bi bi-cash"></i>
              {Number(course.price).toLocaleString()} RWF
            </div>

            <div className="course-builder-meta-item">
              <i className="bi bi-clock"></i>
              {Math.floor(course.duration / 60)} minutes
            </div>

            <div className="course-builder-meta-item">
              <i className="bi bi-list-nested"></i>
              {course.chapters?.length || 0} chapters
            </div>
          </div>
        </div>

        {/* =========================
            EDIT COURSE FORM
        ========================== */}

        {showCourseForm && (
          <form
            className="course-builder-add-form course-builder-course-form"
            onSubmit={handleEditCourse}
          >
            <div className="course-builder-field">
              <label htmlFor="courseTitle">Course title</label>

              <input
                id="courseTitle"
                type="text"
                className="course-builder-input"
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
                placeholder="Enter course title"
                autoFocus
              />
            </div>

            <div className="course-builder-field">
              <label htmlFor="courseDescription">Course description</label>

              <textarea
                id="courseDescription"
                className="course-builder-textarea"
                value={courseDescription}
                onChange={(e) => setCourseDescription(e.target.value)}
                placeholder="Describe what learners will learn in this course"
                rows="5"
              />
            </div>

            <div className="course-builder-form-row">
              <div className="course-builder-field">
                <label htmlFor="coursePrice">Price (RWF)</label>

                <input
                  id="coursePrice"
                  type="number"
                  className="course-builder-input"
                  value={coursePrice}
                  onChange={(e) => setCoursePrice(e.target.value)}
                  placeholder="e.g. 45000"
                  min="0"
                />
              </div>

              <div className="course-builder-field">
                <label htmlFor="courseDuration">Duration (minutes)</label>

                <input
                  id="courseDuration"
                  type="number"
                  className="course-builder-input"
                  value={courseDuration}
                  onChange={(e) => setCourseDuration(e.target.value)}
                  placeholder="e.g. 60"
                  min="1"
                />
              </div>
            </div>

            <div className="course-builder-form-actions">
              <button
                type="submit"
                className="course-builder-btn course-builder-btn-primary"
                disabled={savingCourse}
              >
                {savingCourse ? (
                  <>
                    <span className="spinner-border spinner-border-sm"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-lg"></i>
                    Save Changes
                  </>
                )}
              </button>

              <button
                type="button"
                className="course-builder-btn course-builder-btn-secondary"
                onClick={() => {
                  setShowCourseForm(false);
                  setError("");
                }}
                disabled={savingCourse}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* =========================
            COURSE STRUCTURE
        ========================== */}

        <div className="course-builder-content">
          <div className="course-builder-section-header">
            <div className="course-builder-section-title">
              <div className="course-builder-section-icon">
                <i className="bi bi-list-nested"></i>
              </div>

              <div>
                <h2>Course Structure</h2>
                <p>Organize your course into chapters and subchapters.</p>
              </div>
            </div>

            <button
              type="button"
              className="course-builder-btn course-builder-btn-primary"
              onClick={() => {
                setError("");
                setShowChapterForm(true);
              }}
            >
              <i className="bi bi-plus-lg"></i>
              Add Chapter
            </button>
          </div>

          {/* Error */}

          {error && (
            <div className="course-builder-error">
              <i className="bi bi-exclamation-circle-fill me-2"></i>
              {error}
            </div>
          )}

          {/* =========================
              ADD CHAPTER FORM
          ========================== */}

          {showChapterForm && (
            <form
              className="course-builder-add-form"
              onSubmit={handleAddChapter}
            >
              <div className="course-builder-field">
                <label htmlFor="chapterTitle">Chapter title</label>

                <input
                  id="chapterTitle"
                  type="text"
                  className="course-builder-input"
                  value={chapterTitle}
                  onChange={(e) => setChapterTitle(e.target.value)}
                  placeholder="Enter chapter title"
                  autoFocus
                />
              </div>

              <div className="course-builder-form-actions">
                <button
                  type="submit"
                  className="course-builder-btn course-builder-btn-primary"
                  disabled={savingChapter}
                >
                  {savingChapter ? (
                    <>
                      <span className="spinner-border spinner-border-sm"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-lg"></i>
                      Save Chapter
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="course-builder-btn course-builder-btn-secondary"
                  onClick={() => {
                    setShowChapterForm(false);
                    setChapterTitle("");
                    setError("");
                  }}
                  disabled={savingChapter}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* =========================
              CHAPTERS
          ========================== */}

          {course.chapters && course.chapters.length > 0 ? (
            <div>
              {course.chapters.map((chapter, index) => (
                <div className="course-builder-chapter" key={chapter.id}>
                  {/* Chapter Header */}

                  <div className="course-builder-chapter-header">
                    <div>
                      <div className="course-builder-chapter-number">
                        Chapter {index + 1}
                      </div>

                      <h3>{chapter.title}</h3>
                    </div>

                    <div className="course-builder-chapter-actions">
                      <button
                        type="button"
                        className="course-builder-btn course-builder-btn-secondary"
                        onClick={() => {
                          setEditingChapter(chapter);
                          setEditingChapterTitle(chapter.title);
                          setError("");
                        }}
                      >
                        <i className="bi bi-pencil"></i>
                        Edit
                      </button>

                      <button
                        type="button"
                        className="course-builder-btn course-builder-btn-danger"
                        onClick={() =>
                          openDeleteModal({
                            type: "chapter",
                            id: chapter.id,
                            title: chapter.title,
                          })
                        }
                      >
                        <i className="bi bi-trash"></i>
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* =========================
                      EDIT CHAPTER FORM
                  ========================== */}

                  {editingChapter?.id === chapter.id && (
                    <form
                      className="course-builder-add-form"
                      onSubmit={handleEditChapter}
                    >
                      <div className="course-builder-field">
                        <label htmlFor={`editChapterTitle-${chapter.id}`}>
                          Chapter title
                        </label>

                        <input
                          id={`editChapterTitle-${chapter.id}`}
                          type="text"
                          className="course-builder-input"
                          value={editingChapterTitle}
                          onChange={(e) =>
                            setEditingChapterTitle(e.target.value)
                          }
                          placeholder="Enter chapter title"
                          autoFocus
                        />
                      </div>

                      <div className="course-builder-form-actions">
                        <button
                          type="submit"
                          className="course-builder-btn course-builder-btn-primary"
                          disabled={savingEditedChapter}
                        >
                          {savingEditedChapter ? (
                            <>
                              <span className="spinner-border spinner-border-sm"></span>
                              Saving...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-check-lg"></i>
                              Save Changes
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          className="course-builder-btn course-builder-btn-secondary"
                          onClick={() => {
                            setEditingChapter(null);
                            setEditingChapterTitle("");
                            setError("");
                          }}
                          disabled={savingEditedChapter}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}

                  {/* =========================
                      SUBCHAPTERS
                  ========================== */}

                  <div className="course-builder-subchapters">
                    {chapter.subchapters && chapter.subchapters.length > 0 ? (
                      chapter.subchapters.map((subchapter, subIndex) => (
                        <div
                          className="course-builder-subchapter"
                          key={subchapter.id}
                        >
                          {/* Subchapter Header */}

                          <div className="course-builder-subchapter-top">
                            <div>
                              <h4>
                                {subIndex + 1}. {subchapter.title}
                              </h4>
                            </div>

                            <div className="course-builder-subchapter-actions">
                              <button
                                type="button"
                                className="course-builder-btn course-builder-btn-secondary"
                                onClick={() => {
                                  setEditingSubchapter(subchapter);
                                  setSubchapterTitle(subchapter.title);
                                  setSubchapterContent(
                                    subchapter.content || "",
                                  );
                                  setError("");
                                }}
                              >
                                <i className="bi bi-pencil"></i>
                                Edit
                              </button>

                              <button
                                type="button"
                                className="course-builder-btn course-builder-btn-danger"
                                onClick={() =>
                                  openDeleteModal({
                                    type: "subchapter",
                                    id: subchapter.id,
                                    chapterId: chapter.id,
                                    title: subchapter.title,
                                  })
                                }
                              >
                                <i className="bi bi-trash"></i>
                                Delete
                              </button>
                            </div>
                          </div>

                          {/* =========================
                                EDIT SUBCHAPTER FORM
                            ========================== */}

                          {editingSubchapter?.id === subchapter.id && (
                            <form
                              className="course-builder-add-form"
                              onSubmit={handleUpdateSubchapter}
                            >
                              <div className="course-builder-field">
                                <label
                                  htmlFor={`edit-subchapter-title-${subchapter.id}`}
                                >
                                  Subchapter title
                                </label>

                                <input
                                  id={`edit-subchapter-title-${subchapter.id}`}
                                  type="text"
                                  className="course-builder-input"
                                  value={subchapterTitle}
                                  onChange={(e) =>
                                    setSubchapterTitle(e.target.value)
                                  }
                                />
                              </div>

                              <div className="course-builder-field">
                                <label
                                  htmlFor={`edit-subchapter-content-${subchapter.id}`}
                                >
                                  Content
                                </label>

                                <textarea
                                  id={`edit-subchapter-content-${subchapter.id}`}
                                  className="course-builder-textarea"
                                  value={subchapterContent}
                                  onChange={(e) =>
                                    setSubchapterContent(e.target.value)
                                  }
                                  placeholder="Write the learning content here..."
                                  rows="10"
                                ></textarea>
                              </div>

                              <div className="course-builder-form-actions">
                                <button
                                  type="submit"
                                  className="course-builder-btn course-builder-btn-primary"
                                  disabled={savingEditedSubchapter}
                                >
                                  {savingEditedSubchapter ? (
                                    <>
                                      <span className="spinner-border spinner-border-sm"></span>
                                      Saving...
                                    </>
                                  ) : (
                                    <>
                                      <i className="bi bi-check-lg"></i>
                                      Save Changes
                                    </>
                                  )}
                                </button>

                                <button
                                  type="button"
                                  className="course-builder-btn course-builder-btn-secondary"
                                  onClick={() => {
                                    setEditingSubchapter(null);
                                    setSubchapterTitle("");
                                    setSubchapterContent("");
                                    setError("");
                                  }}
                                  disabled={savingEditedSubchapter}
                                >
                                  Cancel
                                </button>
                              </div>
                            </form>
                          )}

                          {/* Existing Content */}

                          {subchapter.content && (
                            <p className="course-builder-subchapter-content">
                              {subchapter.content}
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="course-builder-no-subchapters">
                        No subchapters have been added yet.
                      </p>
                    )}

                    {/* Add Subchapter Button */}

                    {activeSubchapterChapter !== chapter.id && (
                      <button
                        type="button"
                        className="course-builder-btn course-builder-btn-secondary"
                        onClick={() => {
                          setError("");
                          setActiveSubchapterChapter(chapter.id);
                          setSubchapterTitle("");
                          setSubchapterContent("");
                        }}
                      >
                        <i className="bi bi-plus-lg"></i>
                        Add Subchapter
                      </button>
                    )}

                    {/* =========================
                        ADD SUBCHAPTER FORM
                    ========================== */}

                    {activeSubchapterChapter === chapter.id && (
                      <form
                        className="course-builder-add-form"
                        onSubmit={(e) => handleAddSubchapter(e, chapter.id)}
                      >
                        <div className="course-builder-field">
                          <label>Subchapter title</label>

                          <input
                            type="text"
                            className="course-builder-input"
                            value={subchapterTitle}
                            onChange={(e) => setSubchapterTitle(e.target.value)}
                            placeholder="Enter subchapter title"
                            autoFocus
                          />
                        </div>

                        <div className="course-builder-field">
                          <label>Content</label>

                          <textarea
                            className="course-builder-textarea"
                            value={subchapterContent}
                            onChange={(e) =>
                              setSubchapterContent(e.target.value)
                            }
                            placeholder="Write the learning content here..."
                            rows="10"
                          ></textarea>
                        </div>

                        <div className="course-builder-form-actions">
                          <button
                            type="submit"
                            className="course-builder-btn course-builder-btn-primary"
                            disabled={savingSubchapter}
                          >
                            {savingSubchapter ? (
                              <>
                                <span className="spinner-border spinner-border-sm"></span>
                                Saving...
                              </>
                            ) : (
                              <>
                                <i className="bi bi-check-lg"></i>
                                Save Subchapter
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            className="course-builder-btn course-builder-btn-secondary"
                            onClick={() => {
                              setActiveSubchapterChapter(null);
                              setSubchapterTitle("");
                              setSubchapterContent("");
                              setError("");
                            }}
                            disabled={savingSubchapter}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="course-builder-empty">
              <i className="bi bi-journal-plus"></i>

              <p>
                No chapters have been added yet. Click{" "}
                <strong>Add Chapter</strong> to begin building your course.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* =====================================================
          DELETE CONFIRMATION MODAL
      ====================================================== */}

      {deleteModal.open && (
        <div
          className="course-builder-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeDeleteModal();
            }
          }}
        >
          <div
            className="course-builder-delete-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
          >
            <div className="course-builder-delete-icon">
              <i className="bi bi-trash3"></i>
            </div>

            <div className="course-builder-delete-content">
              <h2 id="delete-modal-title">
                Delete{" "}
                {deleteModal.type === "chapter" ? "Chapter" : "Subchapter"}?
              </h2>

              <p>
                Are you sure you want to delete{" "}
                <strong>{deleteModal.title}</strong>?
              </p>

              {deleteModal.type === "chapter" && (
                <p className="course-builder-delete-warning">
                  All subchapters inside this chapter will also be deleted. This
                  action cannot be undone.
                </p>
              )}

              {deleteModal.type === "subchapter" && (
                <p className="course-builder-delete-warning">
                  This subchapter and its content will be permanently deleted.
                  This action cannot be undone.
                </p>
              )}
            </div>

            <div className="course-builder-delete-actions">
              <button
                type="button"
                className="course-builder-btn course-builder-btn-secondary"
                onClick={closeDeleteModal}
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                type="button"
                className="course-builder-btn course-builder-btn-danger"
                onClick={handleConfirmDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <span className="spinner-border spinner-border-sm"></span>
                    Deleting...
                  </>
                ) : (
                  <>
                    <i className="bi bi-trash3"></i>
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseBuilder;
