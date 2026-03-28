# Conflict Detection

Automatically flags skills where your claims don't match your evidence.

## How it works

After scoring each skill, the system checks the cross-reference status:

- **High risk conflict:** Skill on resume only — zero evidence on LinkedIn or GitHub
- **Medium risk conflict:** Skill on resume + LinkedIn but no GitHub code proof

## What the user sees

Each conflict shows:
- The skill name
- What the issue is (e.g., "Claimed on resume but no GitHub or LinkedIn evidence")
- Risk level (high / medium)
- Actionable recommendation (e.g., "Build a project using Kubernetes and push to GitHub")

## Why it matters

Recruiters increasingly verify claims. A skill listed on your resume but absent from your GitHub and LinkedIn is a red flag. CareerLens helps you identify these gaps before a recruiter does.
