'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function ConseillerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [adviceMessage, setAdviceMessage] = useState('');
  const [advice, setAdvice] = useState([]);
  const [showAdviceModal, setShowAdviceModal] = useState(false);
  const [sending, setSending] = useState(false);

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
        
        if (userData.role !== 'conseiller') {
          router.push('/login');
          return;
        }
        
        setUserData(userData);

        // Fetch students
        const studentsResponse = await fetch('/api/users?role=student');
        const studentsData = await studentsResponse.json();
        setStudents(studentsData);

        // Fetch advice
        const adviceResponse = await fetch('/api/advice');
        const adviceData = await adviceResponse.json();
        setAdvice(adviceData);
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

  const handleSendAdvice = async () => {
    if (!selectedStudent || !adviceMessage.trim()) return;

    setSending(true);
    try {
      const response = await fetch('/api/advice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: selectedStudent._id,
          message: adviceMessage,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi du conseil');
      }

      const newAdvice = await response.json();
      setAdvice([newAdvice, ...advice]);
      setAdviceMessage('');
      setShowAdviceModal(false);
      setSelectedStudent(null);
    } catch (error) {
      console.error('Error sending advice:', error);
    } finally {
      setSending(false);
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
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Bienvenue, {userData?.prenom} {userData?.nom}
          </h1>
          <p className="mt-1 text-gray-600">
            Spécialité: {userData?.specialite}
          </p>
        </div>

        {/* Students List */}
        <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Liste des étudiants
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nom complet
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Niveau
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Centres d'intérêt
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {student.prenom} {student.nom}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{student.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{student.niveau}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {student.interet.map((interet, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {interet}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        className="text-blue-600 hover:text-blue-900"
                        onClick={() => {
                          setSelectedStudent(student);
                          setShowAdviceModal(true);
                        }}
                      >
                        Envoyer un conseil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Advice History */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Historique des conseils
            </h2>
            <div className="space-y-4">
              {advice.map((item) => (
                <div
                  key={item._id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      {item.studentId?.prenom && item.studentId?.nom ?
                      <p className="text-sm font-medium text-gray-900">
                        À: {item.studentId?.prenom} {item.studentId?.nom}
                      </p> :
                      <p className="text-sm font-medium text-red-500">
                        Etudiant Supprimé
                      </p> 
                      }
                      <p className="mt-1 text-sm text-gray-600">{item.message}</p>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.status === 'read'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {item.status === 'read' ? 'Lu' : 'Non lu'}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Envoyé le: {new Date(item.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Advice Modal */}
      {showAdviceModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Envoyer un conseil à {selectedStudent?.prenom} {selectedStudent?.nom}
            </h3>
            <textarea
              className="w-full text-black h-32 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Écrivez votre conseil ici..."
              value={adviceMessage}
              onChange={(e) => setAdviceMessage(e.target.value)}
            />
            <div className="mt-4 flex justify-end space-x-3">
              <button
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
                onClick={() => {
                  setShowAdviceModal(false);
                  setSelectedStudent(null);
                  setAdviceMessage('');
                }}
              >
                Annuler
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                  sending
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
                onClick={handleSendAdvice}
                disabled={sending || !adviceMessage.trim()}
              >
                {sending ? 'Envoi...' : 'Envoyer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
