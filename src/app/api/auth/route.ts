import { NextResponse } from 'next/server';

export async function GET() {
  const client_id = process.env.OAUTH_CLIENT_ID;
  
  if (!client_id) {
    return NextResponse.json({ error: 'Missing OAUTH_CLIENT_ID' }, { status: 500 });
  }

  // Redirect to GitHub's OAuth login page
  const url = `https://github.com/login/oauth/authorize?client_id=${client_id}&scope=repo,user`;
  
  return NextResponse.redirect(url);
}
