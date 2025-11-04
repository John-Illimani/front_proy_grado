import { getStudents } from "../../../api/api_student";
import { getUsers } from "../../../api/api_user";
import { sendIdStudent } from "../../../api/api_verify";

export async function Cambios() {
  try {
    const username = localStorage.getItem("username");
    const responseUser = await getUsers();
    const usuarioId = responseUser.data.find(
      (u) => u.username === username
    )?.id;
    const responseStudent = await getStudents();

    const studentId = responseStudent.data.find(
      (s) => s.usuario === usuarioId
    )?.id;

    await sendIdStudent(studentId);
    console.log("id mandado con exito!!!", studentId);
  } catch (error) {
    console.log("error al realizar cambios", error);
  }
}
