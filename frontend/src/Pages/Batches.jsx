import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../config/apiBase";

function Batches() {
  const [batches, setBatches] = useState([]);
  const [batchName, setBatchName] = useState("");

  // Fetch existing batches
  const fetchBatches = async () => {
    try {
      const res = await axios.get(`${API_BASE}/batch/get`, { withCredentials: true });
      setBatches(res.data || []);
    } catch (err) {
      console.error("Error fetching batches:", err);
    }
  };

  // Create new batch
  const createBatch = async () => {
    if (!batchName.trim()) return;
    try {
      await axios.post(
        `${API_BASE}/batch/create`,
        { name: batchName },
        { withCredentials: true }
      );
      setBatchName("");
      fetchBatches(); // refresh
    } catch (err) {
      console.error("Error creating batch:", err);
    }
  };

  // Delete batch
  const deleteBatch = async (id) => {
    try {
      await axios.delete(`${API_BASE}/batch/delete/${id}`, { withCredentials: true });
      fetchBatches();
    } catch (err) {
      console.error("Error deleting batch:", err);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Manage Batches</h2>

      <div className="flex space-x-2 mb-4">
        <input
          type="text"
          placeholder="Batch Name"
          value={batchName}
          onChange={(e) => setBatchName(e.target.value)}
          className="border p-2 rounded w-64"
        />
        <button
          onClick={createBatch}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Create Batch
        </button>
      </div>

      <ul className="space-y-2">
        {batches.map((batch) => (
          <li
            key={batch._id}
            className="flex justify-between items-center bg-white shadow p-3 rounded"
          >
            {batch.name}
            <button
              onClick={() => deleteBatch(batch._id)}
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

export default Batches;
