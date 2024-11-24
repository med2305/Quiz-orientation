'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '../components/AdminDashboard/DashboardLayout';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const [powerBIConfig, setPowerBIConfig] = useState({
    reportId: '',
    accessToken: '',
  });
  const [stats, setStats] = useState({
    students: { total: 0, growth: 0 },
    counselors: { total: 0, active: 0 },
    formations: { total: 0, available: 0 },
    universities: { total: 0, partners: 0 }
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleAddFormation = () => {
    router.push('/admin/formations?modal=add');
  };

  const handleAddUser = () => {
    router.push('/admin/users?modal=add');
  };

  const handleViewStats = () => {
    router.push('/admin/statistiques');
  };

  const handleViewProfile = () => {
    router.push('/profile');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsResponse = await fetch('/api/admin/stats');

        const statsData = await statsResponse.json();

        setPowerBIConfig({
          reportId: process.env.NEXT_PUBLIC_POWERBI_REPORT_ID,
        });

        setStats(statsData.stats);
        setRecentActivity(statsData.recentActivity);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-xl font-semibold text-gray-600">Chargement...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 animate-fade-in">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Bienvenue dans votre tableau de bord</h2>
          <p className="text-gray-600">Gérez votre plateforme d'orientation et suivez les statistiques en temps réel.</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Étudiants</h3>
              <svg className="h-8 w-8 opacity-75" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold">{stats.students.total}</p>
            <p className="text-primary-100 text-sm mt-2">{stats.students.growth > 0 ? '+' : ''}{stats.students.growth}% ce mois</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Conseillers</h3>
              <svg className="h-8 w-8 opacity-75" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold">{stats.counselors.total}</p>
            <p className="text-green-100 text-sm mt-2">{stats.counselors.active} Actifs</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Formations</h3>
              <svg className="h-8 w-8 opacity-75" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <p className="text-3xl font-bold">{stats.formations.total}</p>
            <p className="text-purple-100 text-sm mt-2">{stats.formations.available} Disponibles</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Universités</h3>
              <svg className="h-8 w-8 opacity-75" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <p className="text-3xl font-bold">{stats.universities.total}</p>
            <p className="text-orange-100 text-sm mt-2">{stats.universities.partners} Partenaires</p>
          </div>
        </div>

        {/* Recent Activity and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 transform hover:shadow-md transition-all duration-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Activité Récente</h3>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className={`w-2 h-2 bg-${activity.color}-500 rounded-full`}></div>
                  <div>
                    <p className="text-sm text-gray-600">{activity.message}</p>
                    <p className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true, locale: fr })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 transform hover:shadow-md transition-all duration-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Actions Rapides</h3>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={handleAddFormation}
                className="p-4 bg-primary-50 rounded-lg text-primary-600 hover:bg-primary-100 transition-colors duration-200"
              >
                <svg className="h-6 w-6 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Ajouter Formation
              </button>
              <button 
                onClick={handleAddUser}
                className="p-4 bg-purple-50 rounded-lg text-purple-600 hover:bg-purple-100 transition-colors duration-200"
              >
                <svg className="h-6 w-6 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Ajouter Utilisateur
              </button>
              <button 
                onClick={handleViewStats}
                className="p-4 bg-green-50 rounded-lg text-green-600 hover:bg-green-100 transition-colors duration-200"
              >
                <svg className="h-6 w-6 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Voir Statistiques
              </button>
              <button 
                onClick={handleViewProfile}
                className="p-4 bg-orange-50 rounded-lg text-orange-600 hover:bg-orange-100 transition-colors duration-200"
              >
                <svg className="h-6 w-6 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Paramètres
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
