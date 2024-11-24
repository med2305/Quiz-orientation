'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function StudentQuizzes() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await fetch('/api/quizzes');
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des quiz');
        }
        const data = await response.json();
        console.log('Fetched quizzes:', data); // Debug log
        setQuizzes(data.quizzes || data);
      } catch (error) {
        console.error('Error fetching quizzes:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchQuizzes();
    }
  }, [status]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-semibold">Chargement...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Quiz disponibles</h1>
          <div className="text-sm text-gray-500">
            {quizzes.length} quiz{quizzes.length !== 1 ? 's' : ''} disponible{quizzes.length !== 1 ? 's' : ''}
          </div>
        </div>
        
        {quizzes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <div
                key={quiz._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {quiz.title}
                    </h2>
                    <div className="flex flex-col items-end">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-primary-100 text-primary-800">
                        {quiz.category}
                      </span>
                      {quiz.completed && (
                        <span className="mt-2 px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Complété-{quiz.score.toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {quiz.description}
                  </p>
                  
                  <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
                    <div className="flex items-center space-x-2">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {quiz.duration} minutes
                    </div>
                    <div className="flex items-center space-x-2">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Niveau: {quiz.niveau}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => router.push(`/student/quiz/${quiz._id}`)}
                    className={`w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 ${
                      quiz.completed 
                        ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white'
                        : 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 text-white'
                    }`}
                  >
                    {quiz.completed ? 'Recommencer le quiz' : 'Commencer le quiz'}
                  </button>
                  
                  {quiz.completed && (
                    <div className="text-center text-sm text-gray-500 mt-2">
                      Dernier essai le {new Date(quiz.completedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Aucun quiz disponible
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Les quiz seront disponibles prochainement.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
