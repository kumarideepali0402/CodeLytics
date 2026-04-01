


import { useState , useEffect} from "react";
import { motion } from "framer-motion";
import { BookmarkCheck } from "lucide-react";
import { useNavigate } from "react-router";
import axios from "axios";
import { API_BASE } from "../config/apiBase";
import { handleError } from "../utils/notification"


const api =  axios.create({
  baseURL : API_BASE,
  withCredentials: true,
  headers: {"Content-Type" :  "application/json"}
  

})



export default function TeacherEnd() {
  const navigate = useNavigate();
  

  const [batches, setBatches] = useState([]);
  const [problemCount, setProblemCount] = useState(null);

  // Bright yellow gradients
  const gradients = [
    "from-yellow-50 to-yellow-100",
    "from-amber-50 to-yellow-100",
    "from-yellow-100 to-amber-200",
    "from-amber-100 to-yellow-200",
    "from-yellow-200 to-amber-100"
  ];


  useEffect(() => {
    const fetchBatchesOfTeacher = async () => {
      try {
        const res = await api.get("/teacher/get-batch");
        const list = res.data?.batches ?? [];
        setBatches(Array.isArray(list) ? list : []);
      } catch {
        handleError("Error fetching batches");
      }
    };
    const fetchProblemBank = async () => {
      try {
        const res = await api.get("/assignment/get-all-problems");
        const list = res.data?.problems ?? [];
        setProblemCount(Array.isArray(list) ? list.length : 0);
      } catch {
        setProblemCount(0);
      }
    };
    fetchBatchesOfTeacher();
    fetchProblemBank();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-yellow-50 to-amber-100 mx-10 my-10 rounded-3xl px-10 py-5 shadow-md">
      {/* Header */}
      <div className="flex justify-around items-center w-full">
        <div>
          <div className="text-4xl font-extrabold bg-gradient-to-r from-yellow-600 to-amber-700 bg-clip-text text-transparent">
            Hi! <span className="text-black">Mentor</span>
          </div>
          <div className="text-2xl font-medium text-gray-700">
            Assign Problem to Batches and Track Progress
          </div>
              {problemCount !== null && (
            <p className="text-sm text-gray-600 mt-2">
              Your problem bank: <strong>{problemCount}</strong> problem
              {problemCount === 1 ? "" : "s"} — open <strong>My Problem List</strong> to create problems. In each batch, use{" "}
              <strong>Content</strong> to add topics, subtopics, and assign problems.
            </p>
          )}
        </div>
        <img
          src="../public/images/teacher.png"
          alt=""
          height={400}
          width={300}
        />
      </div>

      {/* Dummy full flow + Problem list */}
      <div className="flex justify-end flex-wrap gap-3 mt-10">
        
        <button
          type="button"
          onClick={() => navigate("/teacher/problems")}
          className="bg-gradient-to-r from-yellow-500 to-amber-400 px-4 py-2 text-white font-medium rounded-xl shadow-md hover:scale-105 hover:shadow-lg transition flex items-center gap-2"
        >
          My Problem List
        </button>
      </div>

      {/* Batch Cards */}
      <div className="flex flex-wrap gap-5 mx-2 mt-5">
        {batches.map((batch, index) => (
          <motion.div
            key={batch.id}
            onClick={() =>
              navigate(`/teacher/${batch.id}`)
            }
            whileHover={{ scale: 1.03 }}
            className={`relative bg-gradient-to-br ${
              gradients[index % gradients.length]
            } text-gray-800 border border-gray-200 rounded-2xl p-5 hover:shadow-md cursor-pointer transition opacity-0 translate-y-4 animate-fadeInUp w-3xs`}
          >
            <BookmarkCheck
              fill="currentColor"
              strokeWidth={0}
              size={26}
              className="text-yellow-600 absolute top-2 right-4"
            />
            <div className="font-bold text-lg">{batch.name}</div>
            
          </motion.div>
        ))}
      </div>

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

