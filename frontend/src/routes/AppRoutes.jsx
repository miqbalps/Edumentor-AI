import {
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import MaterialDetail from "../pages/MaterialDetail";

import ProtectedRoute from "../components/ProtectedRoute";
import MainLayout from "../layouts/MainLayout";
import Quiz from "../pages/Quiz";
import QuizHistory from "../pages/QuizHistory";
import Materials from "../pages/Materials";

function AppRoutes(){

  const token=
    localStorage.getItem(
      "token"
    );

  return(
    <Routes>

      <Route
        path="/"
        element={
          token
            ? (
              <Navigate
                to="/dashboard"
                replace
              />
            )
            : (
              <Navigate
                to="/login"
                replace
              />
            )
        }
      />

      <Route
        path="/login"
        element={<Login/>}
      />

      <Route
        path="/register"
        element={<Register/>}
      />

      <Route
        element={
          <ProtectedRoute>
            <MainLayout/>
          </ProtectedRoute>
        }
      >

        <Route
          path="/dashboard"
          element={<Dashboard/>}
        />

        <Route
          path="/materials"
          element={<Materials/>}
        />

        <Route
          path="/materials/:id"
          element={<MaterialDetail/>}
        />

        <Route
          path="/quiz/:id"
          element={
              <Quiz/>
          }
        />

        <Route
          path="/quiz-history"
          element={
              <QuizHistory/>
          }
        />

      </Route>

    </Routes>
  );
}

export default AppRoutes;