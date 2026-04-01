import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Edit3, Save, X, ArrowLeft, Mail, IdCard, BookOpen, User, Plus } from "lucide-react";
import axios from "axios";
import { API_BASE } from "../config/apiBase";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

function getInitials(name) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function TeacherDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [allBatches, setAllBatches] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    teacherEnrollmentId: "",
    batches: [],
  });
  const [savedData, setSavedData] = useState(null);
  const [selectedBatchId, setSelectedBatchId] = useState("");

  useEffect(() => {
    if (!id) return;
    async function fetchTeacherById() {
      try {
        const res = await api.get(`/teacher/get/${id}`);
        const t = res.data?.teacher ?? null;
        setTeacher(t);
        if (t) {
          const batchIds = Array.isArray(t.batches) ? t.batches : [];
          setFormData({
            name: t.name ?? "",
            email: t.email ?? "",
            teacherEnrollmentId: t.teacherEnrollmentId ?? "",
            batches: batchIds,
          });
        }
        setSavedData(null);
      } catch (_) {
        setTeacher(null);
      }
    }
    fetchTeacherById();
  }, [id]);

  useEffect(() => {
    async function fetchAllBatches() {
      try {
        const res = await api.get("/batch/get");
        const list = res.data?.batches ?? [];
        setAllBatches(Array.isArray(list) ? list : []);
      } catch (_) {
        setAllBatches([]);
      }
    }
    fetchAllBatches();
  }, []);

  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaveError("");
    setSaving(true);
    try {
      const res = await api.patch(`/teacher/update/${id}`, {
        name: formData.name,
        email: formData.email,
        teacherEnrollmentId: formData.teacherEnrollmentId,
        batches: formData.batches,
      });
      const updated = res.data?.teacher;
      if (updated) {
        setTeacher((prev) => (prev ? { ...prev, ...updated, batches: formData.batches } : prev));
      }
      setSavedData({ ...formData });
      setEditMode(false);
      setSelectedBatchId("");
    } catch (err) {
      setSaveError(err.response?.data?.msg || "Failed to save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const addTeacherToBatch = () => {
    if (!selectedBatchId || formData.batches.includes(selectedBatchId)) return;
    setFormData((f) => ({ ...f, batches: [...f.batches, selectedBatchId] }));
    setSelectedBatchId("");
  };

  const removeBatch = (batchId) => {
    setFormData((f) => ({ ...f, batches: f.batches.filter((id) => id !== batchId) }));
  };

  const batchesNotAssigned = allBatches.filter((b) => !formData.batches.includes(b.id));
  const getBatchName = (batchId) => allBatches.find((b) => b.id === batchId)?.name ?? batchId;

  const displayTeacher = editMode ? { ...teacher, ...formData } : savedData ? { ...teacher, ...savedData } : teacher;

  if (!teacher) {
    return (
      <div
        className="bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-100 flex items-center justify-center"
        style={{ minHeight: "100vh", padding: "4vh 4vw" }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl border border-slate-200 text-center"
          style={{ padding: "5vh 5vw", maxWidth: "90vw" }}
        >
          <p className="text-slate-600" style={{ marginBottom: "3vh", fontSize: "min(2.5vw, 2vh)" }}>
            Teacher not found for ID: <strong>{id ?? "—"}</strong>
          </p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition"
          >
            <ArrowLeft size={18} /> Back
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-100"
      style={{ minHeight: "100vh", padding: "4vh 4vw" }}
    >
      <div style={{ maxWidth: "90vw", margin: "0 auto" }}>
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition"
          style={{ marginBottom: "3vh" }}
        >
          <ArrowLeft size={20} /> Back to teachers
        </button>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="bg-white shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden"
          style={{ borderRadius: "2vw" }}
        >
          {/* Profile header strip */}
          <div
            className="bg-gradient-to-r from-emerald-600 to-teal-600"
            style={{ height: "18vh" }}
          />

          <div className="relative" style={{ padding: "0 4vw 4vh" }}>
            {/* Avatar + name row */}
            <div
              className="flex flex-col sm:flex-row sm:items-end sm:justify-between"
              style={{ gap: "2vh", marginTop: "-12vh" }}
            >
              <div
                className="flex flex-col sm:flex-row items-start sm:items-end"
                style={{ gap: "2vw" }}
              >
                <div
                  className="rounded-2xl bg-white shadow-lg border-4 border-white flex items-center justify-center text-emerald-600 font-bold shrink-0"
                  style={{
                    width: "min(22vw, 14vh)",
                    height: "min(22vw, 14vh)",
                    fontSize: "min(4vw, 3vh)",
                  }}
                >
                  {getInitials(displayTeacher.name)}
                </div>
                <div style={{ paddingBottom: "0.5vh" }}>
                  <h1
                    className="font-bold text-slate-800 tracking-tight"
                    style={{ fontSize: "min(5vw, 4vh)" }}
                  >
                    {displayTeacher.name}
                  </h1>
                  <span
                    className="inline-block rounded-full font-medium bg-emerald-100 text-emerald-700"
                    style={{ marginTop: "1vh", padding: "0.8vh 1.2vw", fontSize: "min(2.2vw, 1.8vh)" }}
                  >
                    {teacher.role || "Faculty"}
                  </span>
                </div>
              </div>
              <div style={{ gap: "1vw" }} className="flex items-center">
                <AnimatePresence mode="wait">
                  {editMode ? (
                    <motion.div
                      key="edit-actions"
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "1vw" }}
                    >
                      <div className="flex" style={{ gap: "1vw" }}>
                      <button
                        onClick={() => setEditMode(false)}
                        className="inline-flex items-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        style={{ gap: "0.8vw", padding: "1.5vh 2vw" }}
                      >
                        <X size={18} /> Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="inline-flex items-center rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-200 transition focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-70 disabled:cursor-not-allowed"
                        style={{ gap: "0.8vw", padding: "1.5vh 2.5vw" }}
                      >
                        <Save size={18} /> {saving ? "Saving…" : "Save"}
                      </button>
                      </div>
                      {saveError && (
                        <p className="text-red-600" style={{ fontSize: "min(2vw, 1.6vh)" }}>
                          {saveError}
                        </p>
                      )}
                    </motion.div>
                  ) : (
                    <motion.button
                      key="edit-btn"
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      onClick={() => { setSaveError(""); setSelectedBatchId(""); setEditMode(true); }}
                      className="inline-flex items-center rounded-xl bg-slate-800 text-white hover:bg-slate-700 transition focus:outline-none focus:ring-2 focus:ring-slate-500"
                      style={{ gap: "0.8vw", padding: "1.5vh 2.5vw" }}
                    >
                      <Edit3 size={18} /> Edit profile
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Info cards */}
            <div style={{ marginTop: "5vh", display: "flex", flexDirection: "column", gap: "4vh" }}>
              <section
                className="border border-slate-200 bg-slate-50/50 overflow-hidden"
                style={{ borderRadius: "1.5vw" }}
              >
                <div
                  className="border-b border-slate-200 bg-white/80 flex items-center"
                  style={{ padding: "1.5vh 2vw" }}
                >
                  <h2
                    className="font-semibold text-slate-500 uppercase tracking-wider flex items-center"
                    style={{ gap: "0.8vw", fontSize: "min(2.5vw, 2vh)" }}
                  >
                    <User size={16} /> Details
                  </h2>
                </div>
                <div style={{ padding: "2.5vh 2.5vw", display: "flex", flexDirection: "column", gap: "2.5vh" }}>
                  <div>
                    <label
                      className="font-medium text-slate-500 uppercase tracking-wider block"
                      style={{ fontSize: "min(2.2vw, 1.8vh)" }}
                    >
                      Full name
                    </label>
                    {editMode ? (
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        style={{ marginTop: "1vh", padding: "1.5vh 1.5vw", fontSize: "min(2.5vw, 2vh)" }}
                        placeholder="Full name"
                      />
                    ) : (
                      <p className="text-slate-800 font-medium" style={{ marginTop: "1vh", fontSize: "min(2.5vw, 2vh)" }}>
                        {displayTeacher.name}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      className="font-medium text-slate-500 uppercase tracking-wider flex items-center"
                      style={{ fontSize: "min(2.2vw, 1.8vh)", gap: "0.5vw" }}
                    >
                      <Mail size={14} /> Email
                    </label>
                    {editMode ? (
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        style={{ marginTop: "1vh", padding: "1.5vh 1.5vw", fontSize: "min(2.5vw, 2vh)" }}
                        placeholder="Email"
                      />
                    ) : (
                      <p className="text-slate-700" style={{ marginTop: "1vh", fontSize: "min(2.5vw, 2vh)" }}>
                        {displayTeacher.email}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      className="font-medium text-slate-500 uppercase tracking-wider flex items-center"
                      style={{ fontSize: "min(2.2vw, 1.8vh)", gap: "0.5vw" }}
                    >
                      <IdCard size={14} /> Enrollment ID
                    </label>
                    {editMode ? (
                      <input
                        type="text"
                        value={formData.teacherEnrollmentId}
                        onChange={(e) =>
                          setFormData({ ...formData, teacherEnrollmentId: e.target.value })
                        }
                        className="w-full rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        style={{ marginTop: "1vh", padding: "1.5vh 1.5vw", fontSize: "min(2.5vw, 2vh)" }}
                        placeholder="Teacher Enrollment ID"
                      />
                    ) : (
                      <p className="text-slate-700 font-mono" style={{ marginTop: "1vh", fontSize: "min(2.5vw, 2vh)" }}>
                        {displayTeacher.teacherEnrollmentId || "—"}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              <section
                className="border border-slate-200 bg-slate-50/50 overflow-hidden"
                style={{ borderRadius: "1.5vw" }}
              >
                <div
                  className="border-b border-slate-200 bg-white/80 flex items-center"
                  style={{ padding: "1.5vh 2vw" }}
                >
                  <h2
                    className="font-semibold text-slate-500 uppercase tracking-wider flex items-center"
                    style={{ gap: "0.8vw", fontSize: "min(2.5vw, 2vh)" }}
                  >
                    <BookOpen size={16} /> Assigned batches
                  </h2>
                </div>
                <div style={{ padding: "2.5vh 2.5vw" }}>
                  {editMode ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "2vh" }}>
                      <div className="flex flex-wrap items-center" style={{ gap: "1vw" }}>
                        <select
                          value={selectedBatchId}
                          onChange={(e) => setSelectedBatchId(e.target.value)}
                          className="rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          style={{
                            padding: "1.5vh 1.5vw",
                            fontSize: "min(2.5vw, 2vh)",
                            minWidth: "min(25vw, 200px)",
                          }}
                        >
                          <option value="">Choose a batch to add…</option>
                          {batchesNotAssigned.map((batch) => (
                            <option key={batch.id} value={batch.id}>
                              {batch.name}
                            </option>
                          ))}
                          {batchesNotAssigned.length === 0 && (
                            <option value="" disabled>All batches already assigned</option>
                          )}
                        </select>
                        <button
                          type="button"
                          onClick={addTeacherToBatch}
                          disabled={!selectedBatchId}
                          className="inline-flex items-center rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                          style={{ gap: "0.5vw", padding: "1.5vh 1.5vw", fontSize: "min(2.2vw, 1.8vh)" }}
                        >
                          <Plus size={18} /> Add to batch
                        </button>
                      </div>
                      <div className="flex flex-wrap items-center" style={{ gap: "1vw" }}>
                        <span className="text-slate-500" style={{ fontSize: "min(2.2vw, 1.8vh)" }}>
                          In batches:
                        </span>
                        {formData.batches.length === 0 ? (
                          <span className="text-slate-400" style={{ fontSize: "min(2.2vw, 1.8vh)" }}>
                            None — use dropdown above to add
                          </span>
                        ) : (
                          formData.batches.map((batchId) => (
                            <span
                              key={batchId}
                              className="inline-flex items-center rounded-lg bg-emerald-100 text-emerald-800 font-medium"
                              style={{ padding: "1vh 1vw", fontSize: "min(2.2vw, 1.8vh)", gap: "0.5vw" }}
                            >
                              {getBatchName(batchId)}
                              <button
                                type="button"
                                onClick={() => removeBatch(batchId)}
                                className="rounded-full p-0.5 hover:bg-emerald-200 transition"
                                aria-label={`Remove from ${getBatchName(batchId)}`}
                              >
                                <X size={14} />
                              </button>
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap" style={{ gap: "1vw" }}>
                      {displayTeacher.batches?.length > 0 ? (
                        displayTeacher.batches.map((batchId) => (
                          <span
                            key={batchId}
                            className="inline-flex items-center rounded-lg bg-emerald-100 text-emerald-800 font-medium"
                            style={{ padding: "1vh 1.2vw", fontSize: "min(2.2vw, 1.8vh)" }}
                          >
                            {getBatchName(batchId)}
                          </span>
                        ))
                      ) : (
                        <p className="text-slate-500" style={{ fontSize: "min(2.2vw, 1.8vh)" }}>
                          Not assigned to any batch yet.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </section>
            </div>          </div>
        </motion.div>
      </div>
    </div>
  );
}
