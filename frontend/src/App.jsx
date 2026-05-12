import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Lesson from './pages/Lesson'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="track/:level" element={<Navigate to="/" replace />} />
          <Route path="lesson/:id" element={<Lesson />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
