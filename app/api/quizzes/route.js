import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Quiz from '@/app/models/Quiz';
import User from '@/app/models/User';
import CompletedQuiz from '@/app/models/CompletedQuiz';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    await dbConnect();

    // Get user for role check and niveau filtering
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Build query based on user role and niveau
    let query = { active: true };
    if (user.role === 'student') {
      query.niveau = user.niveau;
    }
    
    console.log('Fetching quizzes with query:', query); // Debug log
    
    const quizzes = await Quiz.find(query)
      .select('-questions.correctOption')
      .sort({ createdAt: -1 }); // Sort by newest first

    console.log('Found quizzes:', quizzes.length); // Debug log

    // Transform the data to include completion status for students
    if (user.role === 'student') {
      const quizzesWithStatus = await Promise.all(quizzes.map(async (quiz) => {
        const quizObj = quiz.toObject();
        
        // Check if student has completed this quiz
        const completedQuiz = await CompletedQuiz.findOne({
          userId: user._id,
          quizId: quiz._id
        });
        
        return {
          ...quizObj,
          completed: !!completedQuiz,
          score: completedQuiz ? completedQuiz.score : null,
          timeSpent: completedQuiz ? completedQuiz.timeSpent : null,
          completedAt: completedQuiz ? completedQuiz.completedAt : null
        };
      }));

      // Get overall statistics
      const totalCompleted = await CompletedQuiz.countDocuments({ userId: user._id });
      const totalAvailable = quizzes.length;
      const averageScore = await CompletedQuiz.aggregate([
        { $match: { userId: user._id } },
        { $group: { _id: null, avgScore: { $avg: "$score" } } }
      ]).then(result => result[0]?.avgScore || 0);
      
      return NextResponse.json({
        quizzes: quizzesWithStatus,
        stats: {
          totalCompleted,
          totalAvailable,
          averageScore: Math.round(averageScore * 10) / 10,
          completionRate: Math.round((totalCompleted / totalAvailable) * 100)
        }
      });
    }

    return NextResponse.json(quizzes);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Only admin can create quizzes
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    await dbConnect();

    // Check if user is admin
    const user = await User.findOne({ email: session.user.email });
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const data = await request.json();
    
    // Ensure the quiz is active by default
    data.active = true;
    
    const quiz = await Quiz.create(data);
    console.log('Created new quiz:', quiz._id); // Debug log

    return NextResponse.json(quiz, { status: 201 });
  } catch (error) {
    console.error('Error creating quiz:', error);
    return NextResponse.json({ 
      error: error.message,
      details: error.errors // Include validation errors if any
    }, { status: 400 });
  }
}
