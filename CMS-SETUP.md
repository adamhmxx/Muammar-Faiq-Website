# CMS access (password login)

The CMS lives at `/admin.html`. The client signs in with a password; the GitHub token stays on the server
(Vercel environment variables) and is never sent to the browser.

## One-time setup in Vercel (Project → Settings → Environment Variables, scope: Production)

| Name | Value |
|---|---|
| `GITHUB_TOKEN` | A fine-grained GitHub token: only this repository, permission **Contents: Read and write**. |
| `ADMIN_PASSWORD_HASH` | Output of `node tools/hash-password.js "the password"` (at least 10 characters). |
| `SESSION_SECRET` | A random string of 32+ characters, e.g. `openssl rand -base64 48`. |
| `GITHUB_REPO` | Optional. Defaults to `adamhmxx/muammar-faiq-website`. |
| `GITHUB_BRANCH` | Optional. Defaults to `main`. |

Then **Redeploy** (Deployments → ⋯ → Redeploy) so the variables take effect.

## Using it
Open `https://<site>/admin.html`, sign in, edit, press **Save changes**. Each save is a commit and Vercel redeploys in about a minute.
Sessions last 12 hours. Uploads are limited to 3 MB per file (Vercel's request limit): compress bigger videos first.

## Changing the password
Run the hash tool again, replace `ADMIN_PASSWORD_HASH`, redeploy. To sign everyone out, change `SESSION_SECRET`.
If the repository moves to another GitHub account, create the token from that account and update `GITHUB_TOKEN` (and `GITHUB_REPO`).
