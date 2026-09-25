# GitPeak

A web application for viewing public GitHub profile statistics. Enter any GitHub username and get
an instant overview of their activity, languages, repositories, and contribution history.

Live at [gitpeak.vercel.app](https://gitpeak.vercel.app)

---

## Features

- Profile overview with avatar, bio, followers, and account age
- Contribution and commit totals
- Language distribution chart with per-language breakdown
- Most starred repository highlight
- Responsive layout for desktop and mobile
- Dynamic, animated SVG exporter for GitHub READMEs with built-in theme support

---

## Add to your GitHub README

You can embed your GitPeak dashboard directly into your GitHub profile `README.md`! It generates
an animated, auto-updating SVG of your GitHub stats.

Just copy and paste this code into your README, and replace `YOUR_USERNAME` with your actual
GitHub username:

```html
<div align="center">
  <a href="https://gitpeak.vercel.app/?username=YOUR_USERNAME">
    <img src="https://gitpeak.vercel.app/api/readme?username=YOUR_USERNAME" alt="My GitHub Stats" />
  </a>
</div>
```

### Themes

GitPeak supports 8 built-in themes. To change the look of your README card, simply add
`&theme=Theme+Name` to the end of the image URL.

For example, to use the **Catppuccin Mocha** theme:

```html
<img src="https://gitpeak.vercel.app/api/readme?username=YOUR_USERNAME&theme=Catppuccin+Mocha" />
```

**Available Themes:**

- `Rosé+Pine` _(Default)_
- `Rosé+Pine+Moon`
- `Rosé+Pine+Dawn`
- `Catppuccin+Mocha`
- `Catppuccin+Latte`
- `Tokyo+Night`
- `Gruvbox+Dark`
- `Nord`

---

## How Stats Are Calculated

GitPeak doesn't compute stats itself. It displays whatever the
[ghfetch](https://github.com/AmaneKai/ghfetch) worker returns from GitHub's GraphQL API. A few
things worth knowing if a number looks surprising:

- **Contribution and commit totals cover the trailing 12 months**, not your all-time GitHub
  history, since that's how GitHub's own `contributionsCollection` works when no date range is
  given.
- **Language percentages are an average across repos, not a global byte count.** Each repo's
  languages are turned into a share of that repo's bytes, then every repo you have language data
  for is averaged evenly, so a tiny repo written in one language pulls that language's percentage
  up just as much as a huge one would.
- **"Most starred repo" only looks at repos you own.** A highly-starred repo you contributed to
  elsewhere counts toward `totalStars`, but won't be picked as your most starred.

See ghfetch's [How Stats Are Calculated](https://github.com/AmaneKai/ghfetch#how-stats-are-calculated)
section for the exact formulas.

---

## Tech Stack

| Layer       | Technology                                      |
| ----------- | ----------------------------------------------- |
| Framework   | [SvelteKit](https://kit.svelte.dev/)            |
| Components  | [shadcn-svelte](https://www.shadcn-svelte.com/) |
| Headless UI | [bits-ui](https://www.bits-ui.com/)             |
| Styling     | [Tailwind CSS](https://tailwindcss.com/)        |
| Icons       | [Lucide](https://lucide.dev/)                   |
| Backend     | Cloudflare Worker proxying GitHub's GraphQL API |

---

## Project Structure

```text
src/
  lib/
    components/ui/     # shadcn component primitives
    features/
      charts/          # LanguagePie component and hook
      profile/         # ProfileCard component
      repos/           # MostStarredRepo component
      search/          # SearchBar, EmptyState, useSearch hook
      skeleton/        # DashboardSkeleton loading state
      stats/           # StatGrid component and hook
    utils/             # api, config, format, icons, theme, tilt, types
  routes/
    +page.svelte       # main page
    +layout.svelte     # app shell
    api/readme/        # Animated SVG generator for GitHub READMEs
    og/                # Static PNG Open Graph image generator
```

---

## License

MIT
