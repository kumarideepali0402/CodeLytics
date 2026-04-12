import React, { useEffect, useState } from "react";
import axiosClient from "../utils/axiosClient";

function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [teacherName, setTeacherName] = useState("");
  const [teacherEmail, setTeacherEmail] = useState("");

  // Fetch teachers (⚠️ Make sure backend has /teacher/get implemented)
  const fetchTeachers = async () => {
    try {
      const res = await axiosClient.get("/teacher/get");
      setTeachers(res.data || []);
    } catch (err) {
      console.error("Error fetching teachers:", err);
    }
  };

  // Add teacher
  const addTeacher = async () => {
    if (!teacherName.trim() || !teacherEmail.trim()) return;
    try {
      await axiosClient.post("/teacher/add", { name: teacherName, email: teacherEmail });
      setTeacherName("");
      setTeacherEmail("");
      fetchTeachers();
    } catch (err) {
      console.error("Error adding teacher:", err);
    }
  };

  // Delete teacher
  const deleteTeacher = async (id) => {
    try {
      await axiosClient.delete(`/teacher/delete/${id}`);
      fetchTeachers();
    } catch (err) {
      console.error("Error deleting teacher:", err);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Manage Teachers</h2>

      <div className="flex space-x-2 mb-4">
        <input
          type="text"
          placeholder="Teacher Name"
          value={teacherName}
          onChange={(e) => setTeacherName(e.target.value)}
          className="border p-2 rounded w-48"
        />
        <input
          type="email"
          placeholder="Teacher Email"
          value={teacherEmail}
          onChange={(e) => setTeacherEmail(e.target.value)}
          className="border p-2 rounded w-64"
        />
        <button
          onClick={addTeacher}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Add Teacher
        </button>
      </div>

      <ul className="space-y-2">
        {teachers.map((teacher) => (
          <li
            key={teacher._id}
            className="flex justify-between items-center bg-white shadow p-3 rounded"
          >
            <span>
              {teacher.name} ({teacher.email})
            </span>
            <button
              onClick={() => deleteTeacher(teacher._id)}
              className="bg-red-600 text-white px-3 py-1 rounded"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Teachers;
