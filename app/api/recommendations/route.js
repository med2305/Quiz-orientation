import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Formation from '@/app/models/Formation';
import Quiz from '@/app/models/Quiz';
import University from '@/app/models/University';

const SCORE_THRESHOLD = 50;

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const quizId = searchParams.get('quizId');
    const score = parseFloat(searchParams.get('score'));
    const specialite = searchParams.get('specialite');

    if (!quizId || score === undefined || !specialite) {
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Get the quiz details
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return NextResponse.json(
        { error: 'Quiz non trouvé' },
        { status: 404 }
      );
    }

    let formationQuery = {};
    let universityQuery = {};

    // If score is 50% or higher, filter by specialite
    if (score >= SCORE_THRESHOLD) {
      formationQuery = {
        $or: [
          // Exact match (case-insensitive)
          { specialite: { $regex: new RegExp(`^${specialite}$`, 'i') } },
          // Match in specialites array if it exists
          { specialites: { $regex: new RegExp(`^${specialite}$`, 'i') } }
        ]
      };

      universityQuery = {
        $or: [
          // Exact match (case-insensitive)
          { specialite: { $regex: new RegExp(`^${specialite}$`, 'i') } },
          // Match in specialites array
          { specialites: { $regex: new RegExp(`^${specialite}$`, 'i') } }
        ]
      };
    }

    // Find formations matching the specialite
    const formations = await Formation.find(formationQuery)
      .sort({ name: 1 })
      .limit(6);

    // Calculate match scores for formations
    const formationsWithScores = formations.map(formation => {
      let matchScore = score;

      // Higher bonus for exact specialite match
      if (formation.specialite && typeof formation.specialite === 'string' && 
          formation.specialite.toLowerCase() === specialite.toLowerCase()) {
        matchScore += 20;
      }
      // Bonus for specialite in array
      else if (formation.specialites && Array.isArray(formation.specialites) && 
               formation.specialites.some(s => 
                 typeof s === 'string' && s.toLowerCase() === specialite.toLowerCase()
               )) {
        matchScore += 15;
      }

      return {
        ...formation.toObject(),
        matchScore: Math.min(Math.round(matchScore), 100)
      };
    });

    // Sort formations by match score
    const sortedFormations = formationsWithScores.sort((a, b) => b.matchScore - a.matchScore);

    // Find universities with matching specialite
    const universities = await University.find(universityQuery);
    console.log("universities", universities);

    // Calculate match scores for universities
    const universitiesWithScores = universities.map(uni => {
      let matchScore = score;
      console.log("uni", uni);

      // Higher bonus for exact specialite match
      if (uni.specialite && typeof uni.specialite === 'string' && 
          uni.specialite.toLowerCase() === specialite.toLowerCase()) {
        matchScore += 20;
      }
      // Bonus for specialite in array
      else if (uni.specialites && Array.isArray(uni.specialites) && 
               uni.specialites.some(s => 
                 typeof s === 'string' && s.toLowerCase() === specialite.toLowerCase()
               )) {
        matchScore += 15;
      }
      console.log("matchScore", matchScore);
      
      return {
        _id: uni._id,
        name: uni.nom,
        location: uni.location,
        specialites: Array.isArray(uni.specialites) ? uni.specialites : [],
        matchScore: Math.min(Math.round(matchScore), 100)
      };
    });

    // Sort universities by match score
    const sortedUniversities = universitiesWithScores
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5); // Limit to top 5 universities

    return NextResponse.json({
      formations: sortedFormations,
      universities: sortedUniversities,
      isSpecialized: score >= SCORE_THRESHOLD,
      message: score >= SCORE_THRESHOLD 
        ? `Recommandations pour ${specialite}`
        : 'Recommandations générales'
    });

  } catch (error) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération des recommandations' },
      { status: 500 }
    );
  }
}
