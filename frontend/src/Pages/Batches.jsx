import React, { useEffect, useState } from "react";
import axiosClient from "../utils/axiosClient";

function Batches() {
  const [batches, setBatches] = useState([]);
  const [batchName, setBatchName] = useState("");

  // Fetch existing batches
  const fetchBatches = async () => {
    try {
      const res = await axiosClient.get("/batch/get");
      setBatches(res.data || []);
    } catch (err) {
      console.error("Error fetching batches:", err);
    }
  };

  // Create new batch
  const createBatch = async () => {
    if (!batchName.trim()) return;
    try {
      await axiosClient.post("/batch/create", { name: batchName });
      setBatchName("");
      fetchBatches(); // refresh
    } catch (err) {
      console.error("Error creating batch:", err);
    }
  };

  // Delete batch
  const deleteBatch = async (id) => {
    try {
      await axiosClient.delete(`/batch/delete/${id}`);
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

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          type="text"
          placeholder="Batch Name"
          value={batchName}
          onChange={(e) => setBatchName(e.target.value)}
          className="border p-2 rounded w-full sm:w-64"
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
