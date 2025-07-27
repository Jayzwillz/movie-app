import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaUser, FaSearch, FaTimes } from 'react-icons/fa';

const MovieCast = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const { allCast = [], allCrew = [], movie = {} } = location.state || {};
  
  const [activeTab, setActiveTab] = useState('cast');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPerson, setSelectedPerson] = useState(null);

  // If no data in state, redirect back
  useEffect(() => {
    if (!location.state) {
      navigate(`/movie/${id}`);
    }
  }, [location.state, navigate, id]);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const filteredCast = allCast.filter(person =>
    person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.character?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCrew = allCrew.filter(person =>
    person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.job?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group crew by department
  const crewByDepartment = filteredCrew.reduce((acc, person) => {
    const dept = person.department || 'Other';
    if (!acc[dept]) acc[dept] = [];
    acc[dept].push(person);
    return acc;
  }, {});

  const handlePersonClick = (person) => {
    setSelectedPerson(person);
  };

  if (!location.state) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate(`/movie/${id}`)}
              className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
            >
              <FaArrowLeft />
              <span>Back to Movie</span>
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <img
              src={movie.poster_path ? 
                `https://image.tmdb.org/t/p/w92${movie.poster_path}` : 
                '/api/placeholder/92/138'
              }
              alt={movie.title}
              className="w-16 h-24 rounded object-cover"
            />
            <div>
              <h1 className="text-2xl font-bold">{movie.title}</h1>
              <p className="text-gray-400">Cast & Crew</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('cast')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                activeTab === 'cast'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Cast ({allCast.length})
            </button>
            <button
              onClick={() => setActiveTab('crew')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                activeTab === 'crew'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Crew ({allCrew.length})
            </button>
          </div>
          
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Cast Tab */}
        {activeTab === 'cast' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCast.map((person) => (
              <div
                key={person.id}
                onClick={() => handlePersonClick(person)}
                className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition-all cursor-pointer hover:scale-105"
              >
                <div className="aspect-[2/3] relative">
                  {person.profile_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                      alt={person.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                      <FaUser className="w-16 h-16 text-gray-500" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-white mb-1">{person.name}</h3>
                  <p className="text-gray-400 text-sm">{person.character}</p>
                  {person.order !== undefined && (
                    <p className="text-gray-500 text-xs mt-1">Order: {person.order + 1}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Crew Tab */}
        {activeTab === 'crew' && (
          <div className="space-y-8">
            {Object.entries(crewByDepartment).map(([department, people]) => (
              <div key={department}>
                <h2 className="text-xl font-bold mb-4 text-blue-400">{department}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {people.map((person, index) => (
                    <div
                      key={`${person.id}-${index}`}
                      onClick={() => handlePersonClick(person)}
                      className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition-all cursor-pointer hover:scale-105"
                    >
                      <div className="aspect-[2/3] relative">
                        {person.profile_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                            alt={person.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                            <FaUser className="w-16 h-16 text-gray-500" />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-white mb-1">{person.name}</h3>
                        <p className="text-gray-400 text-sm">{person.job}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredCast.length === 0 && activeTab === 'cast' && (
          <div className="text-center py-12">
            <p className="text-gray-400">No cast members found matching your search.</p>
          </div>
        )}

        {Object.keys(crewByDepartment).length === 0 && activeTab === 'crew' && (
          <div className="text-center py-12">
            <p className="text-gray-400">No crew members found matching your search.</p>
          </div>
        )}
      </div>

      {/* Person Detail Modal */}
      {selectedPerson && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-gray-700">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">{selectedPerson.name}</h3>
              <button
                onClick={() => setSelectedPerson(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex gap-4">
              <div className="w-20 h-28 flex-shrink-0">
                {selectedPerson.profile_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w185${selectedPerson.profile_path}`}
                    alt={selectedPerson.name}
                    className="w-full h-full object-cover rounded"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-700 flex items-center justify-center rounded">
                    <FaUser className="w-8 h-8 text-gray-500" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                {selectedPerson.character && (
                  <div className="mb-2">
                    <span className="text-gray-400 text-sm">Character:</span>
                    <p className="text-white">{selectedPerson.character}</p>
                  </div>
                )}
                {selectedPerson.job && (
                  <div className="mb-2">
                    <span className="text-gray-400 text-sm">Job:</span>
                    <p className="text-white">{selectedPerson.job}</p>
                  </div>
                )}
                {selectedPerson.department && (
                  <div className="mb-2">
                    <span className="text-gray-400 text-sm">Department:</span>
                    <p className="text-white">{selectedPerson.department}</p>
                  </div>
                )}
                <div className="mb-2">
                  <span className="text-gray-400 text-sm">TMDB ID:</span>
                  <p className="text-white">{selectedPerson.id}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieCast;
