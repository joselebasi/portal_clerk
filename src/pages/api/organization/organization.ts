import { Octokit } from 'octokit';

export interface Organization {
  id: number;
  description: string | null;
}

export async function getOxxoOrganizations(): Promise<Organization[]> {
  try {
    const octokit = new Octokit({
      auth: import.meta.env.GITHUB_TOKEN
    });

    const response = await octokit.request('GET /user/orgs', {
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    return response.data.map((org: any) => ({
      id: org.id,
      description: org.login
    }));
  } catch (error: any) {
    console.log(error);
    throw new Error('Failed to fetch organizations');
  }
}