import { Octokit } from 'octokit';

export interface Variable {
    name: string;
    value: string;
    updated_at: string;
    created_at: string;
}

export async function getVariableValue(orgName:string, repoName:string, varName: string): Promise<Variable> {
  try {
    const octokit = new Octokit({
      auth: import.meta.env.GITHUB_TOKEN
    });
    const response = await octokit.request('GET /repos/{owner}/{repo}/actions/variables', {
        owner: orgName,
        repo: repoName,
        headers: {
            'X-GitHub-Api-Version': '2022-11-28'
        }
      });
    
    const match = response.data.variables.find(v => v.name === varName) as Variable 
                    || { name: varName, value: "N/A", updated_at: "", created_at: "" };
    return match;
    
  } catch (error: any) {
    if (error.status === 404) {
      throw new Error(`Variable "${varName}" not found`);
    }
    console.log(error);
    throw new Error('Failed to fetch Variable');
  }
}