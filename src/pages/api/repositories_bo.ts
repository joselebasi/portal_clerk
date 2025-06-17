import { Octokit } from 'octokit';
import { getVariableValue } from './repository/variables';

export interface Repository {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  language: string | null;
  limit_sca_critical: string;
  limit_sast_critical: string;
  limit_sca_high: string;
  limit_sast_high: string;
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
      per_page: 500,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    const filteredRepos = response.data.filter(response => response.name.includes("WF"));

    //Iterate over the filtered repositories and get the variable value for each one
    for (const repo of filteredRepos) {
      const variable = await getVariableValue(orgName, repo.name, 'LIMIT_SCA_CRITICAL');
      const variable2 = await getVariableValue(orgName, repo.name, 'LIMIT_SAST_CRITICAL');
      const variable3 = await getVariableValue(orgName, repo.name, 'LIMIT_SCA_HIGH');
      const variable4 = await getVariableValue(orgName, repo.name, 'LIMIT_SAST_HIGH');
      // add to repo limit_sca_critical
      repo.limit_sca_critical = variable.value 
      repo.limit_sast_critical = variable2.value
      repo.limit_sca_high = variable3.value 
      repo.limit_sast_high = variable4.value  
      console.log(variable.value, variable2.value, variable3.value ,variable4.value );
    }


    const repos = filteredRepos.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      html_url: repo.html_url,
      description: repo.description,
      stargazers_count: repo.stargazers_count,
      forks_count: repo.forks_count,
      updated_at: repo.updated_at,
      language: repo.language,
      limit_sca_critical: repo.limit_sca_critical,
      limit_sast_critical: repo.limit_sast_critical,
      limit_sca_high: repo.limit_sca_high,
      limit_sast_high: repo.limit_sast_high
    }));

    

    return repos;
  } catch (error: any) {
    if (error.status === 404) {
      throw new Error(`Organization "${orgName}" not found`);
    }
    console.log(error);
    throw new Error('Failed to fetch repositories');
  }
}