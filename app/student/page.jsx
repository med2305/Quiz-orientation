'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function StudentDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [advice, setAdvice] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [quizStats, setQuizStats] = useState(null);
  const [quizResults, setQuizResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user data
        const userResponse = await fetch('/api/users/me');
        const userData = await userResponse.json();
        
        if (userData.role !== 'student') {
          router.push('/login');
          return;
        }
        
        setUserData(userData);

        // Fetch advice
        const adviceResponse = await fetch('/api/advice');
        const adviceData = await adviceResponse.json();
        setAdvice(adviceData);

        // Fetch quizzes
        const quizzesResponse = await fetch('/api/quizzes');
        const quizzesData = await quizzesResponse.json();
        setQuizzes(quizzesData.quizzes || quizzesData);
        setQuizStats(quizzesData.stats);

        // Fetch quiz results
        const resultsResponse = await fetch('/api/quizzes/results');
        const resultsData = await resultsResponse.json();
        setQuizResults(resultsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchData();
    }
  }, [status, router]);

  const handleMarkAsRead = async (adviceId) => {
    try {
      const response = await fetch('/api/advice', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adviceId }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du statut');
      }

      const updatedAdvice = await response.json();
      setAdvice(advice.map(item => 
        item._id === updatedAdvice._id ? updatedAdvice : item
      ));
    } catch (error) {
      console.error('Error marking advice as read:', error);
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-semibold">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 lg:pb-0 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Bienvenue, {userData?.prenom} {userData?.nom}
          </h1>
        </div>

        {/* Quiz Statistics */}
        {quizStats && (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Statistiques des Quiz</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-primary-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-primary-600">{quizStats.totalCompleted}</div>
                <div className="text-sm text-gray-600">Quiz complétés</div>
              </div>
              <div className="bg-primary-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-primary-600">{quizStats.totalAvailable}</div>
                <div className="text-sm text-gray-600">Quiz disponibles</div>
              </div>
              <div className="bg-primary-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-primary-600">{quizStats.averageScore}%</div>
                <div className="text-sm text-gray-600">Score moyen</div>
              </div>
              <div className="bg-primary-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-primary-600">{quizStats.completionRate}%</div>
                <div className="text-sm text-gray-600">Taux de complétion</div>
              </div>
            </div>
          </div>
        )}

        {/* Advice Section */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Conseils reçus
            </h2>
            <div className="space-y-4">
              {advice.length === 0 ? (
                <p className="text-gray-500">Aucun conseil reçu pour le moment.</p>
              ) : (
                advice.map((item) => (
                  <div
                    key={item._id}
                    className={`border rounded-lg p-4 transition-all ${
                      item.status === 'unread'
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-white hover:shadow-md'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          De: {item.conseillerId.prenom} {item.conseillerId.nom}
                        </p>
                        <p className="mt-1 text-sm text-gray-600">{item.message}</p>
                        <p className="mt-2 text-xs text-gray-500">
                          Reçu le: {new Date(item.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      {item.status === 'unread' && (
                        <button
                          onClick={() => handleMarkAsRead(item._id)}
                          className="ml-4 inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Marquer comme lu
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
