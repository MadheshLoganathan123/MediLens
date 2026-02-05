import { useState, useRef } from 'react';
import { ChevronLeft, FileText, Image, X, Upload, Sparkles } from 'lucide-react';

interface SymptomFormScreenProps {
  initialImages?: File[];
  onSubmit: (symptoms: string, images?: File[]) => void;
  onBack: () => void;
}

export function SymptomFormScreen({ initialImages = [], onSubmit, onBack }: SymptomFormScreenProps) {
  const [symptoms, setSymptoms] = useState('');
  const [images, setImages] = useState<File[]>(initialImages);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate image previews
  useState(() => {
    if (initialImages.length > 0) {
      const previews = initialImages.map(file => URL.createObjectURL(file));
      setImagePreviews(previews);
    }
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      
      setImages(prev => [...prev, ...newFiles]);
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (symptoms.trim() || images.length > 0) {
      onSubmit(symptoms, images);
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-6 pt-12 pb-8 rounded-b-3xl shadow-lg">
        <button
          onClick={onBack}
          className="mb-6 flex items-center text-white hover:text-blue-100 transition-colors"
        >
          <ChevronLeft className="w-6 h-6 mr-1" />
          <span className="font-medium">Back</span>
        </button>
        <h1 className="text-white text-3xl font-bold mb-2">Describe Your Symptoms</h1>
        <p className="text-blue-100">Provide as much detail as possible for accurate analysis</p>
      </div>

      {/* Main Content */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-8 flex flex-col">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Step 2 of 3</span>
            <span className="text-sm text-gray-500">Input Symptoms</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 w-2/3 rounded-full"></div>
          </div>
        </div>

        {/* Symptom Input */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            <FileText className="w-4 h-4 inline mr-2" />
            Tell us what you're experiencing
          </label>
          <div className="relative">
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="E.g., I've been experiencing headaches for the past 3 days, along with a mild fever and fatigue..."
              rows={8}
              className="w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
            />
            <div className="absolute bottom-3 right-3 text-xs text-gray-400">
              {symptoms.length} characters
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Include: When symptoms started, severity, location, and any changes over time
          </p>
        </div>

        {/* Image Upload Section */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            <Image className="w-4 h-4 inline mr-2" />
            Attach Images <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          
          {/* Image Previews */}
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-3">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-xl border-2 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-white border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-blue-400 hover:bg-blue-50 transition-all group"
          >
            <Upload className="w-8 h-8 text-gray-400 group-hover:text-blue-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700 group-hover:text-blue-600">
              Add Photos
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Upload images of affected areas or test results
            </p>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>

        {/* Quick Tips */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-xl p-4 mb-6">
          <h4 className="font-semibold text-purple-900 mb-2 text-sm">💡 Tips for Better Analysis</h4>
          <ul className="space-y-1 text-xs text-purple-700">
            <li>• Be specific about symptom duration and intensity</li>
            <li>• Mention any recent activities or exposures</li>
            <li>• Include relevant medical history if applicable</li>
            <li>• Clear, well-lit photos help with visual symptoms</li>
          </ul>
        </div>

        {/* Submit Button */}
        <div className="mt-auto pt-4">
          <button
            type="submit"
            disabled={!symptoms.trim() && images.length === 0}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2"
          >
            <Sparkles className="w-5 h-5" />
            <span>Analyze with AI</span>
          </button>
          <p className="text-center text-xs text-gray-500 mt-3">
            Our AI will analyze your symptoms and provide recommendations
          </p>
        </div>
      </form>
    </div>
  );
}
