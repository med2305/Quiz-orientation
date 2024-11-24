'use client';

import { useState, useEffect } from 'react';

export default function QuizRecommendations({ score, quizId, specialite }) {
  const [recommendations, setRecommendations] = useState({
    formations: [],
    universities: [],
    isSpecialized: false,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await fetch(`/api/recommendations?quizId=${quizId}&score=${score}&specialite=${specialite}`);
        if (!response.ok) throw new Error('Failed to fetch recommendations');
        const data = await response.json();
        console.log('Recommendations:', data); // Debug log
        setRecommendations({
          formations: data.formations,
          universities: data.universities,
          isSpecialized: data.isSpecialized,
          loading: false,
          error: null
        });
      } catch (error) {
        setRecommendations(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }));
      }
    };

    fetchRecommendations();
  }, [quizId, score, specialite]);

  if (recommendations.loading) {
    return (
      <div className="mt-8 text-center">
        <div className="animate-pulse">Chargement des recommandations...</div>
      </div>
    );
  }

  if (recommendations.error) {
    return (
      <div className="mt-8 text-center text-red-600">
        Une erreur est survenue lors du chargement des recommandations.
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl text-blue-700 font-semibold mb-6">
        {recommendations.isSpecialized
          ? `Recommandations pour ${specialite} :`
          : 'Recommandations Générales'}
      </h2>

      {/* Formations Section */}
      {recommendations.formations && recommendations.formations.length > 0 ? (
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4 text-black">Formations Recommandées</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {recommendations.formations.map((formation) => (
              <div key={formation._id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <h4 className="font-medium text-black">{formation.nom}</h4>
                {formation.specialite && (
                  <p className="text-sm text-primary-500 mt-1">
                    Spécialité: {formation.specialite}
                  </p>
                )}
                <p className="text-sm text-gray-600 mt-1">{formation.description}</p>
                <div className="mt-2 text-sm">
                  <span className="inline-block bg-primary-50 text-primary-700 px-2 py-1 rounded">
                    Compatibilité: {formation.matchScore}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mb-8">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-600">Aucune formation recommandée trouvée</p>
          </div>
        </div>
      )}

      {/* Universities Section */}
      {recommendations.universities && recommendations.universities.length > 0 ? (
        <div>
          <h3 className="text-lg font-medium mb-4 text-black">Universités Recommandées</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {recommendations.universities.map((university) => (
              <div key={university._id} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{university.name}</h3>
                    <div className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
                      Compatibilité: {university.matchScore}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-600">Aucune université recommandée trouvée</p>
          </div>
        </div>
      )}
    </div>
  );
}
