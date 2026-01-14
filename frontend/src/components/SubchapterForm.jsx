import React, { useState } from "react";
import { createSubchapter } from "../../services/instructorApi";

const SubchapterForm = ({ chapter }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [subchapters, setSubchapters] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const subchapter = await createSubchapter(chapter.id, {
      title,
      content
    });

    setSubchapters([...subchapters, subchapter]);
    setTitle("");
    setContent("");
  };

  return (
    <div style={{ marginLeft: "20px" }}>
      <h4>Chapter: {chapter.title}</h4>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Subchapter title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button type="submit">Add Subchapter</button>
      </form>

      <ul>
        {subchapters.map((s) => (
          <li key={s.id}>{s.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default SubchapterForm;
