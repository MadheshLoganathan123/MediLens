import {
    ChevronLeft,
    Phone,
    Navigation,
    Clock,
    Star,
    MapPin,
    Calendar,
    Share2,
    Shield,
    Award,
    Stethoscope
} from 'lucide-react';

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
    coordinates: { lat: number; lon: number };
}

interface HospitalProfileScreenProps {
    hospital: Hospital;
    onBack: () => void;
}

export function HospitalProfileScreen({ hospital, onBack }: HospitalProfileScreenProps) {
    return (
        <div className="h-full w-full flex flex-col bg-white overflow-y-auto">
            {/* Hero Image Section */}
            <div className="relative h-64 bg-gray-200">
                <img
                    src={`https://source.unsplash.com/800x600/?hospital,clinic,medical&sig=${hospital.id}`}
                    alt={hospital.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1538108149393-fbbd81897560?auto=format&fit=crop&q=80&w=1000';
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>

                <button
                    onClick={onBack}
                    className="absolute top-12 left-6 bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/30 transition-all"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>

                <div className="absolute bottom-6 left-6 right-6">
                    <div className="flex items-center space-x-2 mb-2">
                        <span className="px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded-lg uppercase tracking-wider">
                            {hospital.type}
                        </span>
                        <div className="flex items-center bg-black/40 backdrop-blur-sm px-2 py-1 rounded-lg">
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 mr-1" />
                            <span className="text-white text-xs font-bold">{hospital.rating} (120+ reviews)</span>
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-white leading-tight">{hospital.name}</h1>
                    <p className="text-white/90 text-sm mt-1 flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {hospital.address.split(',')[0]} • {hospital.distance} away
                    </p>
                </div>
            </div>

            {/* Action Bar */}
            <div className="grid grid-cols-4 gap-4 p-6 border-b border-gray-100">
                <button className="flex flex-col items-center space-y-2 group">
                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                        <Phone className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium text-gray-600">Call</span>
                </button>
                <button className="flex flex-col items-center space-y-2 group">
                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                        <Navigation className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium text-gray-600">Directions</span>
                </button>
                <button className="flex flex-col items-center space-y-2 group">
                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                        <Share2 className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium text-gray-600">Share</span>
                </button>
                <button className="flex flex-col items-center space-y-2 group">
                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                        <Calendar className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium text-gray-600">Book</span>
                </button>
            </div>

            <div className="p-6 space-y-8 pb-24">
                {/* Status Card */}
                <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between border border-gray-100">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Current Status</p>
                        <div className="flex items-center space-x-2">
                            <div className={`w-2.5 h-2.5 rounded-full ${hospital.status === 'Open' ? 'bg-green-500' :
                                    hospital.status === 'Busy' ? 'bg-yellow-500' : 'bg-red-500'
                                } animate-pulse`}></div>
                            <span className="font-bold text-gray-900">{hospital.status}</span>
                        </div>
                    </div>
                    <div className="h-10 w-px bg-gray-200"></div>
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Est. Wait Time</p>
                        <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-blue-600" />
                            <span className="font-bold text-gray-900">{hospital.waitTime}</span>
                        </div>
                    </div>
                </div>

                {/* Departments */}
                <div>
                    <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center">
                        <Stethoscope className="w-5 h-5 mr-2 text-blue-600" />
                        Departments
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {hospital.department.map((dept, index) => (
                            <span
                                key={index}
                                className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-sm rounded-lg font-medium shadow-sm"
                            >
                                {dept}
                            </span>
                        ))}
                    </div>
                </div>

                {/* About */}
                <div>
                    <h3 className="font-bold text-lg text-gray-900 mb-3 flex items-center">
                        <Shield className="w-5 h-5 mr-2 text-blue-600" />
                        About
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-sm">
                        A leading healthcare provider in the region, offering comprehensive medical services with state-of-the-art facilities.
                        Dedicated to patient care and medical excellence with 24/7 emergency support.
                    </p>
                </div>

                {/* Awards/Features */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-xl">
                        <Award className="w-6 h-6 text-blue-600 mb-2" />
                        <h4 className="font-bold text-gray-900 text-sm">Top Rated</h4>
                        <p className="text-xs text-blue-600 mt-1">Best in patient care 2024</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-xl">
                        <Shield className="w-6 h-6 text-green-600 mb-2" />
                        <h4 className="font-bold text-gray-900 text-sm">Verified</h4>
                        <p className="text-xs text-green-600 mt-1">Licensed medical facility</p>
                    </div>
                </div>
            </div>

            {/* Floating Action Button */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-20">
                <div className="max-w-md mx-auto">
                    <button className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all active:scale-[0.98] flex items-center justify-center space-x-2">
                        <Calendar className="w-5 h-5" />
                        <span>Book Appointment Now</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
