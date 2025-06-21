import type { APIRoute } from 'astro';

type PullRequestInfo = {
  repository: string;
  author: string;
  assignees: string[];
  reviewers: string[];
  link: string;
  title: string;
  description: string;
  source_branch: string;
  target_branch: string;
  days_open: number;
};

const GITHUB_TOKEN = import.meta.env.GITHUB_TOKEN; // Debes definir este token en tus variables de entorno

export const GET: APIRoute = async ({ url }) => {
  const org = url.searchParams.get('org');
  if (!org) {
    return new Response(JSON.stringify({ error: 'Missing org parameter' }), { status: 400 });
  }
  if (!GITHUB_TOKEN) {
    return new Response(JSON.stringify({ error: 'Missing GitHub token' }), { status: 500 });
  }

  console.log(`Fetching pull requests for organization: ${org}`);

  // 1. Obtener todos los repositorios de la organización (iterando todas las páginas en paralelo)
  let repos: any[] = [];
  let page = 1;
  let hasMore = true;
  let allRepos: any[] = [];

  // Primero, obtenemos la primera página para saber cuántos repos hay
  const firstReposRes = await fetch(`https://api.github.com/orgs/${org}/repos?per_page=100&page=1`, {
    headers: { Authorization: `Bearer ${GITHUB_TOKEN}` }
  });
  if (!firstReposRes.ok) {
    return new Response(JSON.stringify({ error: 'Failed to fetch repositories' }), { status: 500 });
  }
  const firstPageRepos = await firstReposRes.json();
  allRepos = allRepos.concat(firstPageRepos);

  // Si hay más de 100 repos, obtenemos el total de páginas y lanzamos las peticiones en paralelo
  if (firstPageRepos.length === 100) {
    // Obtener el total de repositorios desde los headers
    const linkHeader = firstReposRes.headers.get('link');
    let totalPages = 1;
    if (linkHeader) {
      const match = linkHeader.match(/&page=(\d+)>; rel="last"/);
      if (match) {
        totalPages = parseInt(match[1], 10);
      }
    } else {
      // Si no hay header, asumimos que hay solo 1 página
      totalPages = 1;
    }

    // Lanzar peticiones en paralelo para las páginas restantes
    const repoFetches = [];
    for (let i = 2; i <= totalPages; i++) {
      repoFetches.push(
        fetch(`https://api.github.com/orgs/${org}/repos?per_page=100&page=${i}`, {
          headers: { Authorization: `Bearer ${GITHUB_TOKEN}` }
        }).then(res => res.ok ? res.json() : [])
      );
    }
    const pages = await Promise.all(repoFetches);
    for (const pageRepos of pages) {
      allRepos = allRepos.concat(pageRepos);
    }
  }

  repos = allRepos;

  let pullRequests: PullRequestInfo[] = [];

  // 2. Para cada repo, obtener los PRs abiertos en paralelo
  const prFetches = repos.map(repo =>
    fetch(
      `https://api.github.com/repos/${org}/${repo.name}/pulls?state=open&per_page=100`,
      { headers: { Authorization: `Bearer ${GITHUB_TOKEN}` } }
    )
      .then(res => res.ok ? res.json() : [])
      .then(prs =>
        prs.map((pr: any) => {
          const reviewers = pr.requested_reviewers?.map((r: any) => r.login) || [];
          const assignees = pr.assignees?.map((a: any) => a.login) || [];
          const createdAt = new Date(pr.created_at);
          const now = new Date();
          const days_open = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
          return {
            repository: repo.name,
            author: pr.user?.login || '',
            assignees,
            reviewers,
            link: pr.html_url,
            title: pr.title,
            description: pr.body || '',
            source_branch: pr.head.ref,
            target_branch: pr.base.ref,
            days_open
          };
        })
      )
  );

  const allPRs = await Promise.all(prFetches);
  pullRequests = allPRs.flat();

  return new Response(JSON.stringify(pullRequests), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
