import { Octokit } from 'octokit';

export async function createRepository(json: string) {
  try {
    const octokit = new Octokit({
      auth: import.meta.env.GITHUB_TOKEN
    });

    // Convert the object to a JSON string
    const jsonString = JSON.stringify(json);

    // Remove line breaks using regex
    const cleanedJsonString = jsonString.replace(/[\r\n]/g, '')

    console.log('Creating repository with JSON:', cleanedJsonString);

    const response = await octokit.request('POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches', {
      owner: 'DevSecOps-Axity',
      repo: 'DEMO-GH-UTILS',
      workflow_id: 'workflow-python.yml',
      ref: 'main', // branch to trigger workflow on
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      },
      inputs: {
        map_input: cleanedJsonString
      } // Pass additional workflow inputs if required
    });

    return 'Repository created successfully!';
  } catch (error: any) {
    console.error('Error creating repository',error);
    throw new Error('Failed to create repository');
  }

}