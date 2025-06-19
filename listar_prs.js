// listar_prs.js
const { Octokit } = require("@octokit/rest");
const dayjs = require("dayjs");

const octokit = new Octokit({
  auth: "PAT_GITHUB", // exporta tu token primero
});

const ORG = "BUS-BackOffice";

async function main() {
  const repos = await octokit.paginate(octokit.repos.listForOrg, {
    org: ORG,
    type: "all",
    per_page: 1000,
  });

  // Filtrar solo los repos que tengan "ORA_" o "WF_" en el nombre
  const oraWfRepos = repos.filter(
    (repo) => repo.name.includes("ORA_") || repo.name.includes("WF_")
  );

  // Buscar PRs en paralelo
  const prResults = await Promise.all(
    oraWfRepos.map(async (repo) => {
      const pulls = await octokit.paginate(octokit.pulls.list, {
        owner: ORG,
        repo: repo.name,
        state: "open",
        per_page: 100,
      });
      return { repo: repo.name, pulls };
    })
  );

  prResults.forEach(({ repo, pulls }) => {
    pulls.forEach((pr) => {
      const diasAbierto = dayjs().diff(dayjs(pr.created_at), "day");
      const assignee = pr.assignee ? pr.assignee.login : "Ninguno";
      const reviewers = pr.requested_reviewers && pr.requested_reviewers.length > 0
        ? pr.requested_reviewers.map(r => r.login).join(", ")
        : "Ninguno";
      console.log(
        `[${repo}] PR #${pr.number} - "${pr.title}" - Abierto hace ${diasAbierto} días\n` +
        `  Asignado a: ${assignee}\n` +
        `  Revisores solicitados: ${reviewers}\n`
      );
    });
  });
}

main().catch(console.error);
