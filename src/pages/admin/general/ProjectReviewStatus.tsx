import DataTable, { Column } from '../../../components/DataTable'

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
  { id: 7, projectName: 'Riparian Buffer Zone Restoration', status: 'Pending Review', reviewer: 'Jane Smith', submittedDate: '2026-01-15', lastUpdated: '2026-02-20' },
  { id: 8, projectName: 'Native Grassland Seeding', status: 'Approved', reviewer: 'Michael Brown', submittedDate: '2026-02-01', lastUpdated: '2026-02-25' },
  { id: 9, projectName: 'Fish Passage Improvement', status: 'Needs Revision', reviewer: 'Sarah Lee', submittedDate: '2026-01-28', lastUpdated: '2026-03-05' },
  { id: 10, projectName: 'Stormwater Wetland Construction', status: 'Approved', reviewer: 'David Chen', submittedDate: '2026-01-05', lastUpdated: '2026-02-10' },
  { id: 11, projectName: 'Prairie Restoration Project', status: 'Pending Review', reviewer: 'Emily Davis', submittedDate: '2026-03-01', lastUpdated: '2026-03-12' },
  { id: 12, projectName: 'Woodland Enhancement Initiative', status: 'Rejected', reviewer: 'Tom Wilson', submittedDate: '2026-02-10', lastUpdated: '2026-03-02' },
  { id: 13, projectName: 'Stream Daylighting Project', status: 'Approved', reviewer: 'Jane Smith', submittedDate: '2026-01-12', lastUpdated: '2026-02-18' },
  { id: 14, projectName: 'Coastal Dune Restoration', status: 'Pending Review', reviewer: 'Mike Johnson', submittedDate: '2026-02-22', lastUpdated: '2026-03-09' },
  { id: 15, projectName: 'Vernal Pool Enhancement', status: 'Needs Revision', reviewer: 'Sarah Lee', submittedDate: '2026-01-25', lastUpdated: '2026-02-28' },
  { id: 16, projectName: 'Upland Forest Conservation', status: 'Approved', reviewer: 'David Chen', submittedDate: '2026-02-05', lastUpdated: '2026-03-01' },
  { id: 17, projectName: 'Streamside Buffer Planting', status: 'Pending Review', reviewer: 'Emily Davis', submittedDate: '2026-03-03', lastUpdated: '2026-03-11' },
  { id: 18, projectName: 'Erosion Control Implementation', status: 'Rejected', reviewer: 'Tom Wilson', submittedDate: '2026-02-12', lastUpdated: '2026-03-04' },
  { id: 19, projectName: 'Native Plant Nursery Expansion', status: 'Approved', reviewer: 'Jane Smith', submittedDate: '2026-01-18', lastUpdated: '2026-02-22' },
  { id: 20, projectName: 'Wildlife Corridor Development', status: 'Pending Review', reviewer: 'Mike Johnson', submittedDate: '2026-02-25', lastUpdated: '2026-03-10' },
  { id: 21, projectName: 'Green Infrastructure Project', status: 'Needs Revision', reviewer: 'Sarah Lee', submittedDate: '2026-01-30', lastUpdated: '2026-03-06' },
  { id: 22, projectName: 'Floodplain Restoration', status: 'Approved', reviewer: 'David Chen', submittedDate: '2026-02-08', lastUpdated: '2026-03-02' },
  { id: 23, projectName: 'Meadow Habitat Creation', status: 'Pending Review', reviewer: 'Emily Davis', submittedDate: '2026-03-05', lastUpdated: '2026-03-12' },
  { id: 24, projectName: 'Aquatic Ecosystem Rehabilitation', status: 'Rejected', reviewer: 'Tom Wilson', submittedDate: '2026-02-14', lastUpdated: '2026-03-06' },
  { id: 25, projectName: 'Bioswale Installation', status: 'Approved', reviewer: 'Jane Smith', submittedDate: '2026-01-22', lastUpdated: '2026-02-24' },
  { id: 26, projectName: 'Tree Canopy Enhancement', status: 'Pending Review', reviewer: 'Mike Johnson', submittedDate: '2026-02-27', lastUpdated: '2026-03-11' },
  { id: 27, projectName: 'Rain Garden Network', status: 'Needs Revision', reviewer: 'Sarah Lee', submittedDate: '2026-02-03', lastUpdated: '2026-03-07' },
  { id: 28, projectName: 'Habitat Connectivity Study', status: 'Approved', reviewer: 'David Chen', submittedDate: '2026-01-08', lastUpdated: '2026-02-12' },
  { id: 29, projectName: 'Shoreline Stabilization', status: 'Pending Review', reviewer: 'Emily Davis', submittedDate: '2026-03-07', lastUpdated: '2026-03-13' },
  { id: 30, projectName: 'Native Species Reintroduction', status: 'Rejected', reviewer: 'Tom Wilson', submittedDate: '2026-02-16', lastUpdated: '2026-03-08' },
  { id: 31, projectName: 'Wetland Mitigation Bank', status: 'Approved', reviewer: 'Jane Smith', submittedDate: '2026-01-24', lastUpdated: '2026-02-26' },
  { id: 32, projectName: 'Urban Stream Restoration', status: 'Pending Review', reviewer: 'Mike Johnson', submittedDate: '2026-03-02', lastUpdated: '2026-03-12' },
  { id: 33, projectName: 'Riparian Ecosystem Enhancement', status: 'Needs Revision', reviewer: 'Sarah Lee', submittedDate: '2026-02-06', lastUpdated: '2026-03-08' },
  { id: 34, projectName: 'Conservation Easement Project', status: 'Approved', reviewer: 'David Chen', submittedDate: '2026-01-14', lastUpdated: '2026-02-16' },
  { id: 35, projectName: 'Forest Thinning for Fire Prevention', status: 'Pending Review', reviewer: 'Emily Davis', submittedDate: '2026-03-08', lastUpdated: '2026-03-13' },
  { id: 36, projectName: 'Salmon Habitat Restoration', status: 'Rejected', reviewer: 'Tom Wilson', submittedDate: '2026-02-18', lastUpdated: '2026-03-09' },
  { id: 37, projectName: 'Permeable Pavement Installation', status: 'Approved', reviewer: 'Jane Smith', submittedDate: '2026-01-26', lastUpdated: '2026-02-27' },
  { id: 38, projectName: 'Grassland Bird Habitat', status: 'Pending Review', reviewer: 'Mike Johnson', submittedDate: '2026-03-04', lastUpdated: '2026-03-13' },
  { id: 39, projectName: 'Creek Bank Revegetation', status: 'Needs Revision', reviewer: 'Sarah Lee', submittedDate: '2026-02-09', lastUpdated: '2026-03-09' },
  { id: 40, projectName: 'Tidal Marsh Restoration', status: 'Approved', reviewer: 'David Chen', submittedDate: '2026-01-16', lastUpdated: '2026-02-19' },
  { id: 41, projectName: 'Wildlife Underpass Construction', status: 'Pending Review', reviewer: 'Emily Davis', submittedDate: '2026-03-09', lastUpdated: '2026-03-13' },
  { id: 42, projectName: 'Old Growth Forest Protection', status: 'Rejected', reviewer: 'Tom Wilson', submittedDate: '2026-02-20', lastUpdated: '2026-03-10' },
  { id: 43, projectName: 'Green Roof Implementation', status: 'Approved', reviewer: 'Jane Smith', submittedDate: '2026-01-28', lastUpdated: '2026-02-28' },
  { id: 44, projectName: 'Amphibian Migration Corridor', status: 'Needs Revision', reviewer: 'Mike Johnson', submittedDate: '2026-02-11', lastUpdated: '2026-03-10' },
  { id: 45, projectName: 'Soil Erosion Prevention', status: 'Pending Review', reviewer: 'Sarah Lee', submittedDate: '2026-03-10', lastUpdated: '2026-03-13' },
  { id: 46, projectName: 'Butterfly Garden Network', status: 'Approved', reviewer: 'David Chen', submittedDate: '2026-01-19', lastUpdated: '2026-02-21' },
  { id: 47, projectName: 'Wetland Wildlife Refuge', status: 'Needs Revision', reviewer: 'Emily Davis', submittedDate: '2026-02-13', lastUpdated: '2026-03-11' },
  { id: 48, projectName: 'Carbon Sequestration Project', status: 'Rejected', reviewer: 'Tom Wilson', submittedDate: '2026-02-23', lastUpdated: '2026-03-11' },
  { id: 49, projectName: 'Lake Shoreline Rehabilitation', status: 'Approved', reviewer: 'Jane Smith', submittedDate: '2026-01-30', lastUpdated: '2026-03-01' },
  { id: 50, projectName: 'Desert Tortoise Habitat Enhancement', status: 'Needs Revision', reviewer: 'Mike Johnson', submittedDate: '2026-02-15', lastUpdated: '2026-03-12' },
]

const statusColors: Record<string, string> = {
  'Pending Review': 'bg-yellow-100 text-yellow-800',
  'Approved': 'bg-green-100 text-green-800',
  'Needs Revision': 'bg-orange-100 text-orange-800',
  'Rejected': 'bg-red-100 text-red-800',
}

export default function ProjectReviewStatus() {
  const columns: Column<ReviewStatus>[] = [
    { key: 'projectName', header: 'Project Name' },
    {
      key: 'status',
      header: 'Status',
      render: (value) => (
        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[value as string]}`}>
          {value as string}
        </span>
      ),
    },
    { key: 'reviewer', header: 'Reviewer' },
    { key: 'submittedDate', header: 'Submitted' },
    { key: 'lastUpdated', header: 'Last Updated' },
  ]

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800">Project Review Status</h1>
      <p className="mt-1 text-sm text-gray-500">Manage and track the review status of submitted projects.</p>

      <div className="mt-6">
        <DataTable columns={columns} data={sampleData} pageSize={10} />
      </div>
    </div>
  )
}
