async function fetchGithubStats() {
  const res = await fetch("https://github.com/users/ganeshlonare/contributions");
  const html = await res.text();
  console.log(html.substring(0, 500));
}
fetchGithubStats();
