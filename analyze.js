// ─── ANALYZE.JS ──────────────────────────────────────
// Handles: AI job analysis — match score, tailored resume,
//          cover letter, outreach email, application tips

// Call the selected AI provider (Claude or OpenAI)
async function callAI(prompt, maxTokens = 2000) {
  const key = getKey();
  if (!key) throw new Error('No API key found. Go to ⚙ API Setup and save your key first.');

  if (provider === 'claude') {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    return data.content.map(b => b.text || '').join('');

  } else {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + key
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    return data.choices[0].message.content;
  }
}

// Parse a specific section from the AI response
function getSection(text, key) {
  const re = new RegExp(`===${key}===\\n?([\\s\\S]*?)(?====|$)`);
  const match = text.match(re);
  return match ? match[1].trim() : '';
}

// Run the full job analysis
async function runAnalysis() {
  const jd      = document.getElementById('a-jd').value.trim();
  const company = document.getElementById('a-company').value.trim() || 'the company';
  const title   = document.getElementById('a-title').value.trim()   || 'this position';
  const resume  = document.getElementById('base-resume').value || '';

  if (!jd) { alert('Please paste a job description first.'); return; }

  // Show results area and set loading state
  document.getElementById('results-section').style.display = 'block';
  showTab('tab-match');

  const outputIds = ['resume-out', 'cover-out', 'email-out', 'tips-out'];
  outputIds.forEach(id => {
    const el = document.getElementById(id);
    el.textContent = '';
    el.classList.add('loading');
  });

  document.getElementById('match-content').innerHTML = `
    <div style="color:var(--muted);padding:30px;text-align:center">
      Analyzing with ${provider === 'claude' ? 'Claude AI' : 'ChatGPT'}...
    </div>`;

  const resumeSection = resume
    ? `MY CURRENT RESUME:\n${resume}\n\n`
    : 'No resume provided — generate general tailored content.\n\n';

  const prompt = `You are an expert career coach and resume writer.

${resumeSection}JOB DESCRIPTION FOR: ${title} at ${company}
${jd}

Provide ALL of the following sections using these EXACT headers:

===MATCH_SCORE===
Score: X/100
Strengths (3-5 bullet points with •)
Gaps to address (2-3 bullet points with •)

===TAILORED_RESUME===
Full tailored resume in clean plain text. Include: Contact info placeholder, 3-line keyword-rich Summary, Experience with achievement-focused bullets, Skills matching the JD keywords, Education.

===COVER_LETTER===
3-paragraph cover letter for ${title} at ${company}. Strong hook, specific achievements, confident CTA. Under 250 words.

===OUTREACH_EMAIL===
Subject line + professional follow-up or cold outreach email under 120 words.

===TIPS===
5 specific actionable tips referencing details from this exact job description. Use • bullets.`;

  try {
    const text = await callAI(prompt, 2000);

    // Parse match score
    const matchText  = getSection(text, 'MATCH_SCORE');
    const scoreMatch = matchText.match(/Score:\s*(\d+)/i);
    const score      = scoreMatch ? parseInt(scoreMatch[1]) : 75;
    const color      = score >= 75 ? 'var(--green)' : score >= 50 ? 'var(--amber)' : 'var(--accent2)';

    document.getElementById('match-content').innerHTML = `
      <div style="display:flex;align-items:center;gap:24px;margin-bottom:18px">
        <div style="font-family:var(--font-head);font-size:52px;font-weight:800;color:${color};line-height:1">
          ${score}<span style="font-size:18px;color:var(--muted)">/100</span>
        </div>
        <div>
          <div style="font-size:15px;font-weight:500;margin-bottom:4px">Match Score</div>
          <div style="font-size:12px;color:var(--muted)">
            Analyzed by ${provider === 'claude' ? 'Claude AI' : 'ChatGPT'}
          </div>
          <div class="progress-bar" style="width:220px">
            <div class="progress-fill" style="width:${score}%;background:${color}"></div>
          </div>
        </div>
      </div>
      <div style="white-space:pre-wrap;font-size:13px;line-height:1.8">
        ${matchText.replace(/Score:\s*\d+\/100\n?/i, '')}
      </div>`;

    // Remove loading state and populate outputs
    outputIds.forEach(id => document.getElementById(id).classList.remove('loading'));
    document.getElementById('resume-out').textContent = getSection(text, 'TAILORED_RESUME') || 'Could not generate — try again.';
    document.getElementById('cover-out').textContent  = getSection(text, 'COVER_LETTER')    || 'Could not generate — try again.';
    document.getElementById('email-out').textContent  = getSection(text, 'OUTREACH_EMAIL')  || 'Could not generate — try again.';
    document.getElementById('tips-out').textContent   = getSection(text, 'TIPS')            || 'Could not generate — try again.';

  } catch (e) {
    outputIds.forEach(id => {
      document.getElementById(id).classList.remove('loading');
      document.getElementById(id).textContent = 'Error: ' + e.message;
    });
    document.getElementById('match-content').innerHTML = `
      <div style="color:var(--accent2);padding:16px">
        ⚠ ${e.message}
        <br><br>
        <span style="color:var(--muted);font-size:12px">Go to ⚙ API Setup to check your key.</span>
      </div>`;
  }
}
