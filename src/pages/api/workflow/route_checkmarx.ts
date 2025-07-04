import type { APIRoute } from 'astro';
import { setWorkflow } from './checkmarx';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    console.log("Fetching data from GitHub Action");
    const response = await setWorkflow(body);

    return new Response(
      JSON.stringify({ message: 'Already execute workflow!!!' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to fetch repositories' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}