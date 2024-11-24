import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    // Get these values from your Power BI workspace
    const powerBIConfig = {
      reportId: process.env.POWERBI_REPORT_ID,
      embedUrl: process.env.POWERBI_EMBED_URL,
      accessToken: process.env.POWERBI_ACCESS_TOKEN
    };

    return NextResponse.json(powerBIConfig);
  } catch (error) {
    console.error('Error getting Power BI config:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la configuration Power BI' },
      { status: 500 }
    );
  }
}
