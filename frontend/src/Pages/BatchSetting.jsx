import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, BookmarkCheck } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { handleError, handleSuccess } from "../utils/notification";
import axiosClient from "../utils/axiosClient";

export default function BatchSetting() {
  const navigate = useNavigate();
  const { collegeId } = useParams();

  

  const [batches, setBatches] = useState([]);

  // ----- How I did it earlier (commented; was giving errors) -----
  // const [newBatch, setNewBatch] = useState();
  // newBatch must be an object e.g. { name: "" }. useState() with no arg made newBatch undefined, so newBatch.name
  // threw when reading in the form. This should have been done this way to avoid "Cannot read property 'name' of undefined".
  const [newBatch, setNewBatch] = useState({ name: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBatchError, showBatchError] = useState("");
  const [isZeroBatch, setIsZeroBatch] = useState(false) ;

  const [isBatchLoading, setIsBatchLoading] = useState(false) ;

  // ----- How I did it earlier (commented; was giving errors) -----
  // useEffect(()=>{
  //   async function getBatches() {
  //     try {
  //       setIsBatchLoading(true);
  //       const res = await axiosClient.get("/batch/get");
  //       if (res.data?.batches) setBatches(res.data.batches);
  //       setIsBatchLoading(false);
  //       if(batches.length == 0) setIsZeroBatch(true)
  //     } catch (error) {
  //       setIsBatchLoading(false);
  //       console.log("Error fetching the batches");
  //       showBatchError(error.msg);
  //     }
  //   }
  //   getBatches();
  // },[]);
  useEffect(() => {
    async function getBatches() {
      try {
        setIsBatchLoading(true);
        showBatchError("");
        const res = await axiosClient.get("/batch/get");
        if (res.data?.batches) {
          setBatches(res.data.batches);
          // Check length from response; setState is async so batches.length here would still be stale.
          setIsZeroBatch(res.data.batches.length === 0);
        }
        setIsBatchLoading(false);
      } catch (error) {
        setIsBatchLoading(false);
        console.error("Error fetching the batches", error);
        showBatchError(error.response?.data?.msg || error.response?.data?.error || "Failed to load batches.");
      }
    }
    getBatches();
  }, []); 
  
  // ----- How I did it earlier (commented; was giving errors) -----
  // const handleAddBatch = async(e) => {
  //   e.preventDefault();
  //   if(!newBatch.name) return;
  //   try {
  //     const newBatch = await axiosClient.post("/batch/create", { name : newBatch.name, collegeId });
  //     handleSuccess("Batch Created");
  //     setBatches([...batches, newBatch])
  //   } catch (error) {
  //     const msg = error.respone?.data?.msg;
  //     handleSuccess(msg);
  //   }
  // };
  const handleAddBatch = async (e) => {
    e.preventDefault();
    if (!newBatch?.name?.trim()) return;
    try {
      // Backend gets collegeId from the auth token; don't send it. Use res (not const newBatch) to avoid shadowing state.
      const res = await axiosClient.post("/batch/create", { name: newBatch.name.trim() });
      const createdBatch = res.data?.batch;
      if (createdBatch) {
        handleSuccess("Batch created.");
        setBatches((prev) => [...prev, createdBatch]);
        setIsZeroBatch(false); // so the list is shown (it only renders when !isZeroBatch)
        setNewBatch({ name: "" });
        setIsModalOpen(false);
      }
    } catch (error) {
      const msg = error.response?.data?.msg || error.response?.data?.error || "Failed to create batch.";
      handleError(msg);
    }
  };

  // Soft professional gradients
  const gradients = [
    "from-blue-50 to-blue-100",
    "from-gray-50 to-gray-100",
    "from-teal-50 to-teal-100",
    "from-indigo-50 to-indigo-100",
    "from-slate-50 to-slate-100"
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 mx-10 my-10 rounded-3xl px-10 py-5 shadow-md">
      {/* Header */}
      <div className="flex justify-around items-center w-full">
        <div>
          <div className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-gray-700 bg-clip-text text-transparent">
            Batch <span className="text-black">Management</span>
          </div>
          <div className="text-2xl font-medium text-gray-600">
            Create and Edit Batches
          </div>
        </div>
        <img src="../public/images/batchSetting.png" alt="" height={400} width={300} />
      </div>

      {/* Add Batch Button */}
      <div className="flex justify-end mt-10">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-2 text-white rounded-xl shadow-md hover:scale-105 hover:shadow-lg transition flex items-center gap-2"
        >
          <PlusCircle size={16} /> Add New Batch
        </button>
      </div>



      {/* Batch Cards */}
      {isBatchLoading && (
        <div className="text-gray-500 py-8">Loading batches…</div>
      )}
      {isBatchError && (
        <div className="text-2xl text-red-700"> {isBatchError} </div>
      )}
      {!isBatchLoading && isZeroBatch && (
        <div className="text-2xl text-black">No batches present, create one. </div>
      )}

      {!isBatchLoading && !isZeroBatch && !isBatchError && (
        <div className="flex flex-wrap gap-5 mx-2 mt-5">
          {batches.map((batch, index) => (
            <motion.div
              key={batch.id}
              onClick={() => navigate(`/batch/${batch.id}`)}
              whileHover={{ scale: 1.03 }}
              className={`relative bg-gradient-to-br ${gradients[index % gradients.length]} text-gray-800 border border-gray-200 rounded-2xl p-5 hover:shadow-md cursor-pointer transition opacity-0 translate-y-4 animate-fadeInUp w-3xs`}
            >
              <BookmarkCheck
                fill="currentColor"
                strokeWidth={0}
                size={26}
                className="text-blue-600 absolute top-2 right-4"
              />
              <div className="font-bold text-lg">{batch.name}</div>
            </motion.div>
          ))}
        </div>
      )}
      

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex justify-center items-center z-50"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-white p-6 rounded-xl shadow-lg w-96 border border-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Add New Batch</h3>

              <form onSubmit={handleAddBatch}>
                <input
                  type="text"
                  placeholder="Batch Name"
                  value={newBatch.name}
                  onChange={(e) => setNewBatch({ ...newBatch, name: e.target.value })}
                  className="w-full px-3 py-2 mb-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400"
                  required
                />
                

                <div className="flex justify-end gap-2 px-3 py-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition flex items-center gap-2"
                  >
                    <PlusCircle size={16} /> Add Batch
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
