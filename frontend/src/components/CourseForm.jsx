import React, { useState } from "react";
import { createCourse } from "../../services/instructorApi";

const CourseForm = ({ instructorId, onCourseCreated }) => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    duration: "",
    target_professional_title: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const course = await createCourse(instructorId, {
      ...form,
      price: Number(form.price) || null,
    });

    onCourseCreated(course);
  };

  return (
    <>
      <h2>Create Course</h2>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Title"
          required
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <input
          placeholder="Description"
          required
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <select
          value={form.target_professional_title}
          required
          onChange={(e) =>
            setForm({
              ...form,
              target_professional_title: e.target.value,
            })
          }
        >
          <option value="">Select professional title</option>
          <option value="Veterinary Technician (A1, A2)">
            Veterinary Technician (A1, A2)
          </option>
          <option value="Veterinary Technologist">
            Veterinary Technologist
          </option>
          <option value="Animal Scientist">Animal Scientist</option>
          <option value="Veterinary Doctor">Veterinary Doctor</option>
        </select>
        <input
          placeholder="Price (RWF)"
          type="number"
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />
        <input
          placeholder="Duration (seconds)"
          onChange={(e) => setForm({ ...form, duration: e.target.value })}
        />
        <button type="submit">Create Course</button>
      </form>
    </>
  );
};

export default CourseForm;
