'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

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

export default function UniversitiesManagement() {
  const [universities, setUniversities] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUniversity, setEditingUniversity] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    specialite: [],
  });
  const [selectedSpecialites, setSelectedSpecialites] = useState([]);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.user?.role !== 'admin') {
      router.push('/');
      return;
    }
    fetchUniversities();
  }, [session, router]);

  const fetchUniversities = async () => {
    try {
      const response = await fetch('/api/universities');
      const data = await response.json();
      setUniversities(data);
    } catch (error) {
      console.error('Error fetching universities:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = editingUniversity ? 'PUT' : 'POST';
      const submitData = {
        ...formData,
        specialite: selectedSpecialites,
      };

      if (editingUniversity) {
        submitData._id = editingUniversity._id;
      }

      const response = await fetch('/api/universities', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        setShowModal(false);
        setFormData({ nom: '', specialite: [] });
        setSelectedSpecialites([]);
        setEditingUniversity(null);
        fetchUniversities();
      } else {
        const error = await response.json();
        alert(error.error);
      }
    } catch (error) {
      console.error('Error saving university:', error);
      alert('Failed to save university');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette université ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/universities?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchUniversities();
      } else {
        const error = await response.json();
        alert(error.error);
      }
    } catch (error) {
      console.error('Error deleting university:', error);
      alert('Failed to delete university');
    }
  };

  const handleEdit = (university) => {
    setEditingUniversity(university);
    setFormData({
      nom: university.nom,
      specialite: university.specialite,
    });
    setSelectedSpecialites(university.specialite);
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSpecialiteChange = (specialite) => {
    setSelectedSpecialites(prev => {
      if (prev.includes(specialite)) {
        return prev.filter(s => s !== specialite);
      } else {
        return [...prev, specialite];
      }
    });
  };

  return (
    <div className="p-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black">Gestion des Universités</h1>
        <button
          onClick={() => {
            setEditingUniversity(null);
            setFormData({ nom: '', specialite: [] });
            setSelectedSpecialites([]);
            setShowModal(true);
          }}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Ajouter Université
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spécialités</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {universities.map((university) => (
              <tr key={university._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-black">{university.nom}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    {university.specialite.map((spec, index) => (
                      <span
                        key={index}
                        className="inline-block bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleEdit(university)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(university._id)}
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
                {editingUniversity ? 'Modifier Université' : 'Ajouter Université'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingUniversity(null);
                  setFormData({ nom: '', specialite: [] });
                  setSelectedSpecialites([]);
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Spécialités</label>
                <div className="mt-2 max-h-60 overflow-y-auto border border-gray-300 rounded-md p-2">
                  {specialiteOptions.map((specialite) => (
                    <div key={specialite} className="flex items-center p-2 hover:bg-gray-50">
                      <input
                        type="checkbox"
                        id={specialite}
                        checked={selectedSpecialites.includes(specialite)}
                        onChange={() => handleSpecialiteChange(specialite)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={specialite} className="ml-2 text-sm text-gray-900">
                        {specialite}
                      </label>
                    </div>
                  ))}
                </div>
                {selectedSpecialites.length === 0 && (
                  <p className="mt-1 text-sm text-red-500">Sélectionnez au moins une spécialité</p>
                )}
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingUniversity(null);
                    setFormData({ nom: '', specialite: [] });
                    setSelectedSpecialites([]);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={selectedSpecialites.length === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingUniversity ? 'Mettre à jour' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
