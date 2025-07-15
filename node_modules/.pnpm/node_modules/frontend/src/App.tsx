import { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthPage } from './pages/Auth';

function App() {
  const [user, setUser] = useState<any>(null);

  return (
    <>
      {!user ? (
        <AuthPage onAuth={setUser} />
      ) : (
        <Dashboard user={user} />
      )}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
    </>
  );
}

export default App;
