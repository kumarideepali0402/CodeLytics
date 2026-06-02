

import { MdGroups2 } from "react-icons/md";
import { GiTeacher } from "react-icons/gi";
import { useNavigate, useParams } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useLogout } from "../utils/useLogout";

export default function CollegeDashboard() {
  const navigate = useNavigate();
  const { collegeId } = useParams();
  const logout = useLogout();

  const goToBatchSetting = () => {
    if (collegeId) navigate(`/batch-setting/${collegeId}`);
    else navigate("/batch-setting");
  };

  const goToTeacherSetting = () => {
    if (collegeId) navigate(`/teacher-setting/${collegeId}`);
    else navigate("/teacher-setting");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Logo + Logout */}
      <div className="flex justify-between items-center px-6 py-6">
        <div className="flex-1" />
        <img
          src="/logo.png"
          alt="Codelytics Logo"
          className="w-48"
        />
        <div className="flex-1 flex justify-end">
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 bg-white text-red-600 font-medium shadow-sm hover:bg-red-50 hover:shadow-md transition text-sm"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Logout
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-grow justify-center items-start px-4 sm:px-8 lg:px-20 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 max-w-4xl w-full">
          
          {/* Manage Batches Card */}
          <div
            onClick={goToBatchSetting}
            className="cursor-pointer rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border border-gray-200 p-6 shadow-sm hover:shadow-md transition hover:scale-[1.02]"
          >
            <div className="grid grid-cols-[3fr_9fr] gap-4 items-center">
              <MdGroups2 className="text-6xl text-blue-600" />
              <div>
               
                <h3 className="font-bold text-lg text-gray-800">Manage Batches</h3>
                <p className="text-gray-600 text-sm mt-1">
                  Create and organize student batches efficiently with simple controls.
                </p>
              </div>
            </div>
          </div>

          {/* Manage Teachers Card */}
          <div
          onClick={goToTeacherSetting}
            className="cursor-pointer rounded-2xl bg-gradient-to-br from-teal-50 to-teal-100 border border-gray-200 p-6 shadow-sm hover:shadow-md transition hover:scale-[1.02]"
          >
            <div className="grid grid-cols-[3fr_9fr] gap-4 items-center">
              <GiTeacher className="text-6xl text-teal-600" />
              <div>
               
                <h3 className="font-bold text-lg text-gray-800">Manage Teachers</h3>
                <p className="text-gray-600 text-sm mt-1">
                  Add and manage teachers seamlessly, assign them to different batches.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
