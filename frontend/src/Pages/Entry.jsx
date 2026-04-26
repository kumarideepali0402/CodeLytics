import { useNavigate } from "react-router-dom";

export default function Entry() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 flex flex-col">
      {/* Content */}
      <div className="flex flex-col flex-grow justify-center px-6 sm:pl-16">
        {/* Heading */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight">
          Welcome to
            <img
                src="/logo.png"
                alt="Codelytics Logo"
                className="inline-block w-36 sm:w-56 lg:w-72 align-middle"
            />
        </h1>
        <p className="text-gray-600 text-base sm:text-lg mb-8 sm:mb-12">
          Choose your role to get started 🚀
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
         {/* College */}
         <button
           onClick={() => navigate("/college/login")}
           className="border-4 border-dotted border-purple-400 px-6 sm:px-10 py-3 sm:py-5 rounded-3xl bg-purple-100 font-bold text-purple-700 text-base sm:text-lg shadow-lg hover:bg-purple-200 hover:scale-110 hover:rotate-1 transition-all duration-300"
         >
           College
         </button>

         {/* Teacher */}
         <button
           onClick={() => navigate("/teacher/login")}
           className="px-6 sm:px-10 py-3 sm:py-5 rounded-3xl bg-orange-300 font-bold text-black text-base sm:text-lg shadow-lg hover:bg-orange-400 hover:text-white hover:-rotate-2 hover:scale-110 transition-all duration-300"
         >
           Teacher
         </button>

         {/* Student */}
         <button
           onClick={() => navigate("/student/login")}
           className="px-6 sm:px-10 py-3 sm:py-5 rounded-3xl bg-green-300 font-bold text-black text-base sm:text-lg shadow-lg hover:bg-green-400 hover:text-white hover:rotate-2 hover:scale-110 transition-all duration-300"
         >
           Student
         </button>
       </div>
      </div>

      {/* Footer */}
      <div className="flex justify-center items-center p-6 text-gray-500 font-mono text-sm">
        &lt;/&gt; Built with 💜 by Codelytics
      </div>
    </div>
  );
}
