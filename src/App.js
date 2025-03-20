import { Route, Routes } from 'react-router';
import Users from './pages/main/Users';
import Profile from './pages/profile/Profile';
import CustomScan from './pages/custom-scan/CustomScan';

function App() {

  return (
    <Routes>
      <Route index element={<Users />} />
      <Route path='/profile' element={<Profile />} />
      <Route path='/custom-scanner' element={<CustomScan />} />
    </Routes>
  );
}

export default App;
