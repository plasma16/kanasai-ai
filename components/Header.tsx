'use client'

interface HeaderProps {
  onAddClick: () => void
}

export default function Header({ onAddClick }: HeaderProps) {
  return (
    <header className="bg-blue-900 shadow-lg border-b border-blue-800">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Kanasai.ai</h1>
            <p className="text-blue-200 mt-1">Crowdsourced Petty Theft Map</p>
            <p className="text-sm text-blue-300 mt-2 max-w-2xl">
              Help build awareness by reporting petty theft incidents across Singapore. 
              Data is crowdsourced from the community to create a real-time heat map.
            </p>
          </div>
          <button
            onClick={onAddClick}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-500 transition-colors flex items-center gap-2 shadow-lg"
          >
            <span className="text-xl">+</span>
            <span className="hidden sm:inline">Report Theft</span>
          </button>
        </div>
      </div>
    </header>
  )
}
