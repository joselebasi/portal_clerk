import type { APIRoute } from 'astro';
import { getOrganizationRepos } from './repositories_bo';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { organization } = body;
    console.log(body);

    if (!organization) {
      return new Response(
        JSON.stringify({ error: 'Organization name is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const repositories = await getOrganizationRepos(organization);

    return new Response(
      JSON.stringify({ repositories }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to fetch repositories' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}