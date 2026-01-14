import React, { useState } from "react";
import { createChapter } from "../../services/instructorApi";

const ChapterForm = ({ courseId, onChapterCreated }) => {
  const [title, setTitle] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const chapter = await createChapter(courseId, { title });
    onChapterCreated(chapter);
    setTitle("");
  };

  return (
    <>
      <h3>Add Chapter</h3>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Chapter title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button type="submit">Add Chapter</button>
      </form>
    </>
  );
};

export default ChapterForm;
