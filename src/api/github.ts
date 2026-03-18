export async function getRepoStars(repo: string): Promise<number> {
  try {
    const response = await fetch(`https://api.github.com/repos/${repo}`, {
      next: { revalidate: 86400 }
    });
    if (response.ok) {
      const data = await response.json();
      return data.stargazers_count || 3000;
    }
  } catch (error) {
    // ignore
  }
  return 3000;
}
