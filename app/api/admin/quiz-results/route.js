import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import CompletedQuiz from '@/app/models/CompletedQuiz';
import User from '@/app/models/User';
import Quiz from '@/app/models/Quiz';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await dbConnect();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const quizId = searchParams.get('quizId');
    const userId = searchParams.get('userId');
    const sortBy = searchParams.get('sortBy') || 'completedAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const niveau = searchParams.get('niveau');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const minScore = searchParams.get('minScore');
    const maxScore = searchParams.get('maxScore');

    // Build query
    const query = {};
    if (quizId) query.quizId = quizId;
    if (userId) query.userId = userId;
    if (niveau) {
      const userIds = await User.find({ niveau }).distinct('_id');
      query.userId = { $in: userIds };
    }
    if (dateFrom || dateTo) {
      query.completedAt = {};
      if (dateFrom) query.completedAt.$gte = new Date(dateFrom);
      if (dateTo) query.completedAt.$lte = new Date(dateTo);
    }
    if (minScore || maxScore) {
      query.score = {};
      if (minScore) query.score.$gte = parseFloat(minScore);
      if (maxScore) query.score.$lte = parseFloat(maxScore);
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Get total count for pagination
    const total = await CompletedQuiz.countDocuments(query);

    // Fetch results with pagination and populate user and quiz details
    const results = await CompletedQuiz.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'userId',
        model: User,
        select: 'nom email niveau'
      })
      .populate({
        path: 'quizId',
        model: Quiz,
        select: 'title description niveau'
      })
      .lean();

    // Calculate detailed statistics
    const stats = await CompletedQuiz.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          averageScore: { $avg: '$score' },
          highestScore: { $max: '$score' },
          lowestScore: { $min: '$score' },
          totalAttempts: { $sum: 1 },
          averageTimeSpent: { $avg: '$timeSpent' },
          scoreDistribution: {
            $push: '$score'
          }
        }
      },
      {
        $project: {
          _id: 0,
          averageScore: 1,
          highestScore: 1,
          lowestScore: 1,
          totalAttempts: 1,
          averageTimeSpent: 1,
          scoreRanges: {
            excellent: {
              $size: {
                $filter: {
                  input: '$scoreDistribution',
                  as: 'score',
                  cond: { $gte: ['$$score', 80] }
                }
              }
            },
            good: {
              $size: {
                $filter: {
                  input: '$scoreDistribution',
                  as: 'score',
                  cond: { 
                    $and: [
                      { $gte: ['$$score', 60] },
                      { $lt: ['$$score', 80] }
                    ]
                  }
                }
              }
            },
            needsImprovement: {
              $size: {
                $filter: {
                  input: '$scoreDistribution',
                  as: 'score',
                  cond: { $lt: ['$$score', 60] }
                }
              }
            }
          }
        }
      }
    ]);

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
      stats: stats[0] || {
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        totalAttempts: 0,
        averageTimeSpent: 0,
        scoreRanges: {
          excellent: 0,
          good: 0,
          needsImprovement: 0
        }
      }
    });
  } catch (error) {
    console.error('Error fetching quiz results:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des résultats' },
      { status: 500 }
    );
  }
}
