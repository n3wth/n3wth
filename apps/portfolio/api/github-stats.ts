import type { VercelRequest, VercelResponse } from '@vercel/node'

const GITHUB_TOKEN = process.env.GITHUB_TOKEN

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { owner, repo } = req.query

  if (!owner || !repo || Array.isArray(owner) || Array.isArray(repo)) {
    return res.status(400).json({ error: 'Missing owner or repo' })
  }

  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        ...(GITHUB_TOKEN ? { Authorization: `token ${GITHUB_TOKEN}` } : {}),
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error(`GitHub API error for ${owner}/${repo}:`, response.status, errorData)
      return res.status(response.status).json({ error: 'GitHub API error' })
    }

    const data = await response.json()
    
    return res.status(200).json({
      stars: data.stargazers_count,
      forks: data.forks_count,
    })
  } catch (err) {
    console.error(`GitHub fetch error for ${owner}/${repo}:`, err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
