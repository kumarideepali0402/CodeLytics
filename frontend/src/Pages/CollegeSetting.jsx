import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, Building2, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../utils/axiosClient";
import { handleError, handleSuccess } from "../utils/notification";


export default function CollegeSetting() {
  const navigate = useNavigate();
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [newCollege, setNewCollege] = useState({ name: "", email: "", password: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        setFetchError(null);
        const res = await axiosClient.get("/college");
        if (res.data?.colleges) setColleges(res.data.colleges);
      } catch (err) {
        const msg = err.response?.data?.message || err.response?.data?.error || "Failed to load colleges.";
        setFetchError(msg);
        handleError(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchColleges();
  }, []);

  const handleAddCollege = async (e) => {
    e.preventDefault();
    if (!newCollege.name?.trim() || !newCollege.email?.trim() || !newCollege.password) return;
    setIsSubmitting(true);
    try {
      const res = await axiosClient.post("/college/register", {
        name: newCollege.name.trim(),
        email: newCollege.email.trim(),
        password: newCollege.password,
      });
      const { college, msg } = res.data;
      if (college) {
        setColleges((prev) => [...prev, { id: college.id, name: college.name, email: college.email }]);
        handleSuccess(msg || "College added successfully.");
      }
      setNewCollege({ name: "", email: "", password: "" });
      setIsModalOpen(false);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || "Failed to add college.";
      handleError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const gradients = [
    "from-purple-50 to-purple-100",
    "from-violet-50 to-violet-100",
    "from-fuchsia-50 to-fuchsia-100",
    "from-indigo-50 to-indigo-100",
    "from-slate-50 to-slate-100",
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 mx-3 my-3 sm:mx-10 sm:my-10 rounded-2xl sm:rounded-3xl px-4 sm:px-10 py-5 shadow-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-around sm:items-center gap-4 w-full">
        <div>
          <div className="text-2xl sm:text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
            College <span className="text-black">Management</span>
          </div>
          <div className="text-lg sm:text-2xl font-medium text-gray-600">
            Add and Manage Colleges
          </div>
        </div>
        <Building2 className="hidden sm:block text-purple-500" size={120} strokeWidth={1.5} />
      </div>

      {/* Add College Button */}
      <div className="flex justify-end mt-10">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-purple-600 to-violet-500 px-4 py-2 text-white rounded-xl shadow-md hover:scale-105 hover:shadow-lg transition flex items-center gap-2"
        >
          <PlusCircle size={16} /> Add New College
        </button>
      </div>

      {/* College Cards */}
      <div className="flex flex-wrap gap-5 mx-2 mt-5">
        {loading && (
          <div className="flex items-center gap-2 text-gray-500 py-8">
            <Loader2 className="animate-spin" size={24} />
            <span>Loading colleges…</span>
          </div>
        )}
        {!loading && fetchError && (
          <div className="text-red-600 py-4">{fetchError}</div>
        )}
        {!loading && !fetchError && colleges.length === 0 && (
          <div className="text-gray-500 py-8">No colleges yet. Add one using the button above.</div>
        )}
        {!loading && !fetchError && colleges.map((college, index) => (
          <motion.div
            key={college.id}
            onClick={() => navigate(`/college-dashboard/${college.id}`)}
            whileHover={{ scale: 1.03 }}
            className={`relative bg-gradient-to-br ${gradients[index % gradients.length]} text-gray-800 border border-gray-200 rounded-2xl p-5 hover:shadow-md cursor-pointer transition opacity-0 translate-y-4 animate-fadeInUp w-3xs min-w-[200px]`}
          >
            <Building2
              fill="currentColor"
              strokeWidth={0}
              size={26}
              className="text-purple-600 absolute top-2 right-4"
            />
            <div className="font-bold text-lg">{college.name}</div>
            <div className="text-sm text-gray-600 truncate">{college.email}</div>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex justify-center items-center z-50"
            onClick={() => !isSubmitting && setIsModalOpen(false)}
          >
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm mx-4 border border-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold mb-1 text-gray-800">Add New College</h3>
              <p className="text-xs text-gray-500 mb-4">Fields match College model: name, email, password.</p>

              <form onSubmit={handleAddCollege} className="space-y-3">
                <div>
                  <label htmlFor="college-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name <span className="text-gray-400 font-normal">(College.name)</span>
                  </label>
                  <input
                    id="college-name"
                    type="text"
                    placeholder="Institution name"
                    value={newCollege.name}
                    onChange={(e) => setNewCollege({ ...newCollege, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="college-email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-gray-400 font-normal">(College.email, unique)</span>
                  </label>
                  <input
                    id="college-email"
                    type="email"
                    placeholder="admin@college.edu"
                    value={newCollege.email}
                    onChange={(e) => setNewCollege({ ...newCollege, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="college-password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password <span className="text-gray-400 font-normal">(stored as password_hash)</span>
                  </label>
                  <input
                    id="college-password"
                    type="password"
                    placeholder="Min 6 characters"
                    value={newCollege.password}
                    onChange={(e) => setNewCollege({ ...newCollege, password: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                    minLength={6}
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => !isSubmitting && setIsModalOpen(false)}
                    className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition flex items-center gap-2 disabled:opacity-60"
                  >
                    <PlusCircle size={16} /> {isSubmitting ? "Adding…" : "Add College"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
