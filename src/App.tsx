import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from './layouts/AdminLayout'
import Placeholder from './pages/admin/Placeholder'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="project-review-status" replace />} />
          {/* General */}
          <Route path="project-review-status" element={<Placeholder />} />
          <Route path="fund-types" element={<Placeholder />} />
          <Route path="contacts" element={<Placeholder />} />
          <Route path="organizations" element={<Placeholder />} />
          <Route path="public-website" element={<Placeholder />} />
          <Route path="announcements" element={<Placeholder />} />
          {/* Tools */}
          <Route path="shapefile-upload" element={<Placeholder />} />
          <Route path="project-import" element={<Placeholder />} />
          {/* Project Delivery */}
          <Route path="reporting-periods" element={<Placeholder />} />
          {/* Projects */}
          <Route path="questions" element={<Placeholder />} />
        </Route>
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
