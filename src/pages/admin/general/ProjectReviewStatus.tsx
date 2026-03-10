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

export default function ProjectReviewStatus() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800">Project Review Status</h1>
      <p className="mt-1 text-sm text-gray-500">Manage and track the review status of submitted projects.</p>

      <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Project Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Reviewer</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Submitted</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Last Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sampleData.map((row) => (
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
