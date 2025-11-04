import {
  addStudentTest,
  getStudentTests,
  updateStudentTest,
} from "../../../api/api_estudent_test";
import { getStudents } from "../../../api/api_student";
import { getUsers } from "../../../api/api_user";

export const VerifyProgres = (values, number_test) => {
  const username = localStorage.getItem("username");
  if (username) {
    getUsers().then((resUsers) => {
      const users = resUsers.data;
      const user = users.find((u) => u.username === username);
      getStudents().then((resStudents) => {
        async function val() {
          const studentId = resStudents.data.find(
            (t) => t.usuario === user.id
          )?.id;

          if (!studentId) {
            return;
          }
          const completadas = Object.values(values).filter(
            (resp) => resp !== null && resp !== ""  && resp !== "vacio"
          ).length;
          const payloadStudent = {
            completo: parseFloat(completadas),
            estudiante: studentId,
            testvocational: number_test,
          };
          try {
            // 1. Buscar si ya existe el test del estudiante
            const res = await getStudentTests();
            const existingTest = res.data.find(
              (t) =>
                t.estudiante === studentId && t.testvocational === number_test
            );

            if (existingTest) {
              // 2. Solo actualizar si el nuevo completado es mayor
              if (payloadStudent.completo > existingTest.completo) {
                await updateStudentTest(existingTest.id, payloadStudent);
              } else {
              }
            } else {
              await addStudentTest(payloadStudent);
            }
          } catch (error) {
            console.error("Error en val():", error);
          }
        }

        val();
      });
    });
  }
};
