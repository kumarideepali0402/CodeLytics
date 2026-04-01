


import React, { useState } from "react";
import { Card, CardContent } from "@/Components/ui/card";
import { 
  Trophy, 
  Activity, 
  CheckCircle2, 
  ListChecks, 
  BarChart3, 
  Target 
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
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";

import { LineChart, Line } from "recharts";

// Stats
const weeklyActive = 72;
const monthlyActive = 88;
const completionRate = 65;
const medianSolved = 18;
const avgSolved = 22;
const totalAssigned = 30;

// Difficulty Data (Donut chart)
const difficultyData = [
  { name: "Easy", solved: 23, total: 35 },
  { name: "Medium", solved: 15, total: 25 },
  { name: "Hard", solved: 8, total: 20 },
];


// Topics
const topicData = [
  { topic: "Arrays", percent: 80 },
  { topic: "Strings", percent: 70 },
  { topic: "DP", percent: 50 },
  { topic: "Graphs", percent: 40 },
  { topic: "Trees", percent: 65 },
  { topic: "Greedy", percent: 55 },
  { topic: "Backtracking", percent: 45 },
  { topic: "Binary Search", percent: 75 },
  { topic: "Sorting", percent: 85 },
  { topic: "Hashing", percent: 68 },
  { topic: "Bitmasking", percent: 35 },
  { topic: "Recursion", percent: 60 },
  { topic: "Math", percent: 50 },
  { topic: "Number Theory", percent: 42 },
  { topic: "Geometry", percent: 30 },
  { topic: "Tries", percent: 25 },
  { topic: "Heaps", percent: 55 },
  { topic: "Union-Find", percent: 38 },
];



// Batch Performance Monthly Trend
const monthlyTrend = [
  { month: "Jan", avgSolved: 25 },
  { month: "Feb", avgSolved: 32 },
  { month: "Mar", avgSolved: 28 },
  { month: "Apr", avgSolved: 35 },
  { month: "May", avgSolved: 30 },
  { month: "Jun", avgSolved: 38 },
];

const weeklyTrend = {
  Jan: [
    { week: "W1", avgSolved: 22 },
    { week: "W2", avgSolved: 28 },
    { week: "W3", avgSolved: 25 },
    { week: "W4", avgSolved: 26 },
  ],
  Feb: [
    { week: "W1", avgSolved: 30 },
    { week: "W2", avgSolved: 34 },
    { week: "W3", avgSolved: 29 },
    { week: "W4", avgSolved: 33 },
  ],
  Mar: [
    { week: "W1", avgSolved: 27 },
    { week: "W2", avgSolved: 31 },
    { week: "W3", avgSolved: 28 },
    { week: "W4", avgSolved: 29 },
  ],
  Apr: [
    { week: "W1", avgSolved: 32 },
    { week: "W2", avgSolved: 36 },
    { week: "W3", avgSolved: 34 },
    { week: "W4", avgSolved: 38 },
  ],
  May: [
    { week: "W1", avgSolved: 28 },
    { week: "W2", avgSolved: 31 },
    { week: "W3", avgSolved: 30 },
    { week: "W4", avgSolved: 33 },
  ],
  Jun: [
    { week: "W1", avgSolved: 35 },
    { week: "W2", avgSolved: 37 },
    { week: "W3", avgSolved: 38 },
    { week: "W4", avgSolved: 42 },
  ],
};

// Retention Drill-down Data
const monthlyData = [
  { month: "Jan", active: 120, dropped: 30 },
  { month: "Feb", active: 140, dropped: 25 },
  { month: "Mar", active: 110, dropped: 35 },
  { month: "Apr", active: 150, dropped: 20 },
  { month: "May", active: 130, dropped: 28 },
  { month: "Jun", active: 160, dropped: 18 },
];

const weeklyData = {
  Jan: [
    { week: "W1", active: 35, dropped: 8 },
    { week: "W2", active: 30, dropped: 10 },
    { week: "W3", active: 28, dropped: 7 },
    { week: "W4", active: 27, dropped: 5 },
  ],
  Feb: [
    { week: "W1", active: 40, dropped: 6 },
    { week: "W2", active: 36, dropped: 7 },
    { week: "W3", active: 35, dropped: 6 },
    { week: "W4", active: 29, dropped: 6 },
  ],
  Mar: [
    { week: "W1", active: 32, dropped: 9 },
    { week: "W2", active: 28, dropped: 11 },
    { week: "W3", active: 27, dropped: 8 },
    { week: "W4", active: 23, dropped: 7 },
  ],
  Apr: [
    { week: "W1", active: 42, dropped: 5 },
    { week: "W2", active: 38, dropped: 6 },
    { week: "W3", active: 36, dropped: 4 },
    { week: "W4", active: 34, dropped: 5 },
  ],
  May: [
    { week: "W1", active: 33, dropped: 7 },
    { week: "W2", active: 31, dropped: 8 },
    { week: "W3", active: 30, dropped: 6 },
    { week: "W4", active: 28, dropped: 7 },
  ],
  Jun: [
    { week: "W1", active: 45, dropped: 4 },
    { week: "W2", active: 40, dropped: 5 },
    { week: "W3", active: 38, dropped: 5 },
    { week: "W4", active: 37, dropped: 4 },
  ],
};


// Custom colors for difficulty
const COLORS = ["#22c55e", "#f59e0b", "#ef4444"]; // Easy=green, Medium=orange, Hard=red

// Animation wrapper
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

export default function Visual() {
  const [selectedMonth, setSelectedMonth] = useState(null);

  const dataToShow = selectedMonth ? weeklyData[selectedMonth] : monthlyData;
  const [selectedPerfMonth, setSelectedPerfMonth] = useState(null);
  const performanceData = selectedPerfMonth ? weeklyTrend[selectedPerfMonth] : monthlyTrend;


  return (
    <div className="p-6 grid gap-6 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 min-h-screen text-black">

      
      {/* Row of 6 Key Stats */}
      <div className="grid grid-cols-6 gap-6">
        {[
          { icon: Activity, value: weeklyActive + "%", label: "Weekly Active", color: "text-green-500" },
          { icon: Trophy, value: monthlyActive + "%", label: "Monthly Active", color: "text-yellow-500" },
          { icon: CheckCircle2, value: completionRate + "%", label: "Completion Rate", color: "text-green-600" },
          { icon: ListChecks, value: totalAssigned, label: "Total Problems", color: "text-indigo-500" },
          { icon: BarChart3, value: medianSolved, label: "Median Solved", color: "text-blue-500" },
          { icon: Target, value: avgSolved, label: "Average Solved", color: "text-purple-500" }
        ].map((stat, i) => (
          <FadeInSection key={i}>
            <Card className="bg-white rounded-2xl shadow-md">
              <CardContent className="flex items-center justify-between p-3">
                {/* Left side text */}
                <div>
                  <h2 className="text-lg font-bold text-black">{stat.value}</h2>
                  <p className="text-xs text-gray-600">{stat.label}</p>
                </div>
                {/* Right side icon */}
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </CardContent>
            </Card>
          </FadeInSection>
        ))}
      </div>


      {/* Donut + Stats (Left) and Radar (Right) */}
      <FadeInSection>
        <div className="grid grid-cols-2 gap-6">
          
          
          {/* Donut Chart with Embedded Stats */}
          <Card className="bg-white rounded-2xl shadow-lg">
            <CardContent className="flex flex-col p-6 items-center">
              <h2 className="text-center font-semibold text-lg mb-4 text-black">
                Difficulty-wise Average Problems Solved by Batch
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
                      dataKey="solved"
                    >
                      {difficultyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name, props) =>
                        [`${value} solved / ${props.payload.total}`, name]
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Stats inside donut */}
                <div className="absolute text-center">
                  <h2 className="text-2xl font-bold text-black">{totalAssigned}</h2>
                  <p className="text-sm text-gray-600">Total Problems</p>
                </div>
              </div>

              {/* Small cards for Easy, Medium, Hard */}
              <div className="grid grid-cols-3 gap-4 w-full mt-4">
                {difficultyData.map((d, i) => (
                  <div
                    key={d.name}
                    className={`p-3 rounded-lg shadow-sm text-center ${
                      i === 0
                        ? "bg-green-100"
                        : i === 1
                        ? "bg-orange-100"
                        : "bg-red-100"
                    }`}
                  >
                    <h2
                      className={`text-lg font-bold ${
                        i === 0
                          ? "text-green-700"
                          : i === 1
                          ? "text-orange-700"
                          : "text-red-700"
                      }`}
                    >
                      {d.solved}/{d.total}
                    </h2>
                    <p
                      className={`text-sm ${
                        i === 0
                          ? "text-green-600"
                          : i === 1
                          ? "text-orange-600"
                          : "text-red-600"
                      }`}
                    >
                      {d.name}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>




          {/* Radar Chart Card (Topic-wise Avg %) */}
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

      {/* Retention / Drop-off Curve with Drilldown */}
      <Card className="bg-white rounded-2xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-black">
              {selectedMonth
                ? `Drop-off Curve for ${selectedMonth} (Weekly)`
                : "Top Performers Retention / Drop-off Curve (Monthly)"}
            </h3>
          </div>
          {selectedMonth && (
            <button
              onClick={() => setSelectedMonth(null)}
              className="px-3 py-1 bg-gray-200 text-sm rounded-lg"
            >
              ← Back
            </button>
          )}
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={dataToShow}
            margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
            style={{ backgroundColor: "white", borderRadius: "0.75rem" }}
            onClick={(e) => {
              if (!selectedMonth && e && e.activeLabel) {
                setSelectedMonth(e.activeLabel);
              }
            }}
          >
            <CartesianGrid stroke="#e5e7eb" /> {/* light gray grid */}
            <XAxis dataKey={selectedMonth ? "week" : "month"} stroke="black" />
            <YAxis stroke="black" />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="active"
              stroke="#2563eb"       // blue
              fill="#2563eb"
              fillOpacity={0.4}
              name="Active Students"
            />
            <Area
              type="monotone"
              dataKey="dropped"
              stroke="#6b7280"       // gray
              fill="#9ca3af"
              fillOpacity={0.3}
              name="Dropped Out"
            />
          </AreaChart>
        </ResponsiveContainer>

        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            <span className="text-sm text-black">Active Students</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            <span className="text-sm text-black">Dropped Out</span>
          </div>
        </div>
      </Card>





     

      {/* Batch Performance Trend with Drilldown */}
    <FadeInSection>
      <Card className="bg-white rounded-2xl shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-center font-semibold text-black w-full">
              {selectedPerfMonth
                ? `Batch Performance in ${selectedPerfMonth} (Weekly)`
                : "Batch Performance Over Months"}
            </h2>
            {selectedPerfMonth && (
              <button
                onClick={() => setSelectedPerfMonth(null)}
                className="px-3 py-1 bg-gray-200 text-sm rounded-lg"
              >
                ← Back
              </button>
            )}
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={performanceData}
              onClick={(e) => {
                if (!selectedPerfMonth && e && e.activeLabel) {
                  setSelectedPerfMonth(e.activeLabel);
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={selectedPerfMonth ? "week" : "month"} stroke="black" />
              <YAxis stroke="black" />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="avgSolved"
                stroke="#f59e0b"
                strokeWidth={3}
                dot={{ r: 5 }}
                name="Avg Problems Solved"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </FadeInSection>

      
    </div>
  );
}
