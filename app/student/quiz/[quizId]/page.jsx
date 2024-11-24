'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function QuizPage({ params }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await fetch(`/api/quizzes/${params.quizId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch quiz');
        }
        const quizData = await response.json();
        setQuiz(quizData);
        setTimeLeft(quizData.duration * 60); // Convert minutes to seconds
        setStartTime(Date.now());
      } catch (error) {
        console.error('Error fetching quiz:', error);
        setError('Erreur lors du chargement du quiz');
      }
    };

    if (status === 'authenticated') {
      fetchQuiz();
    }
  }, [status, params.quizId]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleAnswer = (optionIndex) => {
    setAnswers([
      ...answers.slice(0, currentQuestion),
      { questionIndex: currentQuestion, selectedOption: optionIndex },
      ...answers.slice(currentQuestion + 1),
    ]);
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      const response = await fetch('/api/quizzes/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quizId: params.quizId,
          answers: answers.map(answer => ({
            questionIndex: answer.questionIndex,
            selectedOption: answer.selectedOption
          })),
          timeSpent,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit quiz');
      }

      const result = await response.json();
      router.push(`/student/quiz/${params.quizId}/result?score=${result.score}&total=${quiz.questions.length}&correct=${result.correctAnswers}`);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      setError('Erreur lors de la soumission du quiz');
      setSubmitting(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600 text-xl">{error}</div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-semibold">Chargement...</div>
      </div>
    );
  }

  const currentQuestionData = quiz.questions[currentQuestion];
  const currentAnswer = answers.find(a => a.questionIndex === currentQuestion);

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Quiz Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
              <div className="text-lg font-medium text-gray-900">
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </div>
            </div>
            <div className="mt-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Question {currentQuestion + 1} sur {quiz.questions.length}</span>
                <span>{answers.length} réponses sur {quiz.questions.length}</span>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Question */}
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {currentQuestionData.question}
            </h2>
            <div className="space-y-3">
              {currentQuestionData.options.map((option, index) => (
                <button
                  key={index}
                  className={`w-full text-black text-left p-4 rounded-lg border ${
                    currentAnswer?.selectedOption === index
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300'
                  } transition-colors duration-200`}
                  onClick={() => handleAnswer(index)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
            <button
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                currentQuestion === 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:text-gray-500'
              }`}
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              Question précédente
            </button>
            {currentQuestion === quiz.questions.length - 1 ? (
              <button
                className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                  submitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700'
                } transition-colors duration-200`}
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? 'Envoi...' : 'Terminer le quiz'}
              </button>
            ) : (
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors duration-200"
                onClick={handleNext}
              >
                Question suivante
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
