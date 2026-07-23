import { NextResponse } from 'next/server';
import { getServerEnv } from '@/lib/env';
import { runDailyAnalysisForAllChannels } from '@/application/services/dailyAnalysisService';

// Vercel Cronは常にGETでこのルートを呼び出し、CRON_SECRETをAuthorizationヘッダに
// 自動で付与する(https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs)。
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const expected = `Bearer ${getServerEnv().CRON_SECRET}`;

  if (authHeader !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const summary = await runDailyAnalysisForAllChannels();
  return NextResponse.json(summary);
}
