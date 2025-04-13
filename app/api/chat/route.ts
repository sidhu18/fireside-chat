import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { message } = await req.json();

  // Mock reply — you can replace this with OpenAI
  return NextResponse.json({
    reply: `You said: "${message}"`,
  });
}
