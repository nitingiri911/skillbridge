// Core matching logic: compares student skills against job required skills.
// Two-tier approach:
// 1. Fast exact/fuzzy match (Jaccard-style overlap) - works offline, instant, free
// 2. Optional Gemini API semantic pass - catches synonyms like "React" vs "ReactJS"
//    (only call this for a shortlist, not every comparison, to save API quota)

function normalizeSkill(skill) {
  return skill.trim().toLowerCase().replace(/\.js$/, '').replace(/[^a-z0-9]/g, '');
}

// Returns a 0-100 match score based on skill overlap
function calculateMatchScore(studentSkills = [], requiredSkills = []) {
  if (!requiredSkills.length) return 0;

  const normalizedStudent = new Set(studentSkills.map(normalizeSkill));
  const normalizedRequired = requiredSkills.map(normalizeSkill);

  const matched = normalizedRequired.filter((skill) => normalizedStudent.has(skill));
  const score = (matched.length / normalizedRequired.length) * 100;

  return Math.round(score * 100) / 100; // 2 decimal places
}

// Optional: semantic matching via Gemini API for higher accuracy.
// Call this only when you want a smarter score (e.g., top 20 candidates),
// not on every single student-job pair, to control API cost/latency.
async function calculateSemanticMatchScore(studentSkills, requiredSkills, geminiApiKey) {
  if (!geminiApiKey) {
    // fall back to basic matching if no API key configured
    return calculateMatchScore(studentSkills, requiredSkills);
  }

  const prompt = `Student skills: ${studentSkills.join(', ')}
Job required skills: ${requiredSkills.join(', ')}
On a scale of 0-100, how well does this student's skill set match the job requirements?
Consider synonyms and related technologies (e.g. "React" matches "ReactJS").
Respond with ONLY a number, nothing else.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    const score = parseFloat(text);
    return isNaN(score) ? calculateMatchScore(studentSkills, requiredSkills) : score;
  } catch (err) {
    console.error('Gemini matching failed, falling back to basic match:', err.message);
    return calculateMatchScore(studentSkills, requiredSkills);
  }
}

module.exports = { calculateMatchScore, calculateSemanticMatchScore };
