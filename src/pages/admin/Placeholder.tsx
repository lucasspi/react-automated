import { useLocation } from 'react-router-dom'

export default function Placeholder() {
  const location = useLocation()
  const pageName = location.pathname
    .split('/')
    .pop()!
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800">{pageName}</h1>
      <p className="mt-2 text-gray-500">This page is under construction.</p>
    </div>
  )
}
