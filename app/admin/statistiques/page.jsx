'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function StatistiquesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [timeRangeFilter, setTimeRangeFilter] = useState('week'); // week, month, year

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/');
      return;
    }

    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/admin/statistics?timeRange=${timeRangeFilter}`);
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des statistiques');
        }
        const data = await response.json();
        setStats(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching statistics:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    if (status === 'authenticated' && session?.user?.role === 'admin') {
      fetchStats();
    }
  }, [status, session, router, timeRangeFilter]);

  if (loading) {
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

  const scoreDistributionData = {
    labels: ['Excellent (≥80%)', 'Bien (60-79%)', 'À améliorer (<60%)'],
    datasets: [
      {
        data: [
          stats?.scoreDistribution?.excellent || 0,
          stats?.scoreDistribution?.good || 0,
          stats?.scoreDistribution?.needsImprovement || 0
        ],
        backgroundColor: ['#34D399', '#FBBF24', '#EF4444'],
        borderColor: ['#059669', '#D97706', '#DC2626'],
        borderWidth: 1
      }
    ]
  };

  const quizCompletionData = {
    labels: stats?.quizCompletion?.map(item => item.date) || [],
    datasets: [
      {
        label: 'Quiz complétés',
        data: stats?.quizCompletion?.map(item => item.count) || [],
        fill: false,
        borderColor: '#6366F1',
        tension: 0.1
      }
    ]
  };

  const averageScoresByNiveauData = {
    labels: stats?.averageScoresByNiveau?.map(item => item.niveau) || [],
    datasets: [
      {
        label: 'Score moyen par niveau',
        data: stats?.averageScoresByNiveau?.map(item => item.averageScore) || [],
        backgroundColor: '#8B5CF6',
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Tableau de Bord Statistiques
            </h1>
            <select
              value={timeRangeFilter}
              onChange={(e) => setTimeRangeFilter(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
              <option value="year">Cette année</option>
            </select>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500">Score moyen</h3>
              <p className="mt-2 text-3xl font-semibold text-indigo-600">
                {stats?.overview?.averageScore?.toFixed(1)}%
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500">Quiz complétés</h3>
              <p className="mt-2 text-3xl font-semibold text-green-600">
                {stats?.overview?.totalQuizzes}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500">Utilisateurs actifs</h3>
              <p className="mt-2 text-3xl font-semibold text-blue-600">
                {stats?.overview?.activeUsers || 0}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500">Taux de réussite</h3>
              <p className="mt-2 text-3xl font-semibold text-purple-600">
                {stats?.overview?.successRate?.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Distribution des scores</h3>
              <div className="h-64">
                <Pie data={scoreDistributionData} options={{ maintainAspectRatio: false }} />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quiz complétés</h3>
              <div className="h-64">
                <Line data={quizCompletionData} options={{ maintainAspectRatio: false }} />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 lg:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Score moyen par niveau</h3>
              <div className="h-64">
                <Bar data={averageScoresByNiveauData} options={{ maintainAspectRatio: false }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
