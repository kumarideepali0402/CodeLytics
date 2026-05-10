import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import axiosClient from "../utils/axiosClient";

const diffBadge = (d) => {
  const base = "text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap";
  if (d === "EASY")   return `${base} bg-emerald-100 text-emerald-700`;
  if (d === "MEDIUM") return `${base} bg-amber-100 text-amber-700`;
  return `${base} bg-rose-100 text-rose-700`;
};

// Cycles through accent colors per topic
const TOPIC_ACCENTS = [
  "border-l-4 border-sky-400",
  "border-l-4 border-violet-400",
  "border-l-4 border-amber-400",
  "border-l-4 border-rose-400",
  "border-l-4 border-teal-400",
  "border-l-4 border-orange-400",
];


export default function BatchTable(){
    const [problems, setProblems] = useState([]);
    const [students, setStudents] = useState([]);
    const [statuses, setStatuses] = useState({});
    const [totals,   setTotals]   = useState({});
    const [loading,  setLoading]  = useState(true);

    const [rollFilter,       setRollFilter]       = useState("");
    const [textFilter,       setTextFilter]       = useState("");
    const [difficultyFilter, setDifficultyFilter] = useState("All");

    const { id: batchId } = useParams();
    const navigate = useNavigate();

    useEffect(()=>{
        setLoading(true);
        async function fetchData(){
            try {
                const res = await axiosClient('/analytics/batch/${batchId}/standings');
                setProblems(res.data.problems);
                setStudents(res.data.students);
                setStatuses(res.data.statuses);
                const totalObj = {};
                res.data.students.forEach((s) => 
                totalObj[s.id] = res.data.problems.filter((p)=> res.data.statuses[`${p.assignmentId}_${s.id}`] === 'SOLVED')).length;

                setTotals(totalObj);
                
            } catch (error) {
                
            }
            finally{
                setLoading(false);
            }

            
           


        }
        fetchData();
    }, [batchId]);


    const filterStudents = students.filter((s) =>
        (!rollFilter.trim() || s.studentEnrollmentId?.toLowerCase().includes(rollFilter.toLowerCase())) 
    );

    const filteredProblems = problems.filter((p) => {
        const matchesText = p.title?.toLowerCase().includes(textFilter.toLowerCase());
        const matchesDiff = 
                difficultyFilter === 'All' || p.difficulty === difficultyFilter.toUpperCase();
        return matchesText && matchesDiff;
    });

    const rows = useMemo(() => {
        
        const grouped = new Map();
        filteredProblems.forEach((p)=> {
            if (!grouped.has(p.topicId)) grouped.set(p.topicId, new Map());
            const sub = grouped.get(p.topicId);
            if (!sub.has(p.subTopicId)) sub.set(p.subTopicId, []);
            const prob = sub.get(p.subTopicId);
            if (!prob.has(p.id)) prob.push(p.id);
        });

        const result = [];
        let topicIndex = 0;
        for(const [topicName, subTopicMap] of grouped) {
            const topicSpan = [...subTopicMap.values()].reduce((s, p) => s + p.length, 0);
            let isFirstTopicRow = true;

            for(const[subTopicName, probs] of subTopicMap) {
                let isFirstSubTopicRow = true
                const subTopicSpan =  subTopicMap[subTopicName].length;
                for (const problem of probs) {
                    result.push({
                        problem,
                        topicName: isFirstTopicRow ? topicName : null,
                        topicSpan: isFirstTopicRow ? topicSpan : null,
                        subTopicName: isFirstSubTopicRow ? subTopicName: null,
                        subTopicSpan: isFirstSubTopicRow ? subTopicSpan : null,
                        accentClass: TOPIC_ACCENTS[topicIndex %  TOPIC_ACCENTS.length],
                    });
                    isFirstSubTopicRow = false;
                    isFirstSubTopicRow = false;
                }

            }
            topicIndex++;
        }
        return result;




    }, [filteredProblems]);










    
}


