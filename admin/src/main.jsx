import { createRoot } from 'react-dom/client'
import './index.css'
import { router } from './router/Routes'
import { RouterProvider } from 'react-router-dom'
import AuthBootstrap from './Components/auth/AuthBootstrap'
import { Toaster } from './components/ui/sonner'

createRoot(document.getElementById('root')).render(
  <>
    <AuthBootstrap />
    <RouterProvider router={router} />
    <Toaster />
  </>
)
