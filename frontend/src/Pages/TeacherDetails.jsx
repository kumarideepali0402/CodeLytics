import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Edit3, Save, X, ArrowLeft, Mail, IdCard, BookOpen, User, Plus } from "lucide-react";
import axiosClient from "../utils/axiosClient";

function getInitials(name) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

function Field({ label, icon: Icon, value, editMode, inputProps }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
        {Icon && <Icon className="h-3.5 w-3.5" />} {label}
      </label>
      {editMode ? (
        <input
          {...inputProps}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
        />
      ) : (
        <p className="text-sm text-slate-700 font-medium">{value || "—"}</p>
      )}
    </div>
  );
}

export default function TeacherDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [teacher, setTeacher]           = useState(null);
  const [allBatches, setAllBatches]     = useState([]);
  const [editMode, setEditMode]         = useState(false);
  const [formData, setFormData]         = useState({ name: "", email: "", teacherEnrollmentId: "", batches: [] });
  const [savedData, setSavedData]       = useState(null);
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [saveError, setSaveError]       = useState("");
  const [saving, setSaving]             = useState(false);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    axiosClient.get(`/teacher/get/${id}`)
      .then((res) => {
        const t = res.data?.teacher ?? null;
        setTeacher(t);
        if (t) {
          setFormData({
            name: t.name ?? "",
            email: t.email ?? "",
            teacherEnrollmentId: t.teacherEnrollmentId ?? "",
            batches: Array.isArray(t.batches) ? t.batches : [],
          });
        }
        setSavedData(null);
      })
      .catch(() => setTeacher(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    axiosClient.get("/batch/get")
      .then((res) => setAllBatches(Array.isArray(res.data?.batches) ? res.data.batches : []))
      .catch(() => setAllBatches([]));
  }, []);

  const handleSave = async () => {
    setSaveError("");
    setSaving(true);
    try {
      const res = await axiosClient.patch(`/teacher/update/${id}`, {
        name: formData.name,
        email: formData.email,
        teacherEnrollmentId: formData.teacherEnrollmentId,
        batches: formData.batches,
      });
      const updated = res.data?.teacher;
      if (updated) setTeacher((prev) => prev ? { ...prev, ...updated, batches: formData.batches } : prev);
      setSavedData({ ...formData });
      setEditMode(false);
      setSelectedBatchId("");
    } catch (err) {
      setSaveError(err.response?.data?.msg || "Failed to save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const addToBatch = () => {
    if (!selectedBatchId || formData.batches.includes(selectedBatchId)) return;
    setFormData((f) => ({ ...f, batches: [...f.batches, selectedBatchId] }));
    setSelectedBatchId("");
  };

  const removeBatch = (batchId) =>
    setFormData((f) => ({ ...f, batches: f.batches.filter((b) => b !== batchId) }));

  const batchesNotAssigned = allBatches.filter((b) => !formData.batches.includes(b.id));
  const getBatchName = (batchId) => allBatches.find((b) => b.id === batchId)?.name ?? batchId;

  const display = editMode ? { ...teacher, ...formData } : savedData ? { ...teacher, ...savedData } : teacher;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
        Loading profile…
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto space-y-4">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to teachers
        </button>

        {/* Identity card */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-100 px-6 py-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl font-bold shrink-0">
                {getInitials(display.name)}
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">{display.name}</h2>
                <div className="flex flex-wrap gap-2 mt-1">
                  <span className="inline-flex items-center gap-1 text-xs text-slate-500 bg-white border border-slate-200 rounded-lg px-2 py-0.5">
                    <Mail className="h-3 w-3" /> {display.email}
                  </span>
                  {display.teacherEnrollmentId && (
                    <span className="text-xs text-slate-600 bg-white border border-slate-200 rounded-lg px-2 py-0.5 font-medium">
                      {display.teacherEnrollmentId}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Edit / Save actions */}
            <AnimatePresence mode="wait">
              {editMode ? (
                <motion.div
                  key="edit-actions"
                  initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
                  className="flex flex-col items-end gap-1.5 shrink-0"
                >
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setEditMode(false); setSaveError(""); }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 transition"
                    >
                      <X className="h-3.5 w-3.5" /> Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 disabled:opacity-60 transition"
                    >
                      <Save className="h-3.5 w-3.5" /> {saving ? "Saving…" : "Save"}
                    </button>
                  </div>
                  {saveError && <p className="text-xs text-red-500">{saveError}</p>}
                </motion.div>
              ) : (
                <motion.button
                  key="edit-btn"
                  initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
                  onClick={() => { setSaveError(""); setSelectedBatchId(""); setEditMode(true); }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-white text-xs font-semibold hover:bg-slate-700 transition shrink-0"
                >
                  <Edit3 className="h-3.5 w-3.5" /> Edit profile
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Details section */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
            <User className="h-3.5 w-3.5 text-slate-400" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Details</h3>
          </div>
          <div className="px-6 py-5 space-y-5">
            <Field
              label="Full name" icon={User}
              value={display.name}
              editMode={editMode}
              inputProps={{
                type: "text", placeholder: "Full name", value: formData.name,
                onChange: (e) => setFormData({ ...formData, name: e.target.value }),
              }}
            />
            <Field
              label="Email" icon={Mail}
              value={display.email}
              editMode={editMode}
              inputProps={{
                type: "email", placeholder: "Email", value: formData.email,
                onChange: (e) => setFormData({ ...formData, email: e.target.value }),
              }}
            />
            <Field
              label="Enrollment ID" icon={IdCard}
              value={display.teacherEnrollmentId}
              editMode={editMode}
              inputProps={{
                type: "text", placeholder: "Teacher Enrollment ID", value: formData.teacherEnrollmentId,
                onChange: (e) => setFormData({ ...formData, teacherEnrollmentId: e.target.value }),
              }}
            />
          </div>
        </div>

        {/* Assigned batches */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
            <BookOpen className="h-3.5 w-3.5 text-slate-400" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Assigned Batches</h3>
          </div>
          <div className="px-6 py-5">
            {editMode ? (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <select
                    value={selectedBatchId}
                    onChange={(e) => setSelectedBatchId(e.target.value)}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                  >
                    <option value="">Choose a batch…</option>
                    {batchesNotAssigned.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                    {batchesNotAssigned.length === 0 && (
                      <option value="" disabled>All batches assigned</option>
                    )}
                  </select>
                  <button
                    type="button"
                    onClick={addToBatch}
                    disabled={!selectedBatchId}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 disabled:opacity-50 transition"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.batches.length === 0 ? (
                    <p className="text-sm text-slate-400 italic">No batches assigned yet.</p>
                  ) : formData.batches.map((batchId) => (
                    <span
                      key={batchId}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-medium"
                    >
                      {getBatchName(batchId)}
                      <button
                        type="button"
                        onClick={() => removeBatch(batchId)}
                        className="rounded-full p-0.5 hover:bg-emerald-200 transition"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {display.batches?.length > 0 ? (
                  display.batches.map((batchId) => (
                    <span
                      key={batchId}
                      className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-medium"
                    >
                      {getBatchName(batchId)}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-slate-400 italic">Not assigned to any batch yet.</p>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
