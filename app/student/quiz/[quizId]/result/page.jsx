'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import Link from 'next/link';
import QuizRecommendations from '@/app/components/QuizRecommendations';

export default function QuizResultPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const [quizCategory, setQuizCategory] = useState(null);
  const [quizData, setQuizData] = useState(null);

  const score = parseFloat(searchParams.get('score') || 0);
  const totalQuestions = parseInt(searchParams.get('total') || 0);
  const correctAnswers = parseInt(searchParams.get('correct') || 0);
  const quizId = params.quizId;

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Fetch quiz data when component mounts
  useEffect(() => {
    const fetchQuizData = async () => {
      if (quizId) {
        try {
          const response = await fetch(`/api/quizzes/${quizId}`);
          if (response.ok) {
            const data = await response.json();
            console.log('Quiz Data:', data); // Debug log
            setQuizData(data);
            // Use the category field from the quiz data
            setQuizCategory(data.category || data.categorie);
          }
        } catch (error) {
          console.error('Error fetching quiz data:', error);
        }
      }
    };

    fetchQuizData();
  }, [quizId]);

  // Debug log for category
  useEffect(() => {
    console.log('Current Quiz Category:', quizCategory);
  }, [quizCategory]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-semibold">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Quiz Results Section */}
          <div className="lg:col-span-4">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  Résultats du Quiz
                </h1>
                
                {quizData && (
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold text-primary-600">
                      {quizData.title}
                    </h2>
                    <p className="text-sm text-gray-600">
                      Catégorie: {quizCategory}
                    </p>
                  </div>
                )}

                <div className="mb-8 text-center">
                  <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full ${
                    score >= 70 ? 'bg-green-100' : score >= 50 ? 'bg-yellow-100' : 'bg-red-100'
                  }`}>
                    <span className={`text-3xl font-bold ${
                      score >= 70 ? 'text-green-600' : score >= 50 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {score.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 mb-6 shadow-sm">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary-600">
                        {correctAnswers}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Réponses correctes
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary-600">
                        {totalQuestions}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Questions totales
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`text-center p-4 rounded-lg mb-6 ${
                  score >= 70 
                    ? 'bg-green-50 text-green-800' 
                    : score >= 50 
                    ? 'bg-yellow-50 text-yellow-800'
                    : 'bg-red-50 text-red-800'
                }`}>
                  {score >= 70 ? (
                    <>
                      <h3 className="font-semibold mb-1">Excellent travail !</h3>
                      <p>Vous avez très bien réussi ce quiz.</p>
                    </>
                  ) : score >= 50 ? (
                    <>
                      <h3 className="font-semibold mb-1">Bon effort !</h3>
                      <p>Il y a encore de la place pour l'amélioration.</p>
                    </>
                  ) : (
                    <>
                      <h3 className="font-semibold mb-1">Continuez à pratiquer</h3>
                      <p>N'hésitez pas à revoir les sujets couverts.</p>
                    </>
                  )}
                </div>

                <div className="flex space-x-4">
                  <Link
                    href="/student/quiz"
                    className="flex-1 text-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Retour aux quiz
                  </Link>
                  <Link
                    href={`/student/quiz/${quizId}`}
                    className="flex-1 text-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                  >
                    Recommencer
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations Section */}
          <div className="lg:col-span-4">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-6">
                {quizCategory ? (
                  <QuizRecommendations
                    score={score}
                    quizId={quizId}
                    specialite={quizCategory}
                  />
                ) : (
                  <div className="text-center text-gray-600">
                    Chargement des recommandations...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
