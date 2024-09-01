
import { Navigate, Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/home/HomePage";
import LoginPage from "./pages/auth/login/LoginPage";
import SignUpPage from "./pages/auth/signup/SignUpPage";
import Sidebar from "./component/common/SideBar";
import RightPanel from "./component/common/RightPanel";
import NotificationPage from "./pages/notification/NotificationPage";
import ProfilePage from "./pages/profile/ProfilePage";

import { Toaster } from 'react-hot-toast'
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "./component/common/LoadingSpinner";
function App() {
  const { data: authUser, isLoading } = useQuery({
    queryKey: ['authUser'],
    queryFn: async (params) => {
      try {
        const res = await fetch("/api/auth/currentUser")
        const data = await res.json()
        if (data.error) return null
        if (!res.ok) throw new Error(data.error || "Something went wrong");
        // console.log("Auth User: ", data)
        return data
      } catch (error) {
        throw new Error(error)
      }
    },
    retry: false
  })
  if (isLoading) {
    return <div className="h-screen flex justify-center items-center">
      <LoadingSpinner size="large" />
    </div>
  }

  return (

    <div className='flex max-w-6xl mx-auto'>
      {authUser &&<Sidebar />}
      <Routes>
        <Route path='/' element={authUser ? <HomePage /> : <Navigate to='/login' />} />
        <Route path='/signup' element={!authUser ? <SignUpPage /> : <Navigate to='/' />} />
        <Route path='/login' element={!authUser ? <LoginPage /> : <Navigate to='/' />} />
        <Route path='/notifications' element={authUser ? <NotificationPage /> : <Navigate to='/login' />} />
        <Route path='/:username' element={authUser ? <ProfilePage /> : <Navigate to='/login' />} />
      </Routes>
      {authUser &&<RightPanel currentUser={authUser}/>}
      <Toaster />
    </div>
  );
}

export default App;
