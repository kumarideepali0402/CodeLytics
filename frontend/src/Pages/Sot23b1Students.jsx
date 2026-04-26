import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2 } from "lucide-react";
import axiosClient from "../utils/axiosClient";
import {useParams} from "react-router-dom"
import {handleSuccess, handleError} from "../utils/notification"



export default function Students() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({  name: "", email: "" , password:""});
  const [students, setStudents] = useState([]);
  const [batchName, setBatchName] = useState("")


  const {batchId} = useParams();

  useEffect(() => {
    const fetchBatchStudent= async() =>{
      const res = await axiosClient.get(`/student/get/${batchId}`);
      setStudents(res.data?.students.map((s) => s.student) ?? []);
      
      setBatchName(res.data?.batchName);

    }
    fetchBatchStudent();

  },[batchId])

  const handleAddStudent = async(e) => {
    try {
      e.preventDefault();
      const res = await axiosClient.post(`/student/create`, {
        batchId,
        name:newStudent.name,
        email:newStudent.email,
        password: newStudent.password,
       });
       const student = res.data.student;
       
       handleSuccess(res.data?.msg);
       setStudents([...students, student]);
       setNewStudent({ id: "", name: "", email: "" , password:""});
       setIsModalOpen(false);
    } catch (error) {
      handleError(res.data?.msg)
      
    }

  };

  const handleRemoveStudent = (id) => {
    setStudents(students.filter((student) => student.id != id ))
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
              <th className="px-6 py-3 text-left text-sm font-semibold">ID</th>
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
                  {student.id}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {student.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {student.email}
                </td>

                {/* View button */}
                <td className="px-6 py-4 text-sm text-center">
                  <button className="px-3 py-1.5 rounded-lg border border-blue-500 text-blue-500 bg-white hover:bg-blue-500 hover:text-white transition">
                    View
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

                <form onSubmit={handleAddStudent}>
                  

                  <input
                    type="text"
                    placeholder="Name"
                    value={newStudent.name}
                    onChange={(e) =>
                      setNewStudent({ ...newStudent, name: e.target.value })
                    }
                    className="w-full px-3 py-2 mb-2 rounded-lg border"
                    required
                  />

                  <input
                    type="email"
                    placeholder="Email"
                    value={newStudent.email}
                    onChange={(e) =>
                      setNewStudent({ ...newStudent, email: e.target.value })
                    }
                    className="w-full px-3 py-2 mb-2 rounded-lg border"
                    required
                  />

                  <input
                    type="password"
                    placeholder="password"
                    value={newStudent.password}
                    onChange={(e) =>
                      setNewStudent({ ...newStudent, password: e.target.value })
                    }
                    className="w-full px-3 py-2 mb-2 rounded-lg border"
                    required
                  />

                  <div className="flex justify-end gap-1.5 px-3 py-2">
                    {/* Cancel button same theme as View */}
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition"
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
