import type { APIRoute } from 'astro';
import { getOxxoOrganizations } from './organization';

export const GET: APIRoute = async () => {
    try {
        const organizations = await getOxxoOrganizations();
        return new Response(
          JSON.stringify({ organizations }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      } catch (error: any) {
        return new Response(
          JSON.stringify({ error: error.message || 'Failed to fetch organizations' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
  };