import React from 'react';

const DeveloperBadge = () => {
  // Replace this URL with your actual image path (e.g., "/ashen-profile.jpg" or a hosted link)
  const myProfileImage = "/ashen.jpg"; 

  return (
    <div className="fixed bottom-6 right-6 z-[200] group">
      {/* The Round Button */}
      <div className="flex items-center gap-3 bg-white/90 backdrop-blur-md border border-gray-200 px-3 py-2.5 rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-white/50">
        
        {/* Your Custom Image Container */}
        <div className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-purple-100 shadow-sm">
          <img 
            src={myProfileImage} 
            alt="Ashen"
            className="h-full w-full object-cover"
            onError={(e) => {
                // Fallback in case the image fails to load
                e.target.src = "https://ui-avatars.com/api/?name=Ashen&background=0D8ABC&color=fff";
            }}
          />
          {/* Pulsing indicator to show "Active/Live" */}
          <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white animate-pulse"></span>
        </div>

        {/* The Text */}
        <div className="flex flex-col pr-2">
          <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold leading-none mb-1">
            Developed by
          </span>
          <span className="text-sm font-black text-gray-900 leading-tight tracking-tight">
            ASHEN <span className="text-purple-600">.</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default DeveloperBadge;