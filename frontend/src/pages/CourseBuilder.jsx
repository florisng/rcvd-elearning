import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API_URL from "../api";
import "./css/CourseBuilder.css";

const calculateChapterReadingTime = (subchapters = []) => {
  const totalWords = subchapters.reduce((total, subchapter) => {
    const content = (subchapter.content || "").trim();

    if (!content) {
      return total;
    }

    const words = content.split(/\s+/).filter(Boolean);

    return total + words.length;
  }, 0);

  return Math.ceil(totalWords / 100);
};

const CourseBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [publishingCourse, setPublishingCourse] = useState(false);

  // Edit course
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [coursePrice, setCoursePrice] = useState("");
  const [savingCourse, setSavingCourse] = useState(false);

  // Test
  const [test, setTest] = useState(null);
  const [showTestForm, setShowTestForm] = useState(false);

  // Test questions
  const [questions, setQuestions] = useState([]);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [questionText, setQuestionText] = useState("");

  const [questionOptions, setQuestionOptions] = useState([
    { text: "", is_correct: false },
    { text: "", is_correct: false },
  ]);

  const [testTitle, setTestTitle] = useState("");
  const [testPassPercentage, setTestPassPercentage] = useState(80);
  const [testDurationMinutes, setTestDurationMinutes] = useState(30);
  const [testQuestionsPerAttempt, setTestQuestionsPerAttempt] = useState(20);
  const [testMaxAttempts, setTestMaxAttempts] = useState(3);
  const [savingTest, setSavingTest] = useState(false);

  const handleCreateTest = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    if (!testTitle.trim()) {
      return;
    }

    try {
      setSavingTest(true);

      const response = await fetch(
        `${API_URL}/api/instructor/courses/${id}/test`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: testTitle.trim(),
            pass_percentage: Number(testPassPercentage),
            duration_minutes: Number(testDurationMinutes),
            questions_per_attempt: Number(testQuestionsPerAttempt),
            max_attempts: Number(testMaxAttempts),
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("Error creating test:", data);
        return;
      }

      setTest(data.test);
      setShowTestForm(false);
      setError("");

      setTestTitle("");
      setTestPassPercentage(80);
      setTestDurationMinutes(30);
      setTestQuestionsPerAttempt(20);
      setTestMaxAttempts(3);
    } catch (err) {
      console.error("Error creating test:", err);
    } finally {
      setSavingTest(false);
    }
  };

  const handlePublishCourse = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setPublishingCourse(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/instructor/courses/${id}/publish`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        if (Array.isArray(data.missing) && data.missing.length > 0) {
          setError(
            `Course is not ready to publish. Missing: ${data.missing.join(", ")}.`,
          );
        } else {
          setError(data.error || "Failed to publish course.");
        }

        return;
      }

      setCourse((prev) => ({
        ...prev,
        status: "PUBLISHED",
      }));

      setError("");
    } catch (err) {
      console.error("Error publishing course:", err);
      setError("Unable to publish course. Please try again.");
    } finally {
      setPublishingCourse(false);
    }
  };

  const handleUnpublishCourse = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setPublishingCourse(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/instructor/courses/${id}/unpublish`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to unpublish course.");
        return;
      }

      setCourse((prev) => ({
        ...prev,
        status: "DRAFT",
      }));

      setError("");
    } catch (err) {
      console.error("Error unpublishing course:", err);
      setError("Unable to unpublish course. Please try again.");
    } finally {
      setPublishingCourse(false);
    }
  };

  const handleCreateQuestion = async () => {
    if (!test?.id) {
      setError("Please create a test before adding questions.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    if (!questionText.trim()) {
      setError("Question text is required.");
      return;
    }

    if (!Array.isArray(questionOptions) || questionOptions.length < 2) {
      setError("At least two answer options are required.");
      return;
    }

    const validOptions = questionOptions.every((option) => option.text?.trim());

    if (!validOptions) {
      setError("Please enter text for every answer option.");
      return;
    }

    const correctOptions = questionOptions.filter(
      (option) => option.is_correct === true,
    );

    if (correctOptions.length !== 1) {
      setError("Please select exactly one correct answer.");
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `${API_URL}/api/tests/${test.id}/questions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            question_text: questionText.trim(),
            options: questionOptions.map((option) => ({
              text: option.text.trim(),
              is_correct: option.is_correct === true,
            })),
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create question.");
        return;
      }

      setQuestions((prev) => [
        ...(Array.isArray(prev) ? prev : []),
        data.question,
      ]);

      setQuestionText("");

      setQuestionOptions([
        { text: "", is_correct: false },
        { text: "", is_correct: false },
      ]);

      setShowQuestionForm(false);
    } catch (err) {
      console.error("Error creating question:", err);
      setError("Unable to create question. Please try again.");
    }
  };

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

        console.log("COURSE DATA STATUS:", data.status, data);

        if (!response.ok) {
          throw new Error(data.error || "Failed to load course.");
        }

        setCourse(data);

        const testResponse = await fetch(
          `${API_URL}/api/instructor/courses/${id}/test`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (testResponse.ok) {
          const testData = await testResponse.json();
          setTest(testData);

          const questionsResponse = await fetch(
            `${API_URL}/api/tests/${testData.id}/questions`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          if (questionsResponse.ok) {
            const questionsData = await questionsResponse.json();
            setQuestions(questionsData.questions);
          }
        }
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

      if (deleteModal.type === "test") {
        response = await fetch(
          `${API_URL}/api/instructor/tests/${deleteModal.id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
      }

      if (deleteModal.type === "question") {
        response = await fetch(
          `${API_URL}/api/test-questions/${deleteModal.id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
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

      if (deleteModal.type === "test") {
        setTest(null);
        setShowTestForm(false);
      }

      if (deleteModal.type === "question") {
        const questionId = deleteModal.id;

        setQuestions((prev) =>
          prev.filter((question) => question.id !== questionId),
        );
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
      }));

      setShowCourseForm(false);
      setCourseTitle("");
      setCourseDescription("");
      setCoursePrice("");
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

      const courseResponse = await fetch(
        `${API_URL}/api/instructor/courses/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const updatedCourse = await courseResponse.json();

      if (!courseResponse.ok) {
        throw new Error(updatedCourse.error || "Failed to refresh course.");
      }

      setCourse(updatedCourse);

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

      const courseResponse = await fetch(
        `${API_URL}/api/instructor/courses/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const updatedCourse = await courseResponse.json();

      if (!courseResponse.ok) {
        throw new Error(updatedCourse.error || "Failed to refresh course.");
      }

      setCourse(updatedCourse);

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

  const isPublished = course.status === "PUBLISHED";

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
                  setShowCourseForm(true);
                }}
                disabled={isPublished}
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
              <i className="bi bi-list-nested"></i>
              {course.chapters?.length || 0} chapters
            </div>

            <div
              className={`course-builder-meta-item course-builder-status ${
                course.status === "PUBLISHED"
                  ? "course-builder-status-published"
                  : "course-builder-status-draft"
              }`}
            >
              <i
                className={
                  course.status === "PUBLISHED"
                    ? "bi bi-check-circle-fill"
                    : "bi bi-pencil-square"
                }
              ></i>

              {course.status === "PUBLISHED" ? "Published" : "Draft"}
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
                disabled={isPublished}
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
                disabled={isPublished}
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
                  disabled={isPublished}
                />
              </div>
            </div>

            <div className="course-builder-form-actions">
              <button
                type="submit"
                className="course-builder-btn course-builder-btn-primary"
                disabled={savingCourse || isPublished}
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
              disabled={isPublished}
            >
              <i className="bi bi-plus-lg"></i>
              Add Chapter
            </button>
          </div>

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
                  disabled={savingChapter || isPublished}
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
                        <h3>
                          Chapter {index + 1}: {chapter.title}
                        </h3>

                        <p className="course-builder-chapter-duration">
                          <i className="bi bi-clock"></i>{" "}
                          {calculateChapterReadingTime(chapter.subchapters)} min
                          read
                        </p>
                      </div>
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
                        disabled={isPublished}
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
                        disabled={isPublished}
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
                          disabled={isPublished}
                        />
                      </div>

                      <div className="course-builder-form-actions">
                        <button
                          type="submit"
                          className="course-builder-btn course-builder-btn-primary"
                          disabled={savingEditedChapter || isPublished}
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
                                disabled={isPublished}
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
                                disabled={isPublished}
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
                                  disabled={isPublished}
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
                                  disabled={isPublished}
                                ></textarea>
                              </div>

                              <div className="course-builder-form-actions">
                                <button
                                  type="submit"
                                  className="course-builder-btn course-builder-btn-primary"
                                  disabled={
                                    savingEditedSubchapter || isPublished
                                  }
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
                        disabled={isPublished}
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
                            disabled={savingSubchapter || isPublished}
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

        {/* =========================
            TEST / ASSESSMENT
        ========================== */}

        <div className="course-builder-content course-builder-test-section">
          <div className="course-builder-section-header">
            <div className="course-builder-section-title">
              <div className="course-builder-section-icon">
                <i className="bi bi-clipboard-check"></i>
              </div>

              <div>
                <h2>Final Test</h2>
                <p>Create the multiple-choice test learners must complete.</p>
              </div>
            </div>

            {!test ? (
              <button
                type="button"
                className="course-builder-btn course-builder-btn-primary"
                onClick={() => {
                  setError("");
                  setShowTestForm(true);
                }}
                disabled={isPublished}
              >
                <i className="bi bi-plus-lg"></i>
                Create Test
              </button>
            ) : (
              <div className="course-builder-test-created">
                <div className="course-builder-test-created-header">
                  <div>
                    <i className="bi bi-check-circle-fill"></i>
                    <strong>{test.title}</strong>
                  </div>

                  <button
                    type="button"
                    className="course-builder-btn course-builder-btn-danger"
                    onClick={() =>
                      openDeleteModal({
                        type: "test",
                        id: test.id,
                        title: test.title,
                      })
                    }
                    disabled={isPublished}
                  >
                    <i className="bi bi-trash"></i>
                    Delete
                  </button>
                </div>

                <div className="course-builder-test-details">
                  <span>
                    Pass: <strong>{test.pass_percentage}%</strong>
                  </span>

                  <span>
                    Time: <strong>{test.duration_minutes} min</strong>
                  </span>

                  <span>
                    Questions: <strong>{test.questions_per_attempt}</strong>
                  </span>

                  <span>
                    Attempts: <strong>{test.max_attempts}</strong>
                  </span>
                </div>

                <button
                  type="button"
                  className="course-builder-btn course-builder-btn-primary"
                  onClick={() => {
                    setError("");
                    setShowQuestionForm(true);
                  }}
                  disabled={
                    isPublished ||
                    questions.length >= Number(test.questions_per_attempt)
                  }
                >
                  <i className="bi bi-plus-lg"></i>

                  {questions.length >= Number(test.questions_per_attempt)
                    ? "Question Limit Reached"
                    : "Add Question"}
                </button>
              </div>
            )}
          </div>

          {showTestForm && (
            <form
              className="course-builder-add-form course-builder-test-form"
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateTest();
              }}
            >
              <div className="course-builder-field">
                <label htmlFor="testTitle">Test title</label>

                <input
                  id="testTitle"
                  type="text"
                  className="course-builder-input"
                  value={testTitle}
                  onChange={(e) => setTestTitle(e.target.value)}
                  placeholder="e.g. Final Veterinary Medicine Test"
                  autoFocus
                  disabled={isPublished}
                />
              </div>

              <div className="course-builder-form-row">
                <div className="course-builder-field">
                  <label htmlFor="testPassPercentage">Pass percentage</label>

                  <input
                    id="testPassPercentage"
                    type="number"
                    className="course-builder-input"
                    value={testPassPercentage}
                    onChange={(e) => setTestPassPercentage(e.target.value)}
                    min="1"
                    max="100"
                    disabled={isPublished}
                  />
                </div>

                <div className="course-builder-field">
                  <label htmlFor="testDurationMinutes">
                    Test duration (minutes)
                  </label>

                  <input
                    id="testDurationMinutes"
                    type="number"
                    className="course-builder-input"
                    value={testDurationMinutes}
                    onChange={(e) => setTestDurationMinutes(e.target.value)}
                    min="1"
                    disabled={isPublished}
                  />
                </div>
              </div>

              <div className="course-builder-form-row">
                <div className="course-builder-field">
                  <label htmlFor="testQuestionsPerAttempt">
                    Questions per attempt
                  </label>

                  <input
                    id="testQuestionsPerAttempt"
                    type="number"
                    className="course-builder-input"
                    value={testQuestionsPerAttempt}
                    onChange={(e) => setTestQuestionsPerAttempt(e.target.value)}
                    min="1"
                    disabled={isPublished}
                  />
                </div>

                <div className="course-builder-field">
                  <label htmlFor="testMaxAttempts">Maximum attempts</label>

                  <input
                    id="testMaxAttempts"
                    type="number"
                    className="course-builder-input"
                    value={testMaxAttempts}
                    onChange={(e) => setTestMaxAttempts(e.target.value)}
                    min="1"
                    disabled={isPublished}
                  />
                </div>
              </div>

              <div className="course-builder-form-actions">
                <button
                  type="submit"
                  className="course-builder-btn course-builder-btn-primary"
                  disabled={savingTest || isPublished}
                >
                  {savingTest ? (
                    <>
                      <span className="spinner-border spinner-border-sm"></span>
                      Creating...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-lg"></i>
                      Create Test
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="course-builder-btn course-builder-btn-secondary"
                  onClick={() => {
                    setShowTestForm(false);
                    setError("");
                  }}
                  disabled={savingTest}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {showQuestionForm && (
            <form
              className="course-builder-add-form course-builder-question-form"
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateQuestion();
              }}
            >
              <div className="course-builder-form-group">
                <label htmlFor="question-text">Question</label>

                <textarea
                  id="question-text"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Enter the question"
                  rows="3"
                  required
                  disabled={isPublished}
                />
              </div>

              <div className="course-builder-form-group">
                <label>Answer Options</label>

                {questionOptions.map((option, index) => (
                  <div key={index} className="course-builder-question-option">
                    <input
                      type="radio"
                      name="correct-option"
                      checked={option.is_correct === true}
                      onChange={() => {
                        setQuestionOptions((prev) =>
                          prev.map((item, optionIndex) => ({
                            ...item,
                            is_correct: optionIndex === index,
                          })),
                        );
                      }}
                      disabled={isPublished}
                    />

                    <input
                      type="text"
                      value={option.text}
                      onChange={(e) => {
                        const value = e.target.value;

                        setQuestionOptions((prev) =>
                          prev.map((item, optionIndex) =>
                            optionIndex === index
                              ? { ...item, text: value }
                              : item,
                          ),
                        );
                      }}
                      placeholder={`Option ${index + 1}`}
                      required
                      disabled={isPublished}
                    />
                  </div>
                ))}
              </div>

              <div className="course-builder-form-actions">
                <button
                  type="submit"
                  className="course-builder-btn course-builder-btn-primary"
                  disabled={isPublished}
                >
                  <i className="bi bi-check-lg"></i>
                  Add Question
                </button>

                <button
                  type="button"
                  className="course-builder-btn course-builder-btn-secondary"
                  onClick={() => {
                    setShowQuestionForm(false);
                    setQuestionText("");
                    setQuestionOptions([
                      { text: "", is_correct: false },
                      { text: "", is_correct: false },
                    ]);
                    setError("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {questions.length > 0 && (
            <div className="course-builder-questions">
              <div className="course-builder-questions-header">
                <h3>Questions</h3>

                <span>
                  {questions.length} question
                  {questions.length !== 1 ? "s" : ""}
                </span>
              </div>

              {questions.map((question, index) => (
                <div key={question.id} className="course-builder-question-card">
                  <div className="course-builder-question-header">
                    <strong>Question {index + 1}</strong>

                    <button
                      type="button"
                      className="course-builder-btn course-builder-btn-danger"
                      onClick={() =>
                        openDeleteModal({
                          type: "question",
                          id: question.id,
                          title: question.question_text,
                        })
                      }
                      disabled={isPublished}
                    >
                      <i className="bi bi-trash"></i>
                      Delete
                    </button>
                  </div>

                  <p className="course-builder-question-text">
                    {question.question_text}
                  </p>

                  <div className="course-builder-question-options">
                    {(question.options || []).map((option, optionIndex) => (
                      <div
                        key={option.id || optionIndex}
                        className="course-builder-question-option-display"
                      >
                        <span className="course-builder-option-letter">
                          {String.fromCharCode(65 + optionIndex)}
                        </span>

                        <span>{option.option_text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* =========================
            PUBLISH COURSE
        ========================== */}

        <div className="course-builder-publish-section">
          {error && (
            <div className="course-builder-error course-builder-publish-error">
              <i className="bi bi-exclamation-circle-fill me-2"></i>
              {error}
            </div>
          )}
          {course.status === "PUBLISHED" ? (
            <button
              type="button"
              className="course-builder-btn course-builder-btn-secondary course-builder-publish-btn"
              onClick={handleUnpublishCourse}
              disabled={publishingCourse}
            >
              {publishingCourse ? (
                <>
                  <span className="spinner-border spinner-border-sm"></span>
                  Unpublishing...
                </>
              ) : (
                <>
                  <i className="bi bi-cloud-arrow-down"></i>
                  Unpublish Course
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              className="course-builder-btn course-builder-btn-primary course-builder-publish-btn"
              onClick={handlePublishCourse}
              disabled={publishingCourse}
            >
              {publishingCourse ? (
                <>
                  <span className="spinner-border spinner-border-sm"></span>
                  Publishing...
                </>
              ) : (
                <>
                  <i className="bi bi-cloud-arrow-up"></i>
                  Publish Course
                </>
              )}
            </button>
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
                {deleteModal.type === "chapter"
                  ? "Chapter"
                  : deleteModal.type === "subchapter"
                    ? "Subchapter"
                    : deleteModal.type === "question"
                      ? "Question"
                      : "Test"}
                ?
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

              {deleteModal.type === "test" && (
                <p className="course-builder-delete-warning">
                  All questions, options, attempts, and related test data will
                  also be permanently deleted. This action cannot be undone. The
                  course will no longer be available to learners until a new
                  valid test is created.
                </p>
              )}

              {deleteModal.type === "question" && (
                <p className="course-builder-delete-warning">
                  This question and all of its answer options will be
                  permanently deleted. This action cannot be undone.
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
