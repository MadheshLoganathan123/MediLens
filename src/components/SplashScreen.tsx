import medilensLogo from 'figma:asset/cde87ec17cfbeb9b41246716fb10777021e7e23f.png';

export function SplashScreen() {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 px-6">
      <div className="animate-fade-in">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-white rounded-full blur-2xl opacity-30 animate-pulse"></div>
            <div className="relative bg-white rounded-3xl p-4 shadow-2xl">
              <img 
                src={medilensLogo} 
                alt="MediLens Logo" 
                className="w-32 h-32 object-contain"
                style={{ mixBlendMode: 'multiply' }}
              />
            </div>
          </div>
        </div>

        {/* App Name */}
        <h1 className="text-5xl font-bold text-white text-center mb-4 tracking-tight">
          MediLens
        </h1>

        {/* Tagline */}
        <p className="text-xl text-blue-100 text-center font-medium max-w-sm mx-auto">
          AI-Powered Smart Healthcare Triage
        </p>

        {/* Loading Indicator */}
        <div className="flex justify-center mt-12">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}