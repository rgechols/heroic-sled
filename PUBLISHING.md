# Publishing Guide for Heroic Sled

## Setup

Open the `content/` folder as an Obsidian vault. The Templater and Obsidian Git plugins are already configured.

---

## Writing a New Post

1. In Obsidian, create a new file in `content/posts/`
2. Name it with a slug: `my-post-title.md`
3. Open the command palette (Cmd+P) and run **Templater: Insert template**
4. Choose `new-post`
5. Write your post below the front matter
6. When ready to publish, change `draft: true` to `draft: false`

### Post front matter

```yaml
---
title: "Your Post Title"
date: 2026-01-31T10:00:00-06:00
draft: true
description: "A one-sentence summary for meta tags and social previews."
tags: ["tag-one", "tag-two"]
categories: ["essays"]
---

Your content here. Write in standard Markdown.
```

### Front matter fields

| Field | Required | Notes |
|-------|----------|-------|
| `title` | Yes | Displayed as the heading and in feeds |
| `date` | Yes | ISO 8601 with timezone. Templater fills this automatically |
| `draft` | Yes | Set `true` while writing, `false` to publish |
| `description` | No | Used in meta tags and social cards. Keep under 160 characters |
| `tags` | No | Array of lowercase tags. Creates pages at `/tags/tag-name/` |
| `categories` | No | Array. Rarely needed — tags are usually sufficient |

### Tips

- The first ~40 words become the summary on the home page and post cards
- Use `<!--more-->` to set a manual summary break point
- Images go in `static/images/` and are referenced as `![alt](/images/filename.jpg)`
- Posts appear at `heroic-sled.com/posts/2026/01/your-slug/`

---

## Publishing Workflow

### From Obsidian (with Obsidian Git plugin)

1. Set `draft: false` in the front matter
2. Open the command palette (Cmd+P)
3. Run **Obsidian Git: Commit all changes**
4. Run **Obsidian Git: Push**
5. GitHub Actions builds and deploys automatically (~1 minute)

### From the terminal

```bash
cd ~/Heroic-Sled
git add content/posts/your-new-post.md
git commit -m "Publish: Your Post Title"
git push
```

The site rebuilds automatically on push via GitHub Actions.

---

## Content Structure

```
content/
├── _index.md              Home page intro text
├── about/_index.md        About page
├── posts/
│   ├── _index.md          Posts section page (title only)
│   └── *.md               Your posts go here
└── micro/
    └── _index.md          Micro.blog feed page
```

### URL structure

| Content | URL pattern |
|---------|-------------|
| Posts | `/posts/2026/01/your-slug/` |
| Tags | `/tags/tag-name/` |
| About | `/about/` |
| Micro | `/micro/` (redirects to social.heroic-sled.com) |
| RSS | `/index.xml` or `/posts/index.xml` |
| JSON Feed | `/feed.json` |

---

## Feeds

| Feed | URL | Contents |
|------|-----|----------|
| Site RSS | `heroic-sled.com/index.xml` | All content |
| Posts RSS | `heroic-sled.com/posts/index.xml` | Posts only |
| JSON Feed | `heroic-sled.com/feed.json` | All content |
| Posts JSON | `heroic-sled.com/posts/feed.json` | Posts only |

Use the Posts RSS feed for Buttondown's RSS-to-email automation.

---

## Buttondown Newsletter

Once you have your Buttondown username, update `hugo.toml`:

```toml
buttondownUsername = 'your-actual-username'
```

### RSS-to-email (auto-draft newsletters from posts)

1. Log in to buttondown.com
2. Go to **Automations > New Automation**
3. Set trigger to **RSS feed** and enter: `https://heroic-sled.com/posts/index.xml`
4. Buttondown will auto-draft an email when you publish a new post
5. Review and send from the Buttondown dashboard

---

## Previewing Locally

```bash
cd ~/Heroic-Sled
hugo server -D
```

The `-D` flag includes draft posts. Open the URL shown in the terminal (usually `http://localhost:1313`).

---

## Common Tasks

### Edit the home page intro

Edit `content/_index.md` — the text below the front matter appears at the top of the home page.

### Edit the About page

Edit `content/about/_index.md`.

### Add a tag to a post

Add it to the `tags` array in the front matter:

```yaml
tags: ["analog", "books", "new-tag"]
```

### Add an image to a post

1. Put the image in `static/images/`
2. Reference it in your post: `![Description](/images/photo.jpg)`

### Unpublish a post

Set `draft: true` in the front matter and push. The post will disappear from the live site but remain in the repo.
