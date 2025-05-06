import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TaskManager from "./pages/TaskManager";
import { useAuth } from "./hooks/useAuth";

function App() {
  const user = useAuth();

  if (user === undefined) return <div style={{ padding: 20 }}>Loading...</div>;

  return (
    <BrowserRouter>
      <nav style={{ padding: "10px", background: "#eee", display: "flex", gap: "10px" }}>
        <Link to="/">Home</Link>
        {!user && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
        {user && <Link to="/tasks">My Tasks</Link>}
      </nav>

      <Routes>
        {/* Home Page with Welcome Message */}
        <Route
          path="/"
          element={
            <div style={{ padding: 20 }}>
              <h2>Welcome to the Task Manager App!</h2>
              {!user && <p>Please <Link to="/login">log in</Link> or <Link to="/register">register</Link> to continue.</p>}
              {user && <Navigate to="/tasks" />}
            </div>
          }
        />

        {/* Auth Pages */}
        <Route
          path="/login"
          element={user ? <Navigate to="/tasks" /> : <Login />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to="/tasks" /> : <Register />}
        />

        {/* Task Page */}
        <Route
          path="/tasks"
          element={user ? <TaskManager /> : <Navigate to="/login" />}
        />

        {/* 404 */}
        <Route
          path="*"
          element={<div style={{ padding: 20 }}>404 - Page Not Found</div>}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;