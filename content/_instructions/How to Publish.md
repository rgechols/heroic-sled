# How to Publish

## Creating a New Post

1. Create a new file in `posts/` (name it with a slug: `my-post-title.md`)
2. Templater will automatically insert front matter when the file is created
3. Write your post below the front matter
4. When ready to publish, change `draft: true` to `draft: false`

## Front Matter

```yaml
---
title: "Your Post Title"
date: 2026-01-31T10:00:00-06:00
draft: true
description: "A one-sentence summary for meta tags and social previews."
tags: ["tag-one", "tag-two"]
---
```

| Field         | Required | Notes                                                    |
| ------------- | -------- | -------------------------------------------------------- |
| `title`       | Yes      | Displayed as the heading and in feeds                    |
| `date`        | Yes      | ISO 8601 with timezone. Templater fills this for you     |
| `draft`       | Yes      | Set `true` while writing, `false` to publish             |
| `description` | No       | Used in meta tags and social cards. Keep under 160 chars |
| `tags`        | No       | Array of lowercase tags. Creates pages at `/tags/name/`  |

## Adding Images

1. Put the image in the `static/images/` folder (outside the vault, at the repo root)
2. Reference it in your post: `![Description](/images/photo.jpg)`

## Writing Tips

- The first ~40 words become the summary on the home page
- Use `<!--more-->` to set a manual summary break point
- Posts appear at `heroic-sled.com/posts/2026/01/your-slug/`

## Publishing

### From Obsidian

1. Set `draft: false` in the front matter
2. Open the command palette (Cmd+P)
3. Run **Obsidian Git: Commit all changes**
4. Run **Obsidian Git: Push**
5. GitHub Actions builds and deploys automatically

### From the Terminal

```bash
cd ~/Heroic-Sled
git add content/posts/your-new-post.md
git commit -m "Publish: Your Post Title"
git push
```

## Previewing Locally

```bash
cd ~/Heroic-Sled
hugo server -D
```

The `-D` flag includes draft posts. Open the URL shown in the terminal (usually `http://localhost:1313`).

## Unpublishing

Set `draft: true` in the front matter and push. The post disappears from the live site but stays in the repo.

## Feeds

| Feed       | URL                                   |
| ---------- | ------------------------------------- |
| Posts RSS  | `heroic-sled.com/posts/index.xml`     |
| Posts JSON | `heroic-sled.com/posts/feed.json`     |
| Site RSS   | `heroic-sled.com/index.xml`           |
| JSON Feed  | `heroic-sled.com/feed.json`           |
