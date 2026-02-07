import { useState, useRef } from 'react';
import { ChevronLeft, FileText, Image, X, Upload, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { createCase, analyzeImage, fileToBase64, type ImageAnalysisResponse } from '@/lib/apiClient';
import type { HealthCase } from '@/types';

interface SymptomFormScreenProps {
  initialImages?: File[];
  initialSymptoms?: string;
  onSubmit: (caseData: HealthCase) => void;
  onBack: () => void;
}

export function SymptomFormScreen({ initialImages = [], initialSymptoms = '', onSubmit, onBack }: SymptomFormScreenProps) {
  const [symptoms, setSymptoms] = useState(initialSymptoms);
  const [images, setImages] = useState<File[]>(initialImages);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ImageAnalysisResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize image previews from initial images
  if (initialImages.length > 0 && imagePreviews.length === 0) {
    const previews = initialImages.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      
      setImages(prev => [...prev, ...newFiles]);
      setImagePreviews(prev => [...prev, ...newPreviews]);

      // Auto-analyze first image if symptoms are provided
      if (newFiles.length > 0 && symptoms.trim()) {
        await analyzeFirstImage(newFiles[0]);
      }
    }
  };

  const analyzeFirstImage = async (imageFile: File) => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      console.log('[SymptomForm] Starting image analysis...');
      
      // Convert image to base64
      const base64Image = await fileToBase64(imageFile);
      
      // Call Gemini API
      const result = await analyzeImage(
        base64Image,
        symptoms.trim() || undefined,
        'Analyze this medical image for visible symptoms and conditions'
      );
      
      console.log('[SymptomForm] Analysis complete:', result);
      setAnalysisResult(result);
      
      // Auto-fill symptoms if empty
      if (!symptoms.trim() && result.detected_symptoms.length > 0) {
        const detectedSymptoms = result.detected_symptoms
          .map(s => `${s.symptom_name} (${s.severity})`)
          .join(', ');
        setSymptoms(`Detected symptoms: ${detectedSymptoms}\n\n${result.analysis_text}`);
      }
    } catch (err: any) {
      console.error('[SymptomForm] Image analysis failed:', err);
      setError(`Image analysis failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!symptoms.trim()) {
      setError('Please describe your symptoms');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Analyze image if available and not already analyzed
      if (images.length > 0 && !analysisResult) {
        await analyzeFirstImage(images[0]);
      }

      // Step 2: Create health case with analysis results
      const caseData = await createCase({
        symptoms: symptoms.trim(),
        severity: analysisResult?.urgency_level || undefined,
        category: analysisResult?.possible_conditions?.[0] || undefined,
      });

      console.log('[SymptomForm] Case created successfully:', caseData);

      // Step 3: Pass created case back to parent
      onSubmit(caseData);
    } catch (err: any) {
      console.error('[SymptomForm] Failed to create case:', err);
      setError(
        err.message || 
        'Failed to create case. Please try again.'
      );
      setIsLoading(false);
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
        <h1 className="text-white text-3xl font-bold mb-2">Describe Your Symptoms</h1>
        <p className="text-blue-100">Provide as much detail as possible for accurate analysis</p>
      </div>

      {/* Main Content */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-8 flex flex-col">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-900 text-sm">Error</h4>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Analysis Loading */}
        {isAnalyzing && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start space-x-3">
            <Loader2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5 animate-spin" />
            <div>
              <h4 className="font-semibold text-blue-900 text-sm">Analyzing Image...</h4>
              <p className="text-blue-700 text-sm">Our AI is analyzing your medical image</p>
            </div>
          </div>
        )}

        {/* Analysis Results */}
        {analysisResult && !isAnalyzing && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-start space-x-3 mb-3">
              <Sparkles className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-green-900 text-sm mb-1">AI Analysis Complete</h4>
                <p className="text-green-700 text-sm mb-2">{analysisResult.analysis_text}</p>
              </div>
            </div>
            
            {analysisResult.detected_symptoms.length > 0 && (
              <div className="mt-3 pt-3 border-t border-green-200">
                <p className="text-xs font-semibold text-green-900 mb-2">Detected Symptoms:</p>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.detected_symptoms.map((symptom, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                    >
                      {symptom.symptom_name} ({symptom.severity})
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {analysisResult.urgency_level && (
              <div className="mt-2">
                <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
                  analysisResult.urgency_level === 'high' || analysisResult.urgency_level === 'emergency'
                    ? 'bg-red-100 text-red-800'
                    : analysisResult.urgency_level === 'medium'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  Urgency: {analysisResult.urgency_level}
                </span>
              </div>
            )}
          </div>
        )}

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
            disabled={!symptoms.trim() || isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Creating case...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Analyze with AI</span>
              </>
            )}
          </button>
          <p className="text-center text-xs text-gray-500 mt-3">
            {isLoading ? 'Creating your case and analyzing symptoms...' : 'Our AI will analyze your symptoms and provide recommendations'}
          </p>
        </div>
      </form>
    </div>
  );
}
