


import { Trophy, Activity } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from "axios";
import { API_BASE } from "../config/apiBase";


const api = axios.create({
  baseURL : API_BASE,
  withCredentials : true,
  headers: {"Content-Type" : "application/json"}
})

export default function Dashboard() {

  const [studentCount, setStudentCount] = useState(0);
  const [teacherCount, setTeacherCount] = useState(0);

    const {batchId} = useParams();

    useEffect(()=>{
      const fetchBatchStudent = async() => {
        const res = await api.get(`/student/get/${batchId}`);
        const students = res.data?.students ?? [];
        setStudentCount(students.length);
      } 
       const fetchBatchTeacher = async() => {
        const res = await api.get(`/batch/get/${batchId}/teachers`);
        const teachers = res.data?.teachers ??[];
        setTeacherCount(teachers.length);
      } 
      Promise.all([fetchBatchStudent(),fetchBatchTeacher()])
     
    }, [batchId])
    const activeStudents = [
    { name: "Active", value: 70 },
    { name: "Inactive", value: 30 },
  ];
  const topPerformers = [
    { rank: 1, name: "Deepali", solved: 340, total: 500 },
    { rank: 2, name: "Alice", solved: 320, total: 500 },
    { rank: 3, name: "Bob", solved: 300, total: 500 },
  ];

  const retentionData = [
    { week: 'Week 1', active: 45, dropped: 0 },
    { week: 'Week 2', active: 44, dropped: 1 },
    { week: 'Week 3', active: 42, dropped: 3 },
    { week: 'Week 4', active: 41, dropped: 4 },
    { week: 'Week 5', active: 39, dropped: 6 },
    { week: 'Week 6', active: 38, dropped: 7 },
    { week: 'Week 7', active: 38, dropped: 7 },
    { week: 'Week 8', active: 37, dropped: 8 }
  ];

  return (
    <div className="w-full space-y-6">
      {/* KPI Section */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-5">
        {[{ label: "Students", value: studentCount }, { label: "Teachers", value: teacherCount }, { label: "Questions Assigned", value: "500" }, { label: "Topics Covered", value: "8" }, { label: "Active Students", value: "60%" }]
          .map((item, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm ring-1 ring-slate-100 transition hover:shadow-md sm:p-5"
          >
            <div className="text-xs font-medium tracking-tight text-slate-500 sm:text-sm">{item.label}</div>
            <div className="mt-1.5 text-2xl font-bold tabular-nums text-slate-900 sm:text-3xl">{item.value}</div>
          </div>
        ))}
      </div>

      {/* Problem Solving Stats */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-6">
        <h2 className="mb-4 text-base font-semibold text-slate-900">Problem Solving Stats</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col items-center rounded-2xl bg-sky-50/90 p-6 ring-1 ring-sky-100">
            <div className="text-4xl font-bold text-sky-700">100</div>
            <div className="mt-2 text-sm text-slate-600">Median Problems Solved</div>
          </div>
          <div className="flex flex-col items-center rounded-2xl bg-sky-50/90 p-6 ring-1 ring-sky-100">
            <div className="text-4xl font-bold text-sky-700">100</div>
            <div className="mt-2 text-sm text-slate-600">Avg. Problems Solved</div>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 shrink-0 text-amber-500" aria-hidden />
            <h2 className="font-semibold text-slate-900">Top Performers</h2>
          </div>
          <button type="button" className="text-sm font-medium text-sky-700 hover:underline">
            See All
          </button>
        </div>
        <div className="space-y-2">
          {topPerformers.map((performer, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3 transition hover:bg-slate-100/80"
            >
              <div className="flex h-8 min-w-8 items-center justify-center rounded-full bg-slate-200/90 text-sm font-bold text-slate-800">
                {performer.rank}
              </div>
              <div className="min-w-0 flex-1 font-medium text-slate-800">{performer.name}</div>
              <div className="shrink-0 text-sm tabular-nums text-slate-600">
                {performer.solved}/{performer.total} problems
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Retention / Drop-off Curve */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
          <h3 className="text-base font-semibold text-slate-900">Retention / Drop-off Curve</h3>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={retentionData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="active" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
            <Area type="monotone" dataKey="dropped" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
          </AreaChart>
        </ResponsiveContainer>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-emerald-500" />
            <span className="text-sm text-slate-600">Active Students</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <span className="text-sm text-slate-600">Dropped Out</span>
          </div>
        </div>
      </div>
    </div>
  );
}

