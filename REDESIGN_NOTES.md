# EduShelf — UI Redesign Notes

**Developer:** Aayush Sharma · [LinkedIn](https://www.linkedin.com/in/aayush-sharma-java-dev79914/) · [GitHub](https://github.com/coding-wit-haayush)

## What changed
- **New light, professional theme** (indigo brand colour, Inter + Plus Jakarta Sans). All design tokens live in
  `edushelf-client/tailwind.config.js` and `src/index.css`.
- **Responsive on every device**: mobile hamburger menu, bottom navigation for dashboard/admin pages,
  scrollable filter chips, tables that scroll sideways on phones, no horizontal overflow at 390 / 820 / 1440 px.
- **Footer on every page** with developer name, LinkedIn and GitHub links.
- **New pages**: `/explore` (search + department/semester/sort filters + pagination), `/settings` (edit profile),
  `/admin/requests` (admins can finally see and update book requests).
- **Real data instead of fake numbers**: homepage stats and department counts come from the new
  `GET /api/public/stats` endpoint; the random "reading activity" heatmap was removed.

## Buttons / bugs fixed
- Like & Save on book cards were hover-only (unusable on phones) and didn't remember your previous choice — fixed.
- "View All" used to just reload the home page — it now opens Explore.
- Dead buttons removed or wired up: Filter, Forgot password, Remember me, notification bell, sidebar
  Settings/Analytics/Reports, "Read Now" on a fake card. Share button on the book page now works.
- Admin "Requests" sidebar link pointed to the dashboard — now opens the real requests page.
- Request priority (Low/Medium/High) is now saved to the database and shown to admins.
- Semester filter on department pages was hidden on phones — now visible everywhere.
- Sidebar highlighted two links at once on My Library — fixed.
- Register now checks the 6-character minimum password before calling the server.

## Run
See `README.md`. Remember: create `edushelf-server/.env` from `.env.example` (never share or commit it).
