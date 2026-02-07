import { Camera, FileText, Mic, ChevronLeft, Upload, Image } from 'lucide-react';
import { useRef } from 'react';

interface ReportHealthIssueScreenProps {
  onMethodSelected: (method: 'image' | 'text' | 'voice', images?: File[]) => void;
  onBack: () => void;
}

export function ReportHealthIssueScreen({ onMethodSelected, onBack }: ReportHealthIssueScreenProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onMethodSelected('image', Array.from(files));
    }
  };

  const handleCameraClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-gradient-to-br from-blue-50 via-white to-blue-50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-6 pt-10 pb-6 flex-shrink-0">
        <button
          onClick={onBack}
          className="mb-6 flex items-center text-white hover:text-blue-100 transition-colors"
        >
          <ChevronLeft className="w-6 h-6 mr-1" />
          <span className="font-medium">Back</span>
        </button>
        <h1 className="text-white text-3xl font-bold mb-2">Report Health Issue</h1>
        <p className="text-blue-100">Choose how you'd like to describe your symptoms</p>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Step 1 of 3</span>
            <span className="text-sm text-gray-500">Choose Method</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 w-1/3 rounded-full"></div>
          </div>
        </div>

        {/* Method Selection Cards */}
        <div className="space-y-4">
          {/* Upload Image Option */}
          <button
            onClick={handleCameraClick}
            className="w-full bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all border-2 border-gray-100 hover:border-blue-300 group"
          >
            <div className="flex items-start space-x-4">
              <div className="bg-gradient-to-br from-blue-100 to-cyan-100 p-4 rounded-xl group-hover:scale-110 transition-transform">
                <Camera className="w-8 h-8 text-blue-600" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-bold text-lg text-gray-900 mb-1">Upload Image</h3>
                <p className="text-gray-600 text-sm mb-3">
                  Take a photo or upload from gallery
                </p>
                <div className="flex items-center space-x-2">
                  <div className="bg-blue-50 px-3 py-1 rounded-full">
                    <span className="text-xs font-medium text-blue-700">Recommended</span>
                  </div>
                  <div className="bg-green-50 px-3 py-1 rounded-full">
                    <span className="text-xs font-medium text-green-700">Fast Analysis</span>
                  </div>
                </div>
              </div>
              <Upload className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />

          {/* Enter Symptoms Text Option */}
          <button
            onClick={() => onMethodSelected('text')}
            className="w-full bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all border-2 border-gray-100 hover:border-blue-300 group"
          >
            <div className="flex items-start space-x-4">
              <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-4 rounded-xl group-hover:scale-110 transition-transform">
                <FileText className="w-8 h-8 text-purple-600" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-bold text-lg text-gray-900 mb-1">Enter Symptoms</h3>
                <p className="text-gray-600 text-sm mb-3">
                  Describe your symptoms in detail
                </p>
                <div className="flex items-center space-x-2">
                  <div className="bg-purple-50 px-3 py-1 rounded-full">
                    <span className="text-xs font-medium text-purple-700">Detailed</span>
                  </div>
                </div>
              </div>
              <FileText className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
            </div>
          </button>

          {/* Voice Input Option */}
          <button
            onClick={() => onMethodSelected('voice')}
            className="w-full bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all border-2 border-gray-100 hover:border-blue-300 group"
          >
            <div className="flex items-start space-x-4">
              <div className="bg-gradient-to-br from-orange-100 to-amber-100 p-4 rounded-xl group-hover:scale-110 transition-transform">
                <Mic className="w-8 h-8 text-orange-600" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-bold text-lg text-gray-900 mb-1">Voice Input</h3>
                <p className="text-gray-600 text-sm mb-3">
                  Speak your symptoms naturally
                </p>
                <div className="flex items-center space-x-2">
                  <div className="bg-orange-50 px-3 py-1 rounded-full">
                    <span className="text-xs font-medium text-orange-700">Quick & Easy</span>
                  </div>
                  <div className="bg-gray-100 px-3 py-1 rounded-full">
                    <span className="text-xs font-medium text-gray-600">Beta</span>
                  </div>
                </div>
              </div>
              <Mic className="w-5 h-5 text-gray-400 group-hover:text-orange-600 transition-colors" />
            </div>
          </button>
        </div>

        {/* Info Card */}
        <div className="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Image className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">Privacy & Security</h4>
              <p className="text-blue-700 text-sm">
                Your health data is encrypted and securely stored. We never share your information without your consent.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
