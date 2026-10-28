exports.assertCurrentMain = async (github, context) => {
  const { data } = await github.rest.repos.getBranch({ ...context.repo, branch: 'main' })
  if (data.commit.sha !== context.sha) throw new Error('The deployment SHA is no longer the current main commit.')
}
