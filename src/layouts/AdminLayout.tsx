import { NavLink, Outlet } from 'react-router-dom'
import { useState } from 'react'

interface SidebarSection {
  title: string
  collapsible: boolean
  links: { label: string; to: string }[]
}

const sidebarSections: SidebarSection[] = [
  {
    title: 'General',
    collapsible: true,
    links: [
      { label: 'Project Review Status', to: '/admin/project-review-status' },
      { label: 'Fund Types', to: '/admin/fund-types' },
      { label: 'Contacts', to: '/admin/contacts' },
      { label: 'Organizations', to: '/admin/organizations' },
      { label: 'Public Website', to: '/admin/public-website' },
      { label: 'Announcements', to: '/admin/announcements' },
    ],
  },
  {
    title: 'Tools',
    collapsible: true,
    links: [
      { label: 'Shapefile Upload', to: '/admin/shapefile-upload' },
      { label: 'Project Import', to: '/admin/project-import' },
    ],
  },
  {
    title: 'Project Delivery',
    collapsible: true,
    links: [
      { label: 'Reporting Periods', to: '/admin/reporting-periods' },
    ],
  },
  {
    title: 'Projects',
    collapsible: true,
    links: [
      { label: 'Questions', to: '/admin/questions' },
    ],
  },
]

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  const toggleSection = (title: string) => {
    setCollapsed((prev) => ({ ...prev, [title]: !prev[title] }))
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-60 border-r border-gray-200 bg-white flex flex-col overflow-y-auto">
        <div className="px-4 py-4">
          <h2 className="text-lg font-semibold text-gray-800">Admin Panel</h2>
        </div>

        <nav className="flex-1 px-2 pb-4">
          {sidebarSections.map((section) => (
            <div key={section.title} className="mb-1">
              <button
                onClick={() => toggleSection(section.title)}
                className="flex w-full items-center justify-between px-2 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-gray-700"
              >
                {section.title}
                <span className="text-[10px]">
                  {collapsed[section.title] ? '▶' : '▼'}
                </span>
              </button>

              {!collapsed[section.title] && (
                <ul className="space-y-0.5">
                  {section.links.map((link) => (
                    <li key={link.to}>
                      <NavLink
                        to={link.to}
                        className={({ isActive }) =>
                          `flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
                            isActive
                              ? 'bg-green-50 text-green-700 font-medium border-l-3 border-green-600'
                              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                          }`
                        }
                      >
                        {link.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </nav>

        <div className="border-t border-gray-200 px-4 py-3 text-xs text-gray-400">
          We are working on new features to improve your experience.
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
