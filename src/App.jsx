import { useState } from "react";

import "./App.css";
import { BrowserRouter, Route, Router, Routes } from "react-router-dom";
import { Login } from "./components/login/Login";
import { HomeOrientacion } from "./components/pages/estudent/home";
import { Test_chaside } from "./components/pages/estudent/test_chaside";
import { Test_personalidad } from "./components/pages/estudent/test_personalidad";
import { Test_colmil } from "./components/pages/estudent/test_colmil";
import { Test_anapol } from "./components/pages/estudent/test_anapol";
import { TeacherGrades } from "./components/pages/teacher/upload_grades";
import { ReporteVocacional } from "./components/pages/estudent/vocational_report";
import { AptitudesHome } from "./components/pages/estudent/test_aptitudes/test_aptidutes";
import { TestRazonamientoVerbal } from "./components/pages/estudent/test_aptitudes/verbal_reasoning";
import { CareerExplorationQuest } from "./components/pages/estudent/vocational_games/career_exploration_quest";
import { CarrerasConvocatorias } from "./components/pages/estudent/career_information";
import { SettingEstudents } from "./components/pages/estudent/settings";
import { WelcomInfo } from "./components/pages/estudent/info";
import { ProtectedRoute } from "./verify_token/verify";
import { TestRazonamientoNumerico } from "./components/pages/estudent/test_aptitudes/numeric_reasoning";
import { TestRazonamientoAbstracto } from "./components/pages/estudent/test_aptitudes/abstract_reasoning";
import { TestOrtografia } from "./components/pages/estudent/test_aptitudes/orthography";
import { TestRapidezPerceptivaParte1 } from "./components/pages/estudent/test_aptitudes/perceptive_speed_1";
import { TestRapidezPerceptivaParte2 } from "./components/pages/estudent/test_aptitudes/perceptive_speed_2";
import { TestRazonamientoMecanico } from "./components/pages/estudent/test_aptitudes/mechanical_reasoning";
import { AdminPanel } from "./components/pages/admin/admin";

import { AdminWelcome } from "./components/pages/admin/default";
import { TeacherCRUD } from "./components/pages/admin/add_teachers";
import { AdminCRUD } from "./components/pages/admin/add_admin";
import { StudentCRUD } from "./components/pages/teacher/upload_students";
import { TeacherWelcome } from "./components/pages/teacher/info";
import { TeacherGradesManager } from "./components/pages/teacher/upload_grades_manager";
import { ReporteGeneralEstudiantes } from "./components/pages/teacher/general_reports";
import { ReporteGeneralVocacional } from "./components/pages/admin/general_report";
import { ThemeProvider } from "./contexts/ThemeProvider";
import { CourseCRUD } from "./components/pages/admin/add_courses";
import { ObservationsManager } from "./components/pages/teacher/observations";
import { CareerResources } from "./components/pages/estudent/material";
import { TestRazonamientoEspacial } from "./components/pages/estudent/test_aptitudes/spatial_relations";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />}></Route>
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminPanel />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminWelcome />}></Route>

              <Route path="add-admin" element={<AdminCRUD />}></Route>
              <Route path="add-teacher" element={<TeacherCRUD />}></Route>
              <Route
                path="report"
                element={<ReporteGeneralVocacional />}
              ></Route>
              <Route path="add-courses" element={<CourseCRUD  />}></Route>
            </Route>
            <Route
              path="/homeMarcelo"
              element={
                <ProtectedRoute allowedRoles={["estudiante"]}>
                  <HomeOrientacion />
                </ProtectedRoute>
              }
            >
              <Route index element={<WelcomInfo />} />
              <Route path="test_chaside" element={<Test_chaside />}></Route>
              <Route path="test_aptitudes">
                <Route
                  path="verbal_reasoning"
                  element={<TestRazonamientoVerbal />}
                ></Route>
                <Route
                  path="numeric_reasoning"
                  element={<TestRazonamientoNumerico />}
                ></Route>
                <Route
                  path="abstract_reasoning"
                  element={<TestRazonamientoAbstracto />}
                ></Route>
                <Route
                  path="mechanical_reasoning"
                  element={<TestRazonamientoMecanico />}
                ></Route>
                <Route
                  path="spatial_relations"
                  element={<TestRazonamientoEspacial />}
                ></Route>
                <Route path="orthography" element={<TestOrtografia />}></Route>
                <Route
                  path="perceptive_speed_1"
                  element={<TestRapidezPerceptivaParte1 />}
                ></Route>
                <Route
                  path="perceptive_speed_2"
                  element={<TestRapidezPerceptivaParte2 />}
                ></Route>
              </Route>
              <Route
                path="test_personalidad"
                element={<Test_personalidad />}
              ></Route>
              <Route path="test_colmil" element={<Test_colmil />}></Route>
              <Route path="test_anapol" element={<Test_anapol />}></Route>
              <Route
                path="vocational_report"
                element={<ReporteVocacional />}
              ></Route>
              {/* configuraciones del estudiantes  */}
              <Route path="settings" element={<SettingEstudents />}></Route>
              {/* informacion de la carreras  */}
              <Route
                path="career_information"
                element={<CarrerasConvocatorias />}
              ></Route>
               <Route
                path="material"
                element={<CareerResources />}
              ></Route>


              
            </Route>

            <Route
              path="/upload_grades"
              element={
                <ProtectedRoute allowedRoles={["docente"]}>
                  <TeacherGrades />
                </ProtectedRoute>
              }
            >
              <Route index element={<TeacherWelcome />}></Route>
              <Route path="upload_students" element={<StudentCRUD />}></Route>
              <Route path="grades" element={<TeacherGradesManager />}></Route>
              <Route path="observations" element={<ObservationsManager   />}></Route>
              <Route
                path="general_report"
                element={<ReporteGeneralEstudiantes />}
              ></Route>
            </Route>

            
            <Route
              path="/career_exploration"
              element={<CareerExplorationQuest />}
            ></Route>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </>
  );
}

export default App;
