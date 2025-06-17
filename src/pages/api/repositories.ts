import { Octokit } from 'octokit';

export interface Repository {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  language: string | null;
}

export async function getOrganizationRepos(orgName: string): Promise<Repository[]> {
  try {
    const octokit = new Octokit({
      auth: import.meta.env.GITHUB_TOKEN
    });
    const response = await octokit.request('GET /orgs/{org}/repos', {
      org: orgName,
      type: 'private',
      sort: 'updated',
      per_page: 100,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    return response.data.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      html_url: repo.html_url,
      description: repo.description,
      stargazers_count: repo.stargazers_count,
      forks_count: repo.forks_count,
      updated_at: repo.updated_at,
      language: repo.language
    }));
  } catch (error: any) {
    if (error.status === 404) {
      throw new Error(`Organization "${orgName}" not found`);
    }
    console.log(error);
    throw new Error('Failed to fetch repositories');
  }
}