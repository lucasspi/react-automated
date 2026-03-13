import { useState } from 'react'

interface ReviewStatus {
  id: number
  projectName: string
  status: string
  reviewer: string
  submittedDate: string
  lastUpdated: string
}

const sampleData: ReviewStatus[] = [
  { id: 1, projectName: 'Wetland Restoration - Phase 2', status: 'Pending Review', reviewer: 'Jane Smith', submittedDate: '2026-02-15', lastUpdated: '2026-03-01' },
  { id: 2, projectName: 'Urban Reforestation Initiative', status: 'Approved', reviewer: 'Mike Johnson', submittedDate: '2026-01-20', lastUpdated: '2026-02-28' },
  { id: 3, projectName: 'Coastal Erosion Mitigation', status: 'Needs Revision', reviewer: 'Sarah Lee', submittedDate: '2026-03-05', lastUpdated: '2026-03-10' },
  { id: 4, projectName: 'Pollinator Habitat Corridor', status: 'Pending Review', reviewer: 'David Chen', submittedDate: '2026-02-28', lastUpdated: '2026-03-08' },
  { id: 5, projectName: 'Stream Bank Stabilization', status: 'Approved', reviewer: 'Emily Davis', submittedDate: '2026-01-10', lastUpdated: '2026-02-15' },
  { id: 6, projectName: 'Invasive Species Removal', status: 'Rejected', reviewer: 'Tom Wilson', submittedDate: '2026-03-01', lastUpdated: '2026-03-11' },
]

const statusColors: Record<string, string> = {
  'Pending Review': 'bg-yellow-100 text-yellow-800',
  'Approved': 'bg-green-100 text-green-800',
  'Needs Revision': 'bg-orange-100 text-orange-800',
  'Rejected': 'bg-red-100 text-red-800',
}

const statusOptions = ['Pending Review', 'Approved', 'Needs Revision', 'Rejected']

export default function ProjectReviewStatus() {
  const [data, setData] = useState<ReviewStatus[]>(sampleData)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ReviewStatus | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<ReviewStatus | null>(null)
  const [formData, setFormData] = useState({
    projectName: '',
    status: 'Pending Review',
    reviewer: '',
    submittedDate: '',
  })

  const openAddDialog = () => {
    setEditingItem(null)
    setFormData({
      projectName: '',
      status: 'Pending Review',
      reviewer: '',
      submittedDate: '',
    })
    setIsDialogOpen(true)
  }

  const openEditDialog = (item: ReviewStatus) => {
    setEditingItem(item)
    setFormData({
      projectName: item.projectName,
      status: item.status,
      reviewer: item.reviewer,
      submittedDate: item.submittedDate,
    })
    setIsDialogOpen(true)
  }

  const closeDialog = () => {
    setIsDialogOpen(false)
    setEditingItem(null)
  }

  const handleSave = () => {
    const today = new Date().toISOString().split('T')[0]

    if (editingItem) {
      setData(data.map(item =>
        item.id === editingItem.id
          ? { ...item, ...formData, lastUpdated: today }
          : item
      ))
    } else {
      const newId = Math.max(...data.map(item => item.id), 0) + 1
      setData([...data, {
        id: newId,
        ...formData,
        lastUpdated: today,
      }])
    }
    closeDialog()
  }

  const handleDelete = (item: ReviewStatus) => {
    setDeleteConfirm(item)
  }

  const confirmDelete = () => {
    if (deleteConfirm) {
      setData(data.filter(item => item.id !== deleteConfirm.id))
      setDeleteConfirm(null)
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Project Review Status</h1>
          <p className="mt-1 text-sm text-gray-500">Manage and track the review status of submitted projects.</p>
        </div>
        <button
          onClick={openAddDialog}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          Add New
        </button>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Project Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Reviewer</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Submitted</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Last Updated</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{row.projectName}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[row.status] ?? 'bg-gray-100 text-gray-800'}`}>
                    {row.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">{row.reviewer}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">{row.submittedDate}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">{row.lastUpdated}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditDialog(row)}
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded p-1.5"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(row)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50 rounded p-1.5"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={closeDialog}
        >
          <div
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {editingItem ? 'Edit Project Review' : 'Add New Project Review'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  {statusOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reviewer
                </label>
                <input
                  type="text"
                  value={formData.reviewer}
                  onChange={(e) => setFormData({ ...formData, reviewer: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Submitted Date
                </label>
                <input
                  type="date"
                  value={formData.submittedDate}
                  onChange={(e) => setFormData({ ...formData, submittedDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={closeDialog}
                className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Confirm Delete
            </h2>

            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{deleteConfirm.projectName}</strong>? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
