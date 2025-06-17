import type { APIRoute } from 'astro';

type Option = { id: string; label: string };

export const get: APIRoute = async () => {
  const options: Option[] = [
    { id: '1', label: 'Opción 1' },
    { id: '2', label: 'Opción 2' },
    { id: '3', label: 'Opción 3' }
  ];
  
  return new Response(JSON.stringify(options), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
};
