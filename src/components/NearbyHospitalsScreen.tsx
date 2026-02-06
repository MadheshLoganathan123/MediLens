import { useState, useEffect } from 'react';
import {
  ChevronLeft,
  Search,
  MapPin,
  Navigation,
  Phone,
  Clock,
  Star,
  Map as MapIcon, // Renamed to avoid collison with Map component
  List,
  Stethoscope,
  Building2,
  CheckCircle,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { fetchNearbyHospitals } from '../services/hospitalService';
import hospitalsData from '../data/hospitals.json';

import { LocationCoords } from '../types';
import NearbyHospitalsMap from './NearbyHospitalsMap';


interface Hospital {
  id: string;
  name: string;
  distance: string;
  department: string[];
  status: 'Open' | 'Busy' | 'Closed';
  rating: number;
  address: string;
  phone: string;
  waitTime: string;
  type: 'Hospital' | 'Clinic' | 'Urgent Care';
  lat: number;
  lng: number;
}

interface NearbyHospitalsScreenProps {
  userProfile?: any;
  onBack: () => void;
  onSelectHospital?: (hospital: Hospital) => void;
}

// Default location (center of the dataset - Kakinada/Rajahmundry region)
// This ensures that even if user location is far, we show the demo data sorted by distance from this point
const DEFAULT_CENTER = { lat: 16.9891, lng: 82.2475 };

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

export function NearbyHospitalsScreen({ userProfile, onBack, onSelectHospital }: NearbyHospitalsScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [filterType, setFilterType] = useState<'All' | 'Hospital' | 'Clinic' | 'Urgent Care'>('All');
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadHospitals() {
      try {
        setIsLoading(true);
        setError(null);

        // Use user location if available, otherwise default center
        const userLat = userProfile?.location?.lat || DEFAULT_CENTER.lat;
        const userLng = userProfile?.location?.lng || DEFAULT_CENTER.lng;

        // Fetch real data from Overpass API
        const realHospitals = await fetchNearbyHospitals(userLat, userLng);

        // Process live data
        const liveProcessed = realHospitals.map((item: any) => {
          const distKm = calculateDistance(userLat, userLng, item.lat, item.lon);
          const isOpen = Math.random() > 0.2;
          const status = isOpen ? (Math.random() > 0.7 ? 'Busy' : 'Open') : 'Closed';

          let type: 'Hospital' | 'Clinic' | 'Urgent Care' = 'Hospital';
          if (item.tags.amenity === 'clinic' || item.tags.healthcare === 'clinic') {
            type = 'Clinic';
          }

          return {
            id: `live-${item.id}`,
            name: item.name,
            lat: item.lat,
            lng: item.lon,
            distance: `${distKm.toFixed(1)} km`,
            distanceValue: distKm,
            department: ['General Medicine', 'Emergency'],
            status: status as 'Open' | 'Busy' | 'Closed',
            rating: Number((3.5 + Math.random() * 1.5).toFixed(1)),
            address: item.tags['addr:street']
              ? `${item.tags['addr:street']}, ${item.tags['addr:city'] || ''}`
              : 'Address not available',
            phone: item.tags.phone || 'N/A',
            waitTime: `${Math.floor(Math.random() * 45) + 5} min`,
            type: type
          };
        });

        // Process and map local JSON data
        const localProcessed = hospitalsData.map((item: any) => {
          const distKm = calculateDistance(userLat, userLng, item.lat, item.lng);

          // Use provided data or randomize for consistency in demo
          const isOpen = Math.random() > 0.2;
          const status = isOpen ? (Math.random() > 0.7 ? 'Busy' : 'Open') : 'Closed';

          return {
            id: `local-${item.id}`,
            name: item.name,
            lat: item.lat,
            lng: item.lng,
            distance: `${distKm.toFixed(1)} km`,
            distanceValue: distKm,
            department: item.specialties && item.specialties.length > 0 ? item.specialties : ['General Medicine'],
            status: status as 'Open' | 'Busy' | 'Closed',
            rating: Number((3.5 + Math.random() * 1.5).toFixed(1)),
            address: item.address,
            phone: item.phone,
            waitTime: `${Math.floor(Math.random() * 45) + 5} min`,
            type: (item.type && (item.type === 'Hospital' || item.type === 'Clinic' || item.type === 'Urgent Care')) ? item.type : 'Hospital'
          };
        });

        // Combine and sort by distance
        const combinedHospitals = [...liveProcessed, ...localProcessed]
          .sort((a: any, b: any) => a.distanceValue - b.distanceValue)
          .slice(0, 100);

        setHospitals(combinedHospitals as Hospital[]);
      } catch (err) {
        console.error('Failed to load hospitals:', err);
        setError('Unable to fetch live hospital data. Please check your connection.');
      } finally {
        setIsLoading(false);
      }
    }

    loadHospitals();
  }, [userProfile]);

  const filteredHospitals = hospitals.filter(hospital => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = hospital.name.toLowerCase().includes(query) ||
      hospital.address.toLowerCase().includes(query) ||
      hospital.department.some(dept => dept.toLowerCase().includes(query));

    const matchesFilter = filterType === 'All' || hospital.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getStatusConfig = (status: Hospital['status']) => {
    switch (status) {
      case 'Open':
        return { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' };
      case 'Busy':
        return { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' };
      case 'Closed':
        return { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-500' };
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-600 font-medium">Finding nearby care...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <div className="bg-red-100 p-6 rounded-full mb-6">
            <AlertCircle className="w-12 h-12 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-blue-600 font-semibold flex items-center gap-2"
          >
            Try Again
          </button>
        </div>
      );
    }

    if (filteredHospitals.length === 0) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <div className="bg-gray-100 p-6 rounded-full mb-6">
            <Search className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Results Found</h2>
          <p className="text-gray-600">Try adjusting your filters or search query.</p>
        </div>
      );
    }

    if (viewMode === 'list') {
      return (
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-4">
            {filteredHospitals.map((hospital) => {
              const statusConfig = getStatusConfig(hospital.status);
              return (
                <div
                  key={hospital.id}
                  className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-all"
                >
                  {/* Hospital Header */}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            {hospital.type === 'Hospital' ? (
                              <Building2 className="w-5 h-5 text-blue-600" />
                            ) : (
                              <Stethoscope className="w-5 h-5 text-blue-600" />
                            )}
                          </div>
                          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {hospital.type}
                          </span>
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 mb-1">
                          {hospital.name}
                        </h3>
                        <div className="flex items-center space-x-1 mb-2">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm font-semibold text-gray-700">{hospital.rating}</span>
                          <span className="text-sm text-gray-500">• {hospital.distance}</span>
                        </div>
                      </div>

                      <div className={`${statusConfig.bg} ${statusConfig.text} px-3 py-1.5 rounded-full flex items-center space-x-1.5`}>
                        <div className={`w-2 h-2 rounded-full ${statusConfig.dot} animate-pulse`}></div>
                        <span className="text-xs font-semibold">{hospital.status}</span>
                      </div>
                    </div>

                    {/* Departments */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {hospital.department.slice(0, 3).map((dept, index) => (
                        <span
                          key={index}
                          className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg"
                        >
                          {dept}
                        </span>
                      ))}
                      {hospital.department.length > 3 && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg">
                          +{hospital.department.length - 3} more
                        </span>
                      )}
                    </div>

                    {/* Info Row */}
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>Wait: {hospital.waitTime}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="truncate max-w-[150px]">{hospital.address.split(',')[0]}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => onSelectHospital?.(hospital)}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2"
                      >
                        <CheckCircle className="w-5 h-5" />
                        <span>Select</span>
                      </button>
                      <button className="bg-white border-2 border-gray-200 text-gray-700 p-3 rounded-xl hover:bg-gray-50 transition-all">
                        <Phone className="w-5 h-5" />
                      </button>
                      <button className="bg-white border-2 border-gray-200 text-gray-700 p-3 rounded-xl hover:bg-gray-50 transition-all">
                        <Navigation className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // Map View
    return (
      <div className="flex-1 relative z-0">
        <NearbyHospitalsMap
          hospitals={filteredHospitals}
          center={[userProfile?.location?.lng || DEFAULT_CENTER.lng, userProfile?.location?.lat || DEFAULT_CENTER.lat]}
          userLocation={userProfile?.location ? { 
            lat: userProfile.location.lat, 
            lng: userProfile.location.lng 
          } : { 
            lat: DEFAULT_CENTER.lat, 
            lng: DEFAULT_CENTER.lng 
          }}
        />

        {/* Floating List Toggle */}
        <div className="absolute bottom-20 right-6 z-[1000]">
          <button
            onClick={() => setViewMode('list')}
            className="flex items-center justify-center w-14 h-14 bg-blue-600 text-white rounded-full shadow-xl hover:bg-blue-700 transition-all font-semibold"
          >
            <List className="w-6 h-6" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full w-full flex flex-col bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-6 pt-12 pb-6 rounded-b-3xl shadow-lg">
        <button
          onClick={onBack}
          className="mb-6 flex items-center text-white hover:text-blue-100 transition-colors"
        >
          <ChevronLeft className="w-6 h-6 mr-1" />
          <span className="font-medium">Back</span>
        </button>

        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-white text-3xl font-bold mb-1">Nearby Care</h1>
            <p className="text-blue-100 text-sm">Find hospitals & clinics near you</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
            <Navigation className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search hospitals or clinics"
            className="w-full pl-12 pr-4 py-3.5 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-white shadow-lg"
          />
        </div>
      </div>

      {/* Filter & View Toggle */}
      <div className="px-6 py-4 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2 overflow-x-auto">
            {['All', 'Hospital', 'Clinic', 'Urgent Care'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type as typeof filterType)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${filterType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2 ml-3">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                }`}
            >
              <List className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-2 rounded-lg ${viewMode === 'map' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                }`}
            >
              <MapIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {!isLoading && !error && (
          <p className="text-sm text-gray-600">
            {filteredHospitals.length} {filterType !== 'All' ? filterType.toLowerCase() : 'location'}
            {filteredHospitals.length !== 1 ? 's' : ''} found
          </p>
        )}
      </div>

      {renderContent()}
    </div>
  );
}
