export default function DashboardLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5">
      <div className="relative">
        <div className="absolute inset-0 animate-ping opacity-20">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600" />
        </div>
        <div className="relative h-16 w-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl shadow-teal-500/30">
          <svg 
            viewBox="0 0 24 24" 
            className="w-8 h-8 text-white animate-pulse"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M2 20h20M4 20V10l8-6 8 6v10" />
            <path d="M9 20v-6h6v6" />
          </svg>
        </div>
      </div>
      <div className="text-center space-y-2">
        <p className="font-display text-xl text-stone-800">Cargando...</p>
        <p className="text-sm text-stone-500">Preparando tu espacio de trabajo</p>
      </div>
    </div>
  );
}
