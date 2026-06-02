
import './App.css'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { setNavigate } from './utils/axiosClient'
import StudentLogin from './Pages/StudentLogin'
import Homepage from './Pages/Homepage'
import TeacherLogin from "./Pages/TeacherLogin";
import InstitutionLogin from "./Pages/InstitutionLogin";
import ProtectedRoute from './Components/ProtectedRoute'
import CollegeDashboard from './Pages/CollegeDashboard'
import CollegeSetting from './Pages/CollegeSetting'
import Entry from './Pages/Entry';
import BatchSetting from './Pages/BatchSetting'
import TeacherSetting from './Pages/TeacherSetting'
import BatchSideLayout from './Pages/BatchSideLayout'
import Dashboard from './Pages/Sot23b1Dashboard';
import Students from './Pages/Sot23b1Students';
import Teachers from './Pages/BatchTeachers';
import TeacherEnd from './Pages/TeacherEnd'
import TeacherEndBatch  from './Pages/TeacherEndBatch'
import TeacherEndProblemList from './Pages/TeacherEndProblemList'
import StudentProblemSheet from './Pages/StudentProblemSheet'
import TeacherEndContent from './Pages/TeacherEndContent'
import TeacherEndLeaderboard from './Pages/TeacherEndLeaderbord'
import TeacherEndAnalytics from './Pages/TeacherEndAnalytics'
import TeacherProblemsPage from "./Pages/TeacherProblemsPage";
import BatchMasterTable from './Pages/TableMaster'
import WeeklyProgressTable from './Pages/TableWeekly'
import Table from './Pages/Table'
import Visual from './Pages/Visual'
import StudentProfile from './Pages/StudentProfile';
import TeacherDetails from './Pages/TeacherDetails';
import TeacherBatchStudents from './Pages/TeacherBatchStudents';




function App() {
  const navigate = useNavigate();

  useEffect(() => {
    setNavigate(navigate);
  }, [navigate]);

  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path='/' element={<Homepage/>}/>
        <Route path='/homepage' element={<Homepage/>}/>
        <Route path='/student/login' element={<StudentLogin/>}/>
        <Route path='/teacher/login' element={<TeacherLogin/>}/>
        <Route path="/college/login" element={<InstitutionLogin />} />
        <Route path='/entry' element={<Entry/>}/>

        {/* Admin Route */}
        <Route path='/college-setting' element={<CollegeSetting/>}/>

        {/* COLLEGE routes */}
        <Route path='/college-dashboard' element={<ProtectedRoute role="COLLEGE" element={<CollegeDashboard/>}/>}/>
        <Route path='/college-dashboard/:collegeId' element={<ProtectedRoute role="COLLEGE" element={<CollegeDashboard/>}/>}/>
        <Route path='/batch-setting' element={<ProtectedRoute role="COLLEGE" element={<BatchSetting/>}/>}/>
        <Route path='/batch-setting/:collegeId' element={<ProtectedRoute role="COLLEGE" element={<BatchSetting/>}/>}/>
        <Route path='/teacher-setting' element={<ProtectedRoute role="COLLEGE" element={<TeacherSetting/>}/>}/>
        <Route path='/teacher-setting/:collegeId' element={<ProtectedRoute role="COLLEGE" element={<TeacherSetting/>}/>}/>
        <Route path='/teacher/teacherEdit/:id' element={<ProtectedRoute role="COLLEGE" element={<TeacherDetails/>}/>}/>

        <Route path='/batch/:batchId' element={<ProtectedRoute role="COLLEGE" element={<BatchSideLayout/>}/>}>
          <Route index element={<Dashboard/>}/>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="students" element={<Students />} />
          <Route path="students/:studentId" element={<StudentProfile />} />
          <Route path="teachers" element={<Teachers />} />
          <Route path="teachers/:id" element={<TeacherDetails />} />
          <Route path="problemslist" element={<TeacherEndProblemList />} />
          <Route path="standings" element={<TeacherEndLeaderboard />} />
        </Route>

        {/* TEACHER routes */}
        <Route path="/teacher-dashboard" element={<ProtectedRoute role="TEACHER" element={<TeacherEnd/>}/>}/>
        <Route path='/teacherEnd' element={<ProtectedRoute role="TEACHER" element={<TeacherEnd/>}/>}/>
        <Route path='/teacher/problems' element={<ProtectedRoute role="TEACHER" element={<TeacherProblemsPage/>}/>}/>

        <Route path='/teacher/:id' element={<ProtectedRoute role="TEACHER" element={<TeacherEndBatch/>}/>}>
          <Route index element={<TeacherEndContent/>}/>
          <Route path='problemslist' element={<TeacherEndProblemList/>}/>
          <Route path='content' element={<TeacherEndContent/>}/>
          <Route path='students' element={<TeacherBatchStudents/>}/>
          <Route path='students/:studentId' element={<StudentProfile/>}/>
          <Route path='leaderboard' element={<TeacherEndLeaderboard/>}/>
          <Route path='analytics' element={<TeacherEndAnalytics/>}>
            <Route index element={<Visual/>}/>
            <Route path='visual' element={<Visual/>}/>
            <Route path='tables' element={<Table/>}>
              <Route index element={<BatchMasterTable/>}/>
              <Route path='mastertable' element={<BatchMasterTable/>}/>
              <Route path='weeklyProgressTable' element={<WeeklyProgressTable/>}/>
            </Route>
          </Route>
        </Route>

        {/* STUDENT routes */}
        <Route path="/student-dashboard" element={<Navigate to="/student/assignment" replace />} />
        <Route path='/student/assignment' element={<ProtectedRoute role="STUDENT" element={<StudentProblemSheet/>}/>}/>
        <Route path='/student/profile' element={<ProtectedRoute role="STUDENT" element={<StudentProfile/>}/>}/>
      </Routes>
    </>
  )
}

export default App


