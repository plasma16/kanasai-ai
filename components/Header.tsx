'use client'

interface HeaderProps {
  onAddClick: () => void
}

export default function Header({ onAddClick }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kanasai.ai</h1>
            <p className="text-sm text-gray-600">Singapore Petty Theft Heat Map</p>
          </div>
          <button
            onClick={onAddClick}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <span className="text-xl">+</span>
            <span className="hidden sm:inline">Report Theft</span>
          </button>
        </div>
      </div>
    </header>
  )
}
