# DSH-Projects — a DeepSeek Harness sidebar widget

[Русский](README.md) | English

A compact, always-visible projects widget for the [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) sidebar: every project, its chats and their live state without opening a separate page. The bundle adds one slot, `sidebar.footer.action`, and a **Projects** section in Harness Settings; it adds no entry to the top sidebar menu and no full-page panel.

## What is here

The repository root is the bundle itself: `package.json`, `client.js`, `index.js`, `cordis.patch.yml`, `locale/`, `icon.svg`. `README.md` is the Russian version; `verify.mjs` is a standalone check of the browser half.

## Features

### Compact widget in the left panel

The widget sits in the sidebar foot, above “More”, and is visible without opening anything.

- **Every project** with its chats; the list scrolls and never hides its tail.
- **Five visual chat states**: running — yellow; waiting for permission / plan / answer — blue; finished but unread — green; failed/error — red; finished and read — grey.
- **Unread finish**: a green dot, green relative time and a bold title on the chat; a single green unread count on the project. The word “new” is not repeated on every row. The marker disappears once the chat is read and the row returns to grey.
- **Error**: a red dot, a red project count and the “error” label. If the host does not expose `failed`/`error`, the red state does not appear because there is no error data.
- **Visibility filters**: separate counters for waiting, running, unread, errors and read. A click hides or shows only that state; “All” restores all five. Zero-count chips stay out of the header. The choice survives a reload.
- **Approval banner**: when a chat waits for approval, a blue banner appears above the list. The first line names the workspace, the second names the chat and tool; **Allow once** and **Reject** answer without opening the session. “Always allow” stays in the chat. The banner can be disabled in Settings.
- **Expand/collapse all**: the control to the right of “All” opens or closes every project row; it is hidden in the collapsed strip.
- **Expandable projects**: the chevron reveals a project's chats; clicking the name opens its most recent active chat.
- **Accordion**: opening a neutral project collapses the other neutral ones; projects expanded with the chevron stay open. Projects waiting for you, unread or failed stay expanded so they remain visible. The behaviour can be turned off in Settings.
- **Active project**: the project of the chat open in the main view is tinted and marked; the current chat is highlighted inside the list.
- **One-line mode**: click “Projects” to collapse the widget into a strip with the counters; click again to restore the previous state (visible statuses, expanded rows, sorting). The choice survives a reload.
- **Sort choice**: the sort button opens a menu — active first, last activity, name, chat count. The choice is remembered.
- **Quick navigation**: clicking a chat opens it.
- Russian and English, dark and light themes via host tokens.

## Settings

A **Projects** section appears in Harness Settings (`settings.section` with an icon). Every row applies immediately:

| Preference | Values | Default |
|---|---|---|
| Sorting | active first / last activity / name / chat count | active first |
| Counter unit | projects / chats | projects |
| Visible statuses | waiting / running / unread / errors / read | all on |
| Keep projects waiting for you expanded | on / off | on |
| Keep projects with unread finishes expanded | on / off | on |
| Only active neutral projects | on / off | on |
| Unread counter | on / off | on |
| Answer approvals from the widget | on / off | on |

**Only active neutral projects** is the accordion for neutral projects: clicking a project name opens it and collapses the other neutral projects; a project expanded with its chevron stays open. Projects waiting for you (blue), unread (green) or failed (red) do not collapse when you switch and stay visible until you collapse them with the chevron or turn the relevant settings off.

The counters and the Settings section share one store, so a change on either side repaints the strip immediately. **Reset to defaults** restores active-first sorting, all statuses, auto-expand on, accordion on and the badge on, and expands the widget.

## Install

The plugin is a normal DSH bundle installed from a local directory:

```text
plugin_manager install_bundle { "target": "<absolute-path-to-this-repo>" }
```

`plugin_manager` is DSH's built-in bundle manager (an agent tool and the same service behind the Web **Plugins** page), not a dependency of the plugin. Without the tool, use **Plugins → Add plugin** and pick the local package directory. The bundle is linked into the active profile and enabled; a page reload picks it up. To remove it, use the **Plugins** page (or `plugin_manager`).

Nothing in the shipped sidebar is replaced: the widget registers into the additive `sidebar.footer.action` slot. It does not register `sidebar.panellist` or `main`, so the top sidebar menu and the session browser stay untouched.

## Data and state

- Reads the Client Session and Workspace projections (`ctx.sessions.list`, `ctx.workspaces.list`) plus the renderer's session-status hook — no polling.
- User preferences live in `localStorage`: `projects-board:sort`, `projects-board:collapsed`, `projects-board:visible`, and the Settings section's `projects-board:settings` (counter unit, auto-expand, accordion, unread counter, inline approvals).
- The widget hides itself when the sidebar is a rail, when there are no projects, or when the panel is not `wide`.
- Status visibility is applied while deriving the list: hidden states disappear from project rows and the expanded chat list; the counters keep their totals (projects or chats, per the Settings choice) so hidden states remain discoverable.

## Development

```bash
node verify.mjs
```

The harness loads `client.js` with a fake Module Loader and a stub React, mounts the plugin against fake Client services, and checks the footer and Settings registrations, status categories and colours, unread finishes, filters, sorting, the accordion, collapse/restore, navigation, persistence and empty states.

The plugin is plain JavaScript: `index.js` is an empty Host half, `client.js` holds the whole browser half, `locale/*.json` carries the plugin manager metadata and `icon.svg` the artwork.
