import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import CompletedQuiz from '@/app/models/CompletedQuiz';
import User from '@/app/models/User';
import Quiz from '@/app/models/Quiz';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const quizId = searchParams.get('quizId');
    const sortBy = searchParams.get('sortBy') || 'completedAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build query based on user role
    const query = {};
    if (user.role === 'student') {
      query.userId = user._id;
    } else if (user.role === 'counselor') {
      // Counselors can see results of students they manage
      const studentIds = await User.find({ counselorId: user._id }).distinct('_id');
      query.userId = { $in: studentIds };
    }
    
    if (quizId) {
      query.quizId = quizId;
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Get total count for pagination
    const total = await CompletedQuiz.countDocuments(query);

    // Fetch results with pagination and populate references
    const results = await CompletedQuiz.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'userId',
        model: User,
        select: 'name email niveau'
      })
      .populate({
        path: 'quizId',
        model: Quiz,
        select: 'title description niveau'
      })
      .lean();

    // Calculate statistics if admin or counselor
    let stats = null;
    if (user.role === 'admin' || user.role === 'counselor') {
      const statsAgg = await CompletedQuiz.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            averageScore: { $avg: '$score' },
            highestScore: { $max: '$score' },
            lowestScore: { $min: '$score' },
            totalAttempts: { $sum: 1 },
            averageTimeSpent: { $avg: '$timeSpent' }
          }
        }
      ]);
      stats = statsAgg[0] || {
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        totalAttempts: 0,
        averageTimeSpent: 0
      };
    }

    // Format results
    const formattedResults = results.map(result => ({
      _id: result._id,
      user: {
        name: result.userId?.name,
        email: result.userId?.email,
        niveau: result.userId?.niveau
      },
      quiz: {
        title: result.quizId?.title,
        description: result.quizId?.description,
        niveau: result.quizId?.niveau
      },
      score: result.score,
      timeSpent: result.timeSpent,
      completedAt: result.completedAt,
      answers: result.answers
    }));

    return NextResponse.json({
      results: formattedResults,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        perPage: limit
      },
      stats
    });
  } catch (error) {
    console.error('Error fetching quiz results:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des résultats' },
      { status: 500 }
    );
  }
}
