export const studentInfo = {
    name: "Zhang Wei",
    studentNumber: "202512345",
    year: "2025",
    major: "Management Information Systems"
};

// All students data for login
export const allStudents = [
    {
        name: "Zhang Wei",
        studentNumber: "202512345",
        year: "2025",
        major: "Management Information Systems"
    },
    {
        name: "Li Ming",
        studentNumber: "202512346",
        year: "2025",
        major: "Computer Science"
    },
    {
        name: "Wang Hua",
        studentNumber: "202512347",
        year: "2025",
        major: "Business Administration"
    }
];

// Current logged in student (this will be updated when user logs in)
export let currentStudent = studentInfo;

// Function to set current student
export const setCurrentStudent = (student) => {
    Object.assign(currentStudent, student);
};
