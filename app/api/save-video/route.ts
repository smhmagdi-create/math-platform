import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { branch_id, video_id, title, duration } = body;

    // مؤقتاً: هنطبع البيانات في الكونسول
    console.log('Saving video:', { branch_id, video_id, title, duration });

    // هنا هنضيف الكود بتاع Google Sheets أو Supabase بعد كده
    
    return NextResponse.json({ 
      success: true,
      message: 'Video saved successfully'
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to save video'
      },
      { status: 500 }
    );
  }
}