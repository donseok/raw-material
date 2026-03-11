const REPO_OWNER = 'donseok';
const REPO_NAME = 'raw-material';
const FILE_PATH = 'data/schedules.json';
const BRANCH = 'main';

async function getGitHubFile(token) {
  const res = await fetch(
    'https://api.github.com/repos/' + REPO_OWNER + '/' + REPO_NAME + '/contents/' + FILE_PATH + '?ref=' + BRANCH,
    { headers: { 'Authorization': 'token ' + token, 'Accept': 'application/vnd.github.v3+json' } }
  );
  if (res.status === 404) return { content: [], sha: null };
  const data = await res.json();
  const content = JSON.parse(Buffer.from(data.content, 'base64').toString('utf8'));
  return { content: content, sha: data.sha };
}

async function updateGitHubFile(token, content, sha) {
  var body = {
    message: '일정 데이터 업데이트',
    content: Buffer.from(JSON.stringify(content, null, 2)).toString('base64'),
    branch: BRANCH
  };
  if (sha) body.sha = sha;

  var res = await fetch(
    'https://api.github.com/repos/' + REPO_OWNER + '/' + REPO_NAME + '/contents/' + FILE_PATH,
    {
      method: 'PUT',
      headers: {
        'Authorization': 'token ' + token,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    }
  );
  return res.ok;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  var token = process.env.GITHUB_TOKEN;
  if (!token) return res.status(500).json({ error: 'GITHUB_TOKEN not configured' });

  try {
    if (req.method === 'GET') {
      var result = await getGitHubFile(token);
      return res.status(200).json(result.content);
    }

    if (req.method === 'POST') {
      var schedule = req.body;
      var current = await getGitHubFile(token);
      current.content.push(schedule);
      await updateGitHubFile(token, current.content, current.sha);
      return res.status(200).json(current.content);
    }

    if (req.method === 'DELETE') {
      var deleteId = req.body.id;
      var data = await getGitHubFile(token);
      var updated = data.content.filter(function(s) { return s.id !== deleteId; });
      await updateGitHubFile(token, updated, data.sha);
      return res.status(200).json(updated);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
};
