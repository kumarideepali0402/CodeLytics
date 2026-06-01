import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, User } from "lucide-react";
import axiosClient from "../utils/axiosClient";
import { useParams, useNavigate } from "react-router-dom"
import {handleSuccess, handleError} from "../utils/notification"



export default function Students() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: "", email: "", password: "", studentEnrollmentId: "" });
  const [students, setStudents] = useState([]);
  const [batchName, setBatchName] = useState("");
  const [loading, setLoading]    = useState(true);


  const { batchId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBatchStudent = async () => {
      try {
        const res = await axiosClient.get(`/student/get/${batchId}`);
        setStudents(res.data?.students.map((s) => s.student) ?? []);
        setBatchName(res.data?.batchName);
      } catch (_) {
      } finally {
        setLoading(false);
      }
    };
    fetchBatchStudent();

  },[batchId])

  const handleAddStudent = async(e) => {
    try {
      e.preventDefault();
      const res = await axiosClient.post(`/student/create`, {
        batchId,
        name: newStudent.name,
        email: newStudent.email,
        password: newStudent.password,
        studentEnrollmentId: newStudent.studentEnrollmentId || undefined,
       });
       const student = res.data.student;
       
       handleSuccess(res.data?.msg);
       setStudents([...students, student]);
       setNewStudent({ name: "", email: "", password: "", studentEnrollmentId: "" });
       setIsModalOpen(false);
    } catch (error) {
      handleError(res.data?.msg)
      
    }

  };

  const handleRemoveStudent = (id) => {
    setStudents(students.filter((student) => student.id != id ))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
        Loading students…
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
          {batchName ? `${batchName} · Students` : "Students"}
        </h2>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex shrink-0 items-center justify-center rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
        >
          + Add Student
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-100">
        <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-slate-800 text-white">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Roll No.</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
              <th className="px-6 py-3 text-center text-sm font-semibold">
                Profile
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold">
                Remove
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {students.map((student, index) => (
              <tr className="transition hover:bg-sky-50/50" key={student.id}>
                <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                  {student.studentEnrollmentId || "—"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {student.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {student.email}
                </td>

                {/* View button */}
                <td className="px-6 py-4 text-sm text-center">
                  <button
                    onClick={() => navigate(`/batch/${batchId}/students/${student.id}`)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition text-xs font-medium"
                  >
                    <User className="w-3.5 h-3.5" /> View Profile
                  </button>
                </td>

                {/* Remove button with dustbin */}
                <td className="px-6 py-4 text-sm text-center">
                  <button className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition" onClick={()=>handleRemoveStudent(student.id)}>
                    <Trash2 className="w-4 h-4"  />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

        {/* Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gradient-to-br from-gray-900/40 to-gray-600/20 flex justify-center items-center z-50"
              onClick={() => setIsModalOpen(false)}
            >
              <motion.div
                key="modal"
                initial={{ opacity: 0, scale: 0.9, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-semibold mb-4">Add New Student</h3>

                <form onSubmit={handleAddStudent} autoComplete="off">

                  <div className="space-y-3 mb-5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Name <span className="text-red-400">*</span></label>
                      <input
                        type="text"
                        placeholder="Full name"
                        value={newStudent.name}
                        onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                        autoComplete="off"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Roll / Enrollment ID</label>
                      <input
                        type="text"
                        placeholder="e.g. 2023CSE042"
                        value={newStudent.studentEnrollmentId}
                        onChange={(e) => setNewStudent({ ...newStudent, studentEnrollmentId: e.target.value })}
                        autoComplete="off"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Email <span className="text-red-400">*</span></label>
                      <input
                        type="email"
                        placeholder="student@example.com"
                        value={newStudent.email}
                        onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                        autoComplete="off"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Password <span className="text-red-400">*</span></label>
                      <input
                        type="password"
                        placeholder="Set a password"
                        value={newStudent.password}
                        onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                        autoComplete="new-password"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 transition shadow-sm"
                    >
                      Add Student
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
    </div>
  );
}
