const redirectByRole = (role, navigate) => {
    const roleRoutes = {
        STUDENT: "/student/assignment",
        TEACHER: "/teacher-dashboard",
        COLLEGE: "/college-dashboard",
    };
    navigate(roleRoutes[role] || '/homepage');
};

export default redirectByRole;