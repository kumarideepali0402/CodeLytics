// import { useNavigate } from "react-router-dom";

// export default function Entry() {
//   const navigate = useNavigate();

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-pink-100 via-white to-purple-100 flex flex-col">
//       {/* Logo at top-left */}
//       <div className="p-6">
//         <img src="/c.png" height={100} width={220} alt="Codelytics Logo" />
//       </div>

//       {/* Content center-left */}
//       <div className="flex flex-col flex-grow justify-center pl-16">
//         {/* Fun Heading */}
//         <h1 className="text-5xl font-extrabold text-gray-900 mb-8">
//           🚀 Login As
//         </h1>

//         {/* Buttons */}
//         <div className="flex gap-8">
//           {/* College */}
//           <button
//             onClick={() => navigate("/homepage")}
//             className="border-4 border-dotted border-purple-400 px-10 py-5 rounded-3xl bg-purple-100 font-bold text-purple-700 text-lg shadow-lg hover:bg-purple-200 hover:scale-110 hover:rotate-1 transition-all duration-300"
//           >
//             College
//           </button>

//           {/* Teacher */}
//           <button
//             onClick={() => navigate("/teacher/login")}
//             className="px-10 py-5 rounded-3xl bg-orange-300 font-bold text-black text-lg shadow-lg hover:bg-orange-400 hover:text-white hover:-rotate-2 hover:scale-110 transition-all duration-300"
//           >
//             Teacher
//           </button>

//           {/* Student */}
//           <button
//             onClick={() => navigate("/student/login")}
//             className="px-10 py-5 rounded-3xl bg-green-300 font-bold text-black text-lg shadow-lg hover:bg-green-400 hover:text-white hover:rotate-2 hover:scale-110 transition-all duration-300"
//           >
//             Student
//           </button>
//         </div>
//       </div>

//       {/* Decorative coding vibe footer */}
//       <div className="flex justify-center items-center p-4 text-gray-500 font-mono text-sm">
//         <span>&lt; Happy Coding with Codelytics 🚀 /&gt;</span>
//       </div>
//     </div>
//   );
// }


import { useNavigate } from "react-router-dom";

export default function Entry() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 flex flex-col">
      {/* Logo top-left */}
      

      {/* Content */}
      <div className="flex flex-col flex-grow justify-center pl-6">
        {/* Heading */}
        <h1 className="text-6xl font-extrabold text-gray-900  tracking-tight">
          Welcome to 
            <img 
                src="/logo.png" 
                alt="Codelytics Logo" 
                className="inline-block  w-90 align-middle" 
            />        
        </h1>
        <p className="text-gray-600 text-lg mb-12">
          Choose your role to get started 🚀
        </p>

        {/* Buttons */}
        <div className="flex gap-8">
         {/* College */}
         <button
           onClick={() => navigate("/college/login")}
           className="border-4 border-dotted border-purple-400 px-10 py-5 rounded-3xl bg-purple-100 font-bold text-purple-700 text-lg shadow-lg hover:bg-purple-200 hover:scale-110 hover:rotate-1 transition-all duration-300"
         >
           College
         </button>

         {/* Teacher */}
         <button
           onClick={() => navigate("/teacher/login")}
           className="px-10 py-5 rounded-3xl bg-orange-300 font-bold text-black text-lg shadow-lg hover:bg-orange-400 hover:text-white hover:-rotate-2 hover:scale-110 transition-all duration-300"
         >
           Teacher
         </button>

         {/* Student */}
         <button
           onClick={() => navigate("/student/login")}
           className="px-10 py-5 rounded-3xl bg-green-300 font-bold text-black text-lg shadow-lg hover:bg-green-400 hover:text-white hover:rotate-2 hover:scale-110 transition-all duration-300"
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
