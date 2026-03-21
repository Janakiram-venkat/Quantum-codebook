import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Track from './pages/Track'
import Lesson from './pages/Lesson'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="track/:level" element={<Track />} />
          <Route path="lesson/:id" element={<Lesson />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
