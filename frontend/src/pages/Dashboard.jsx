import { useAuth } from '../context/AuthContext.jsx';

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="card">
      <h2>Dashboard</h2>
      <pre style={{whiteSpace:'pre-wrap', color:'#cfe6ff'}}>{JSON.stringify(user, null, 2)}</pre>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
