import { useState } from 'react';
import Dashboard from './components/Dashboard';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Auth from './pages/Auth';

function App() {
  const [user, setUser] = useState<any>(null);

  return (
    <>
      {!user ? (
        <Auth onAuth={setUser} />
      ) : (
        <Dashboard userId={user.id} address={user.address} />
      )}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
    </>
  );
}

export default App;
