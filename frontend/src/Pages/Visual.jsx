
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/Components/ui/card";
import {
  Trophy,
  Activity,
  CheckCircle2,
  ListChecks,
  BarChart3,
  Target,
  Users,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import axiosClient from "@/utils/axiosClient";

const DIFFICULTY_COLORS = ["#22c55e", "#f59e0b", "#ef4444"];

const FadeInSection = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.7, ease: "easeOut" }}
    viewport={{ once: true, amount: 0.2 }}
  >
    {children}
  </motion.div>
);

function computeMedian(arr) {
  if (!arr.length) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[mid]
    : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

export default function Visual() {
  const { id, batchId: batchIdParam } = useParams();
  const batchId = id ?? batchIdParam;
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [kpis, setKpis] = useState({
    totalStudents: 0,
    avgSolved: 0,
    medianSolved: 0,
    completionRate: 0,
    totalAssigned: 0,
  });
  const [difficultyData, setDifficultyData] = useState([]);
  const [topicData, setTopicData] = useState([]);
  const [monthlyPerfData, setMonthlyPerfData] = useState([]);
  const [monthlyWeeklyMap, setMonthlyWeeklyMap] = useState({});
  const [selectedPerfMonth, setSelectedPerfMonth] = useState(null);
  const [monthlyRetentionData, setMonthlyRetentionData] = useState([]);
  const [monthlyRetentionWeekMap, setMonthlyRetentionWeekMap] = useState({});
  const [selectedRetentionMonth, setSelectedRetentionMonth] = useState(null);

  useEffect(() => {
    if (!batchId) return;
    setLoading(true);
    const fetchAll = async () => {
      setFetchError(null);
      try {
        const [studentsRes, weeklyRes, statusRes] = await Promise.all([
          axiosClient.get(`/analytics/batch/${batchId}/students`),
          axiosClient.get(`/analytics/batch/${batchId}/weekly-progress`),
          axiosClient.get(`/analytics/batch/${batchId}/solve-status`),
        ]);

        // KPIs from students
        const students = studentsRes.data.students ?? [];
        const solvedCounts = students.map((s) => s.solvedCount ?? 0);
        const totalAssigned = students[0]?.totalAssigned ?? 0;
        const avgSolved = students.length
          ? +(solvedCounts.reduce((a, b) => a + b, 0) / students.length).toFixed(1) //toFixed returns string
          : 0;
        const completionRate = totalAssigned
          ? Math.round((avgSolved / totalAssigned) * 100)
          : 0;
        setKpis({
          totalStudents: students.length,
          avgSolved,
          medianSolved: computeMedian(solvedCounts),
          completionRate,
          totalAssigned,
        });

        // Monthly + weekly performance
        const weeks = weeklyRes.data.weeks ?? [];
        const wStudents = weeklyRes.data.students ?? [];

        // Group week indices by calendar month
        const monthGroups = {};
        weeks.forEach((week, i) => {
          const d = new Date(week.weekStart);
          const key = d.toLocaleString("default", { month: "short" }) + " " + d.getFullYear();
          if (!monthGroups[key]) monthGroups[key] = [];
          monthGroups[key].push(i);
        });

        // Monthly averages (sum all weeks in month / students)
        setMonthlyPerfData(
          Object.entries(monthGroups).map(([month, indices]) => {
            const totalSolved = indices.reduce(
              (acc, i) =>
                acc + wStudents.reduce((s, st) => s + (st.weeklySolved[i] ?? 0), 0),
              0
            );
            return {
              month,
              avgSolved: wStudents.length
                ? +(totalSolved / wStudents.length).toFixed(1)
                : 0,
            };
          })
        );

        // Weekly breakdown per month for drill-down
        const weekMap = {};
        Object.entries(monthGroups).forEach(([month, indices]) => {
          weekMap[month] = indices.map((i) => ({
            week: weeks[i].label,
            avgSolved: wStudents.length
              ? +(
                  wStudents.reduce((acc, st) => acc + (st.weeklySolved[i] ?? 0), 0) /
                  wStudents.length
                ).toFixed(1)
              : 0,
          }));
        });
        setMonthlyWeeklyMap(weekMap);

        // Retention: active (solved > 0) vs not active per week, grouped by month
        setMonthlyRetentionData(
          Object.entries(monthGroups).map(([month, indices]) => {
            const totalActive = indices.reduce(
              (acc, i) => acc + wStudents.filter((s) => (s.weeklySolved[i] ?? 0) > 0).length,
              0
            );
            const avgActive = indices.length ? Math.round(totalActive / indices.length) : 0;
            return {
              month,
              active: avgActive,
              inactive: Math.max(0, wStudents.length - avgActive),
            };
          })
        );

        const retentionWeekMap = {};
        Object.entries(monthGroups).forEach(([month, indices]) => {
          retentionWeekMap[month] = indices.map((i) => {
            const active = wStudents.filter((s) => (s.weeklySolved[i] ?? 0) > 0).length;
            return {
              week: weeks[i].label,
              active,
              inactive: Math.max(0, wStudents.length - active),
            };
          });
        });
        setMonthlyRetentionWeekMap(retentionWeekMap);

        // Difficulty & topic breakdown
        const statusStudents = statusRes.data.students ?? [];
        const problems = statusRes.data.problems ?? [];
        const statuses = statusRes.data.statuses ?? {};

        const diffOrder = [
          { key: "EASY", label: "Easy" },
          { key: "MEDIUM", label: "Medium" },
          { key: "HARD", label: "Hard" },
        ];
        const diffData = diffOrder
          .map(({ key, label }) => {
            const diffProbs = problems.filter((p) => p.difficulty === key);
            const totalSolves = statusStudents.reduce(
              (acc, student) =>
                acc +
                diffProbs.filter((p) => statuses[`${p.assignmentId}_${student.id}`] === "SOLVED")
                  .length,
              0
            );
            return {
              name: label,
              solved: statusStudents.length
                ? +(totalSolves / statusStudents.length).toFixed(1)
                : 0,
              total: diffProbs.length,
            };
          })
          .filter((d) => d.total > 0);
        setDifficultyData(diffData);

        const topics = [...new Set(problems.map((p) => p.topic).filter(Boolean))];
        setTopicData(
          topics.map((topic) => {
            const topicProbs = problems.filter((p) => p.topic === topic);
            const maxPossible = topicProbs.length * statusStudents.length;
            const totalSolves = statusStudents.reduce(
              (acc, student) =>
                acc +
                topicProbs.filter(
                  (p) => statuses[`${p.assignmentId}_${student.id}`] === "SOLVED"
                ).length,
              0
            );
            return {
              topic,
              percent: maxPossible > 0 ? Math.round((totalSolves / maxPossible) * 100) : 0,
            };
          })
        );
      } catch (err) {
        const msg = err?.response?.data?.msg ?? err?.message ?? "Unknown error";
        console.error("[Visual] fetch error", err);
        setFetchError(`Failed to load analytics: ${msg} (status ${err?.response?.status ?? "no response"})`);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [batchId]);

  const retentionChartData = selectedRetentionMonth
    ? (monthlyRetentionWeekMap[selectedRetentionMonth] ?? [])
    : monthlyRetentionData;

  const totalProblemsForDonut = difficultyData.reduce((acc, d) => acc + d.total, 0);

  const perfChartData = selectedPerfMonth
    ? (monthlyWeeklyMap[selectedPerfMonth] ?? [])
    : monthlyPerfData;

  const kpiCards = [
    { icon: Users, value: kpis.totalStudents, label: "Total Students", color: "text-indigo-500" },
    { icon: ListChecks, value: kpis.totalAssigned, label: "Total Assigned", color: "text-yellow-500" },
    { icon: BarChart3, value: kpis.avgSolved, label: "Avg Solved", color: "text-blue-500" },
    { icon: Target, value: kpis.medianSolved, label: "Median Solved", color: "text-purple-500" },
    { icon: CheckCircle2, value: kpis.completionRate + "%", label: "Completion Rate", color: "text-green-600" },
  ];

  return (
    <div className="p-6 grid gap-6 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 min-h-screen text-black">

      {fetchError && (
        <div className="col-span-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl text-sm">
          {fetchError}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-5 gap-6">
        {kpiCards.map((stat, i) => (
          <FadeInSection key={i}>
            <Card className="bg-white rounded-2xl shadow-md">
              <CardContent className="flex items-center justify-between p-3">
                <div>
                  <h2 className="text-lg font-bold text-black">
                    {loading ? "—" : stat.value}
                  </h2>
                  <p className="text-xs text-gray-600">{stat.label}</p>
                </div>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </CardContent>
            </Card>
          </FadeInSection>
        ))}
      </div>

      {/* Donut + Radar */}
      <FadeInSection>
        <div className="grid grid-cols-2 gap-6">

          {/* Donut Chart */}
          <Card className="bg-white rounded-2xl shadow-lg">
            <CardContent className="flex flex-col p-6 items-center">
              <h2 className="text-center font-semibold text-lg mb-4 text-black">
                Difficulty-wise Problems Assigned to Batch
              </h2>
              <div className="relative flex justify-center items-center w-full">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={difficultyData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="total"
                    >
                      {difficultyData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={DIFFICULTY_COLORS[index % DIFFICULTY_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value} problems`, name]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute text-center">
                  <h2 className="text-2xl font-bold text-black">{totalProblemsForDonut}</h2>
                  <p className="text-sm text-gray-600">Total Problems</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 w-full mt-4">
                {difficultyData.map((d, i) => (
                  <div
                    key={d.name}
                    className={`p-3 rounded-lg shadow-sm text-center ${
                      i === 0 ? "bg-green-100" : i === 1 ? "bg-orange-100" : "bg-red-100"
                    }`}
                  >
                    <h2
                      className={`text-lg font-bold ${
                        i === 0 ? "text-green-700" : i === 1 ? "text-orange-700" : "text-red-700"
                      }`}
                    >
                      {d.total}
                    </h2>
                    <p
                      className={`text-sm ${
                        i === 0 ? "text-green-600" : i === 1 ? "text-orange-600" : "text-red-600"
                      }`}
                    >
                      {d.name}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Radar Chart */}
          <Card className="bg-white rounded-2xl shadow-lg">
            <CardContent className="p-4">
              <h2 className="font-semibold mb-4 text-center text-black">
                Avg. % Problems Solved by Topic
              </h2>
              <ResponsiveContainer width="100%" height={350}>
                <RadarChart cx="50%" cy="50%" outerRadius={140} data={topicData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="topic" stroke="black" />
                  <Radar
                    name="Batch"
                    dataKey="percent"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.6}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </FadeInSection>

      {/* Retention / Drop-off Curve with drill-down */}
      <Card className="bg-white rounded-2xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-black">
              {selectedRetentionMonth
                ? `Active vs Not Active — ${selectedRetentionMonth} (Weekly)`
                : "Student Activity Retention (Monthly)"}
            </h3>
          </div>
          {selectedRetentionMonth && (
            <button
              onClick={() => setSelectedRetentionMonth(null)}
              className="px-3 py-1 bg-gray-200 text-sm rounded-lg"
            >
              ← Back
            </button>
          )}
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={retentionChartData}
            margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
            onClick={(e) => {
              if (!selectedRetentionMonth && e?.activeLabel)
                setSelectedRetentionMonth(e.activeLabel);
            }}
            style={{ cursor: selectedRetentionMonth ? "default" : "pointer" }}
          >
            <CartesianGrid stroke="#e5e7eb" />
            <XAxis
              dataKey={selectedRetentionMonth ? "week" : "month"}
              stroke="black"
            />
            <YAxis stroke="black" />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="active"
              stroke="#2563eb"
              fill="#2563eb"
              fillOpacity={0.4}
              name="Active Students"
            />
            <Area
              type="monotone"
              dataKey="inactive"
              stroke="#6b7280"
              fill="#9ca3af"
              fillOpacity={0.3}
              name="Not Active"
            />
          </AreaChart>
        </ResponsiveContainer>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full" />
              <span className="text-sm text-black">Active Students</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-500 rounded-full" />
              <span className="text-sm text-black">Not Active</span>
            </div>
          </div>
          {!selectedRetentionMonth && (
            <p className="text-xs text-gray-400">Click a month to see weekly breakdown</p>
          )}
        </div>
      </Card>

      {/* Avg Problems Solved — Monthly / Weekly Drill-down */}
      <FadeInSection>
        <Card className="bg-white rounded-2xl shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-black">
                {selectedPerfMonth
                  ? `Avg Problems Solved — ${selectedPerfMonth} (Weekly)`
                  : "Avg Problems Solved per Month"}
              </h2>
              {selectedPerfMonth && (
                <button
                  onClick={() => setSelectedPerfMonth(null)}
                  className="px-3 py-1 bg-green-400 text-sm rounded-lg shrink-0"
                >
                  ← Back
                </button>
              )}
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={perfChartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                onClick={(e) => {
                  if (!selectedPerfMonth && e?.activeLabel)
                    setSelectedPerfMonth(e.activeLabel);
                }}
                style={{ cursor: selectedPerfMonth ? "default" : "pointer" }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey={selectedPerfMonth ? "week" : "month"}
                  stroke="black"
                />
                <YAxis stroke="black" />
                <Tooltip
                  formatter={(v) => [`${v}`, "Avg Problems Solved"]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="avgSolved"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                  activeDot={{ r: 7 }}
                  name="Avg Problems Solved"
                />
              </LineChart>
            </ResponsiveContainer>

            {!selectedPerfMonth && (
              <p className="text-xs text-gray-400 mt-2 text-center">
                Click a month to see weekly breakdown
              </p>
            )}
          </CardContent>
        </Card>
      </FadeInSection>

    </div>
  );
}
