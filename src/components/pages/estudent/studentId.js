import { getStudents } from "../../../api/api_student";
import { getUsers } from "../../../api/api_user";

export const getStudentId = async () => {
  const username = localStorage.getItem("username");
  const resUsers = await getUsers();
  const user = resUsers.data.find((u) => u.username === username);
  const resStudents = await getStudents();
  const student = resStudents.data.find((t) => t.usuario === user.id);
  const studentId = student.id;

  return studentId;
};
