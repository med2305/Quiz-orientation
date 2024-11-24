'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const categoryOptions = [
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

export default function CreateQuiz() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    niveau: '',
    duration: 30,
    questions: [
      {
        question: '',
        options: ['', '', '', ''],
        correctOption: 0,
      },
    ],
  });

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...formData.questions];
    if (field === 'options') {
      const [optionIndex, optionValue] = value;
      newQuestions[index].options[optionIndex] = optionValue;
    } else if (field === 'correctOption') {
      newQuestions[index].correctOption = value;
    } else {
      newQuestions[index][field] = value;
    }
    setFormData({ ...formData, questions: newQuestions });
  };

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        {
          question: '',
          options: ['', '', '', ''],
          correctOption: 0,
        },
      ],
    });
  };

  const removeQuestion = (index) => {
    const newQuestions = formData.questions.filter((_, i) => i !== index);
    setFormData({ ...formData, questions: newQuestions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/quizzes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/admin');
      } else {
        const error = await response.json();
        alert('Erreur lors de la création du quiz: ' + error.message);
      }
    } catch (error) {
      console.error('Error creating quiz:', error);
      alert('Erreur lors de la création du quiz');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Créer un nouveau quiz
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Quiz Details */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Titre
                </label>
                <input
                  type="text"
                  required
                  placeholder="Entrez votre titre"
                  className="mt-1 text-black block w-full rounded-md border-gray-900 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Catégorie
                </label>
                <select
                  required
                  className="mt-1 text-black block w-full rounded-md border-gray-900 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Niveau
                </label>
                <select
                  required
                  className="mt-1 text-black block w-full rounded-md border-gray-900 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  value={formData.niveau}
                  onChange={(e) =>
                    setFormData({ ...formData, niveau: e.target.value })
                  }
                >
                  <option value="">Sélectionner un niveau</option>
                  <option value="bac">Bac</option>
                  <option value="bac+1">Bac+1</option>
                  <option value="bac+2">Bac+2</option>
                  <option value="bac+3">Bac+3</option>
                  <option value="bac+4">Bac+4</option>
                  <option value="bac+5">Bac+5</option>
                  <option value="bac+6">Bac+6</option>
                  <option value=">bac+6">&gt;Bac+6</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Durée (minutes)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  className="mt-1 text-black block w-full rounded-md border-gray-900 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: parseInt(e.target.value) })
                  }
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Entrez votre description"
                  className="mt-1 text-black block w-full rounded-md border-gray-900 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Questions</h2>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Ajouter une question
                </button>
              </div>

              {formData.questions.map((question, questionIndex) => (
                <div
                  key={questionIndex}
                  className="bg-gray-50 p-6 rounded-lg space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-medium text-gray-900">
                      Question {questionIndex + 1}
                    </h3>
                    {formData.questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(questionIndex)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Supprimer
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Question
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Entrez votre question"
                      className="mt-1 text-black block w-full rounded-md border-gray-900 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      value={question.question}
                      onChange={(e) =>
                        handleQuestionChange(
                          questionIndex,
                          'question',
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Options
                    </label>
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center space-x-4">
                        <input
                          type="radio"
                          name={`correct-${questionIndex}`}
                          checked={question.correctOption === optionIndex}
                          onChange={() =>
                            handleQuestionChange(
                              questionIndex,
                              'correctOption',
                              optionIndex
                            )
                          }
                          className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-900"
                        />
                        <input
                          type="text"
                          required
                          placeholder={`Option ${optionIndex + 1}`}
                          className="block text-black w-full rounded-md border-gray-900 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                          value={option}
                          onChange={(e) =>
                            handleQuestionChange(questionIndex, 'options', [
                              optionIndex,
                              e.target.value,
                            ])
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Créer le quiz
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
