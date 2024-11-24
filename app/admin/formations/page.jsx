'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

const niveauOptions = [
  'bac',
  'bac+1',
  'bac+2',
  'bac+3',
  'bac+4',
  'bac+5',
  'bac+6',
  '>bac+6',
];

const specialiteOptions = [
  'Informatique',
  'Finance',
  'Comptabilité',
  'Marketing',
  'Management',
  'Commerce International',
  'Ressources Humaines',
  'Droit',
  'Médecine',
  'Pharmacie',
  'Architecture',
  'Design',
  'Communication',
  'Journalisme',
  'Sciences Politiques',
  'Génie Civil',
  'Génie Mécanique',
  'Génie Électrique',
  'Agronomie',
  'Biologie',
  'Chimie',
  'Physique',
  'Mathématiques',
  'Langues',
  'Tourisme',
  'Hôtellerie',
  'Arts',
  'Musique',
  'Théâtre',
  'Cinéma',
];

export default function FormationsManagement() {
  const [formations, setFormations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingFormation, setEditingFormation] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    specialite: '',
    niveauMinRequis: '',
  });
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (session?.user?.role !== 'admin') {
      router.push('/');
      return;
    }
    fetchFormations();
  }, [session, router]);

  useEffect(() => {
    const modal = searchParams.get('modal');
    if (modal === 'add') {
      setShowModal(true);
    }
  }, [searchParams]);

  const fetchFormations = async () => {
    try {
      const response = await fetch('/api/formations');
      const data = await response.json();
      setFormations(data);
    } catch (error) {
      console.error('Error fetching formations:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = editingFormation ? 'PUT' : 'POST';
      const submitData = editingFormation 
        ? { ...formData, _id: editingFormation._id }
        : formData;

      const response = await fetch('/api/formations', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        setShowModal(false);
        setFormData({ nom: '', specialite: '', niveauMinRequis: '' });
        setEditingFormation(null);
        fetchFormations();
      } else {
        const error = await response.json();
        alert(error.error);
      }
    } catch (error) {
      console.error('Error saving formation:', error);
      alert('Failed to save formation');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette formation ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/formations?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchFormations();
      } else {
        const error = await response.json();
        alert(error.error);
      }
    } catch (error) {
      console.error('Error deleting formation:', error);
      alert('Failed to delete formation');
    }
  };

  const handleEdit = (formation) => {
    setEditingFormation(formation);
    setFormData({
      nom: formation.nom,
      specialite: formation.specialite,
      niveauMinRequis: formation.niveauMinRequis,
    });
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="p-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black">Gestion des Formations</h1>
        <button
          onClick={() => {
            setEditingFormation(null);
            setFormData({ nom: '', specialite: '', niveauMinRequis: '' });
            setShowModal(true);
          }}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Ajouter Formation
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spécialité</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Niveau Requis</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {formations.map((formation) => (
              <tr key={formation._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-black">{formation.nom}</td>
                <td className="px-6 py-4 whitespace-nowrap text-black">{formation.specialite}</td>
                <td className="px-6 py-4 whitespace-nowrap text-black">{formation.niveauMinRequis}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleEdit(formation)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(formation._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-black">
                {editingFormation ? 'Modifier Formation' : 'Ajouter Formation'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingFormation(null);
                  setFormData({ nom: '', specialite: '', niveauMinRequis: '' });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input
                  type="text"
                  name="nom"
                  required
                  value={formData.nom}
                  onChange={handleInputChange}
                  className="w-full text-black px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Spécialité</label>
                <select
                  name="specialite"
                  required
                  value={formData.specialite}
                  onChange={handleInputChange}
                  className="w-full text-black px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner une spécialité</option>
                  {specialiteOptions.map((specialite) => (
                    <option key={specialite} value={specialite}>
                      {specialite}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Niveau Minimum Requis</label>
                <select
                  name="niveauMinRequis"
                  required
                  value={formData.niveauMinRequis}
                  onChange={handleInputChange}
                  className="w-full text-black px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner un niveau</option>
                  {niveauOptions.map((niveau) => (
                    <option key={niveau} value={niveau}>
                      {niveau.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingFormation(null);
                    setFormData({ nom: '', specialite: '', niveauMinRequis: '' });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingFormation ? 'Mettre à jour' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
