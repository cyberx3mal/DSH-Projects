/**
 * Standalone verification harness for the projects widget client half.
 *
 * Loads client.js with a fake Module Loader, a stub React (with per-mount hook
 * state so visibility toggles, sorting and expansion can be exercised) and fake
 * Client services. It proves the factory parses, `apply` registers only the
 * sidebar footer widget, the three chat categories drive the counters, the
 * status chips toggle independently, sorting opens a choice control, and the
 * strip collapses and restores its previous state.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(fileURLToPath(import.meta.url))
const source = fs.readFileSync(path.join(root, 'client.js'), 'utf8')

/* ---------- stub React with per-mount hook state ---------- */

const hookStates = []
let hookIndex = 0

function callComponent(component, props) {
  hookIndex = 0
  return component(props)
}

function flatten(children, out) {
  for (const child of children) {
    if (child === null || child === undefined || child === false || child === true) continue
    if (Array.isArray(child)) flatten(child, out)
    else if (typeof child === 'object' && typeof child.type !== 'undefined') render(child, out)
    else out.push(String(child))
  }
}

function render(element, out = []) {
  if (element === null || element === undefined) return out
  const { type, props } = element
  const children = element.children ?? []
  if (typeof type === 'function') {
    const merged = { ...props }
    if (children.length === 1) merged.children = children[0]
    else if (children.length > 1) merged.children = children
    const rendered = callComponent(type, merged)
    if (rendered && typeof rendered === 'object') render(rendered, out)
    return out
  }
  flatten(children, out)
  if (typeof props?.children !== 'undefined') flatten([props.children], out)
  return out
}

const React = {
  createElement(type, props, ...children) {
    return { type, props: props ?? {}, children }
  },
  useState(initial) {
    const index = hookIndex
    hookIndex += 1
    if (hookStates.length <= index) hookStates[index] = typeof initial === 'function' ? initial() : initial
    return [
      hookStates[index],
      next => {
        hookStates[index] = typeof next === 'function' ? next(hookStates[index]) : next
      },
    ]
  },
  useEffect() {},
  useLayoutEffect() {},
  useMemo(factory) {
    return factory()
  },
  useCallback(fn) {
    return fn
  },
  useRef(value) {
    return { current: value }
  },
  useSyncExternalStore(_subscribe, getSnapshot) {
    return getSnapshot()
  },
}

/** Collect concrete elements by className, expanding function components. */
function collectByClass(element, className, out = []) {
  if (element === null || element === undefined) return out
  if (Array.isArray(element)) {
    for (const child of element) collectByClass(child, className, out)
    return out
  }
  if (typeof element !== 'object') return out
  if (typeof element.type === 'function') {
    const merged = { ...element.props }
    const children = element.children ?? []
    if (children.length === 1) merged.children = children[0]
    else if (children.length > 1) merged.children = children
    collectByClass(callComponent(element.type, merged), className, out)
    return out
  }
  if (element.props && typeof element.props.className === 'string' && element.props.className.split(/\s+/).includes(className)) out.push(element)
  for (const child of element.children ?? []) collectByClass(child, className, out)
  return out
}

/* ---------- fake browser storage and Client services ---------- */

const storage = new Map()
globalThis.localStorage = {
  getItem(key) {
    return storage.has(key) ? storage.get(key) : null
  },
  setItem(key, value) {
    storage.set(key, String(value))
  },
  removeItem(key) {
    storage.delete(key)
  },
}

function createStore(initial) {
  let value = initial
  const listeners = new Set()
  return {
    getSnapshot: () => value,
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    set(next) {
      value = typeof next === 'function' ? next(value) : next
      for (const listener of [...listeners]) listener()
    },
  }
}

const now = Date.now()
const workspaces = createStore({
  items: [
    { workspaceId: 'ws-a', path: 'C:\\projects\\alpha', title: 'alpha', sessionIds: ['s-run', 's-done', 's-blank', 's-archived'], createdAt: '', updatedAt: '' },
    { workspaceId: 'ws-b', path: 'C:\\projects\\beta', title: 'beta', sessionIds: ['s-other'], createdAt: '', updatedAt: '' },
    { workspaceId: 'ws-empty', path: 'C:\\projects\\idle', title: 'idle', sessionIds: [], createdAt: '', updatedAt: '' },
  ],
  archivedSessionIds: ['s-archived'],
  pinnedSessionIds: ['s-done'],
  state: 'ready',
  phase: 'ready',
  error: null,
})

const sessions = createStore({
  ids: ['s-run', 's-done', 's-other', 's-blank', 's-archived', 's-child', 's-loose'],
  byId: {
    's-run': { id: 's-run', displayTitle: 'Fix the sidebar entry', running: true, blank: false, updatedAt: now - 2 * 60000, retainedBy: { mainView: 1 } },
    's-done': { id: 's-done', displayTitle: 'Generated the report', running: false, blank: false, updatedAt: now - 3 * 3600000, retainedBy: {} },
    's-other': { id: 's-other', displayTitle: 'Rebuilt the index', running: false, blank: false, updatedAt: now - 26 * 3600000, retainedBy: {} },
    's-blank': { id: 's-blank', displayTitle: 'New session', running: false, blank: true, updatedAt: now - 1000, retainedBy: {} },
    's-archived': { id: 's-archived', displayTitle: 'Archived alpha', running: false, blank: false, updatedAt: now - 5000, retainedBy: {} },
    's-child': { id: 's-child', displayTitle: 'Subagent child', running: false, blank: false, updatedAt: now - 6000, retainedBy: {}, origin: 'subagent', parentId: 's-run' },
    's-loose': { id: 's-loose', displayTitle: 'Loose session', running: false, blank: false, updatedAt: now - 4 * 86400000, retainedBy: {} },
  },
  phase: 'ready',
  projectionsBySession: {},
})

/** Renderer-provided live status: one approval, one running, two finished. */
const approvalAnswers = []
const approvalRequest = {
  kind: 'approval',
  key: 'approval-1',
  toolName: 'shell',
  reason: 'Run tests',
  answerable: true,
  answer(outcome) {
    approvalAnswers.push(outcome)
    return Promise.resolve()
  },
}
const statuses = new Map([
  ['s-run', { running: true, completionUnread: false }],
  ['s-done', { running: false, pendingInteraction: approvalRequest, completionUnread: false }],
  ['s-other', { running: false, completionUnread: true }],
  ['s-loose', { running: false, completionUnread: false }],
])
const useSessionStatus = selector => selector(statuses)

const opened = { sessions: [], workspaces: [] }
const effects = []
const registrations = []
let locale = 'ru'
let dictionaries = {}

const ctx = {
  effect(callback) {
    const dispose = callback()
    effects.push(dispose)
    return () => {}
  },
  on(_event, _listener) {
    return () => {}
  },
  slots: {
    inject(_key, callback) {
      callback()
      return () => {}
    },
    register(options, component) {
      registrations.push({ options, component })
      return () => {}
    },
  },
  locale: {
    register(namespace, next) {
      dictionaries[namespace] = next
      return () => {}
    },
    bind(namespace) {
      return (key, vars) => {
        const template = dictionaries[namespace]?.[locale]?.[key] ?? dictionaries[namespace]?.en[key] ?? key
        return typeof template === 'string'
          ? template.replace(/\{(\w+)\}/g, (_all, name) => String(vars?.[name] ?? `{${name}}`))
          : template
      }
    },
  },
  sessions: { list: sessions },
  workspaces: { list: workspaces },
  uiWorkspace: {
    openSession(id) {
      opened.sessions.push(id)
    },
    openWorkspace(id) {
      opened.workspaces.push(id)
    },
  },
}

/* ---------- load the bundle ---------- */

let factory
const loader = {
  load(definition) {
    if (definition.id !== '@local/projects-board') throw new Error('unexpected bundle id: ' + definition.id)
    factory = definition.factory
  },
}

const run = new Function('window', 'require', source)
run({ __ModuleLoader__: loader }, name => {
  if (name === 'react') return React
  throw new Error('unexpected require: ' + name)
})
if (typeof factory !== 'function') throw new Error('the bundle registered no factory')

const localRequire = name => {
  if (name === 'react') return React
  throw new Error('unexpected require: ' + name)
}

const failures = []
const check = (condition, message) => {
  if (!condition) failures.push(message)
}

const plugin = factory(localRequire)
plugin.apply(ctx)

/* ---------- registrations ---------- */

check(Array.isArray(plugin.inject), 'plugin.inject should be an array')
for (const service of ['slots', 'locale', 'sessions', 'workspaces', 'uiWorkspace']) {
  check(plugin.inject.includes(service), `plugin.inject should declare ${service}`)
}
check(registrations.length === 3, 'the bundle should register the footer, settings section and settings icon, got ' + registrations.length)
const footRegistration = registrations.find(entry => entry.options.name === 'sidebar.footer.action')
const settingsRegistration = registrations.find(entry => entry.options.name === 'settings.section')
const settingsIconRegistration = registrations.find(entry => entry.options.name === 'settings.section.icon')
check(footRegistration !== undefined, 'a sidebar.footer.action registration is required')
check(footRegistration?.options.id === 'projects-board-foot', 'footer action id mismatch')
check(settingsRegistration !== undefined, 'a settings.section registration is required')
check(settingsRegistration?.options.id === 'projects-board', 'settings section id mismatch')
check(settingsRegistration?.options.label?.() === 'Проекты', 'settings section label should be localized')
check(settingsIconRegistration?.options.id === 'projects-board', 'settings icon id mismatch')
check(registrations.some(entry => entry.options.name === 'main') === false, 'main panel must stay unregistered')
check(registrations.some(entry => entry.options.name === 'sidebar.panellist') === false, 'sidebar.panellist must stay unregistered')

const footProps = { ...footRegistration.options.inject(), useSessionStatus }

/* ---------- helpers ---------- */

function renderFooter() {
  hookIndex = 0
  return footRegistration.component({ ...footProps, wide: true })
}

const mountFooter = () => {
  hookStates.length = 0
  storage.clear()
  return renderFooter()
}

const projectNames = element => collectByClass(element, 'dsb-projectName').map(node => String(node.children[0]))
const chips = element => collectByClass(element, 'dsb-chip')
const chipByTone = (element, tone) => chips(element).find(chip => chip.props['data-tone'] === tone)
const chipCounts = element => collectByClass(element, 'dsb-chipCount').map(node => String(node.children[0]))
const text = element => render(element).join(' | ')

/* ---------- initial widget ---------- */

let widget = mountFooter()
check(widget !== null, 'footer widget should render while projects exist')
check(text(widget).includes('Проекты'), 'footer title missing')
check(text(widget).includes('Все'), 'footer "All" control missing')
check(text(widget).includes('alpha'), 'footer project missing')
check(text(widget).includes('beta'), 'footer second project missing')
check(text(widget).includes('Без проекта'), 'footer ungrouped project missing')
check(text(widget).includes('Generated the report'), 'attention project should start expanded with its chats')
check(text(widget).includes('Fix the sidebar entry'), 'expanded project should list its running chat')
check(projectNames(widget).length === 3, 'footer should list every project, got ' + projectNames(widget).length)
check(chips(widget).length === 4, 'footer should render four non-zero status chips, got ' + chips(widget).length)
check(JSON.stringify(chipCounts(widget)) === JSON.stringify(['1', '1', '1', '1']), 'chips should count attention/running/unread/read projects, got ' + JSON.stringify(chipCounts(widget)))
for (const tone of ['attention', 'running', 'unread', 'finished']) {
  const chip = chipByTone(widget, tone)
  check(chip !== undefined, `${tone} chip missing`)
  check(chip?.props['data-visible'] === 'true', `${tone} chip should be visible by default`)
  check(chip?.props['aria-pressed'] === 'true', `${tone} chip should report pressed by default`)
}
check(chipByTone(widget, 'error') === undefined, 'a zero error chip should stay out of the header')
check(text(widget).includes('Rebuilt the index'), 'an unread finished project should start expanded')
check(collectByClass(widget, 'dsb-newBadge').length === 0, 'no duplicated “new” text badge should remain')
check(collectByClass(widget, 'dsb-count').some(node => node.props['data-tone'] === 'unread'), 'the project should show a green unread count')
const unreadChats = collectByClass(widget, 'dsb-chat').filter(node => node.props['data-unread'] === 'true')
check(unreadChats.length >= 1, 'the unread finished chat should be marked, got ' + unreadChats.length)
check(chipByTone(widget, 'unread')?.props['data-tone'] === 'unread', 'the unread chip should be separate from the read chip')
check(chipByTone(widget, 'finished')?.props['data-tone'] === 'finished', 'the read chip should be separate from the unread chip')

/* ---------- error colour plumbing ---------- */

statuses.set('s-other', { running: false, failed: true, completionUnread: true })
const failedView = renderFooter()
check(text(failedView).includes('ошибка'), 'a failed chat should show the error label')
check(chipByTone(failedView, 'error')?.props['data-tone'] === 'error', 'a failed chat should produce the error chip')
check(chipByTone(failedView, 'unread') === undefined, 'the unread chip should disappear while the only unread chat is failed')
check(collectByClass(failedView, 'dsb-dot').some(node => node.props['data-tone'] === 'error'), 'a failed chat should use the error dot')
check(collectByClass(failedView, 'dsb-count').some(node => node.props['data-tone'] === 'error'), 'a project with a failed chat should show an error count')
statuses.set('s-other', { running: false, completionUnread: true })

/* ---------- inline approval ---------- */

check(collectByClass(widget, 'dsb-approval').length === 1, 'a pending approval should render the approval banner')
check(collectByClass(widget, 'dsb-approvalDot').length === 1, 'a pending approval should mark the widget title')
check(text(widget).includes('Требуется разрешение: alpha'), 'the approval banner should name the workspace')
check(text(widget).includes('Generated the report · shell'), 'the approval banner should name the chat and tool in the second line')
const allowButton = collectByClass(widget, 'dsb-approvalAllow')[0]
const rejectButton = collectByClass(widget, 'dsb-approvalReject')[0]
check(allowButton !== undefined && rejectButton !== undefined, 'the approval banner should offer allow and reject')
allowButton.props.onClick()
check(approvalAnswers[0] === 'allowed-once', 'the allow button should answer allowed-once, got ' + JSON.stringify(approvalAnswers))
rejectButton.props.onClick()
check(approvalAnswers[1] === 'rejected', 'the reject button should answer rejected, got ' + JSON.stringify(approvalAnswers))

/* ---------- sort control is a choice, not a cycle ---------- */

const sortButton = collectByClass(widget, 'dsb-footSort')[0]
check(sortButton !== undefined, 'the widget should render a sort button')
check(sortButton?.props['aria-expanded'] === 'false', 'the sort menu should start closed')
sortButton.props.onClick()
const openMenu = renderFooter()
const menuItems = collectByClass(openMenu, 'dsb-menuItem')
check(menuItems.length === 4, 'the sort menu should offer four modes, got ' + menuItems.length)
check(collectByClass(openMenu, 'dsb-footSort')[0].props['aria-expanded'] === 'true', 'the sort menu should report itself open')
const byNameItem = menuItems.find(item => render(item).join('').includes('По названию'))
check(byNameItem !== undefined, 'the sort menu should include the name mode')
byNameItem.props.onClick()
const byName = renderFooter()
const collate = (left, right) => left.localeCompare(right, undefined, { numeric: true, sensitivity: 'base' })
const expectedNames = ['alpha', 'beta', 'Без проекта'].sort(collate)
check(JSON.stringify(projectNames(byName)) === JSON.stringify(expectedNames), 'name ordering wrong: ' + JSON.stringify(projectNames(byName)) + ' vs ' + JSON.stringify(expectedNames))
check(collectByClass(byName, 'dsb-menu').length === 0, 'selecting a sort mode should close the menu')
footProps.sort.set('chats')
const byChats = renderFooter()
check(projectNames(byChats)[0] === 'alpha', 'chat-count ordering should lead with the project holding most chats, got ' + JSON.stringify(projectNames(byChats)))
footProps.sort.set('state')

/* ---------- status visibility: independent toggles ---------- */

widget = renderFooter()
const finished = chipByTone(widget, 'finished')
finished.props.onClick()
const withoutFinished = renderFooter()
check(projectNames(withoutFinished).length === 2, 'hiding read finished chats should keep the waiting and unread projects, got ' + projectNames(withoutFinished).length)
check(JSON.stringify(projectNames(withoutFinished)) === JSON.stringify(['alpha', 'beta']), 'the remaining projects should be alpha and beta, got ' + JSON.stringify(projectNames(withoutFinished)))
check(chipByTone(withoutFinished, 'finished')?.props['data-visible'] === 'false', 'read chip should report hidden')
check(chipByTone(withoutFinished, 'unread')?.props['data-visible'] === 'true', 'hiding read finished must not hide unread')
check(chipByTone(withoutFinished, 'attention')?.props['data-visible'] === 'true', 'hiding read finished must not hide attention')
check(chipByTone(withoutFinished, 'running')?.props['data-visible'] === 'true', 'hiding read finished must not hide running')
check(JSON.stringify(chipCounts(withoutFinished)) === JSON.stringify(['1', '1', '1', '1']), 'chip counters should keep their totals while a status is hidden')

chipByTone(withoutFinished, 'unread').props.onClick()
const withoutUnread = renderFooter()
check(projectNames(withoutUnread).length === 1, 'hiding unread chats should leave only the project with visible chats, got ' + projectNames(withoutUnread).length)
check(projectNames(withoutUnread)[0] === 'alpha', 'the remaining project should be alpha, got ' + JSON.stringify(projectNames(withoutUnread)))
check(chipByTone(withoutUnread, 'unread')?.props['data-visible'] === 'false', 'unread chip should report hidden')
check(chipByTone(withoutUnread, 'finished')?.props['data-visible'] === 'false', 'read chip should stay hidden')

chipByTone(withoutUnread, 'attention').props.onClick()
const withoutAttention = renderFooter()
check(projectNames(withoutAttention).length === 1, 'hiding attention should leave the running project, got ' + projectNames(withoutAttention).length)
check(chipByTone(withoutAttention, 'attention')?.props['data-visible'] === 'false', 'attention chip should report hidden')

chipByTone(withoutAttention, 'running').props.onClick()
const emptyView = renderFooter()
check(projectNames(emptyView).length === 0, 'hiding every status with chats should empty the list')
check(text(emptyView).includes('Нет чатов с выбранными статусами'), 'empty visibility state should explain itself')
check(chips(emptyView).length === 4, 'chips must remain while the list is empty')
const allControl = collectByClass(emptyView, 'dsb-footAll')[0]
check(allControl !== undefined, 'the All reset should remain available')
allControl.props.onClick()
const restoredAll = renderFooter()
check(projectNames(restoredAll).length === 3, 'the All reset should restore every status, got ' + projectNames(restoredAll).length)
for (const tone of ['attention', 'running', 'unread', 'finished']) {
  check(chipByTone(restoredAll, tone)?.props['data-visible'] === 'true', `${tone} should be visible after All reset`)
}

/* ---------- expansion and name jump ---------- */

const chevrons = collectByClass(restoredAll, 'dsb-projectChevron')
check(chevrons.length === 3, 'every project row should carry an expand control, got ' + chevrons.length)
chevrons[2].props.onClick()
const expandedSecond = renderFooter()
check(text(expandedSecond).includes('Loose session'), 'expanding the third project should reveal its chat')
check(opened.sessions.length === 0, 'expanding must not navigate')

const openers = collectByClass(expandedSecond, 'dsb-projectOpen')
check(openers.length === 3, 'every project name should open its newest chat, got ' + openers.length)
openers[0].props.onClick()
check(opened.sessions.length === 1, 'name click must open one chat, got ' + JSON.stringify(opened.sessions))
check(opened.sessions[0] === 's-done', 'name click should open the waiting chat first, got ' + opened.sessions[0])
opened.sessions.length = 0

/* ---------- collapse to a status strip and restore ---------- */

const titleControl = collectByClass(expandedSecond, 'dsb-footTitle')[0]
check(titleControl !== undefined, 'the widget title should act as the collapse control')
titleControl.props.onClick()
const collapsed = renderFooter()
check(collectByClass(collapsed, 'dsb-project').length === 0, 'collapsed widget must hide the project list')
check(chips(collapsed).length === 4, 'collapsed strip must keep the non-zero counters')
check(collectByClass(collapsed, 'dsb-footSort').length === 0, 'collapsed strip should hide the sort control')
check(collectByClass(collapsed, 'dsb-footAll').length === 0, 'collapsed strip should hide the filter reset')
check(collectByClass(collapsed, 'dsb-footExpandAll').length === 0, 'collapsed strip should hide expand-all')
check(text(collapsed).includes('Проекты'), 'collapsed strip should keep its title')
check(collectByClass(collapsed, 'dsb-footTitle')[0].props['aria-expanded'] === 'false', 'collapsed title should report itself collapsed')

/* a counter click while collapsed expands and toggles that status */
const collapsedFinished = chipByTone(collapsed, 'finished')
collapsedFinished.props.onClick()
const expandedByChip = renderFooter()
check(collectByClass(expandedByChip, 'dsb-project').length === 2, 'a counter click in the strip should expand with its visibility applied, got ' + collectByClass(expandedByChip, 'dsb-project').length)
check(chipByTone(expandedByChip, 'finished')?.props['data-visible'] === 'false', 'the strip counter should toggle its status')
collectByClass(expandedByChip, 'dsb-footAll')[0].props.onClick()
const backToAll = renderFooter()
check(projectNames(backToAll).length === 3, 'the All reset should clear the strip filter')

/* ---------- persistence ---------- */

chipByTone(backToAll, 'finished').props.onClick()
renderFooter()
check(storage.get('projects-board:visible') !== undefined, 'visibility should persist under the plugin prefix')
hookStates.length = 0
const remounted = renderFooter()
check(projectNames(remounted).length === 2, 'a remount should read the saved visibility, got ' + projectNames(remounted).length)
check(chipByTone(remounted, 'finished')?.props['data-visible'] === 'false', 'the remount should keep read finished hidden')
collectByClass(remounted, 'dsb-footAll')[0].props.onClick()
renderFooter()

/* ---------- expand all / collapse all ---------- */

const beforeExpandAll = renderFooter()
const expandAllControl = collectByClass(beforeExpandAll, 'dsb-footExpandAll')[0]
check(expandAllControl !== undefined, 'the widget should render an expand-all control')
const expandedCount = element =>
  collectByClass(element, 'dsb-projectChevron').filter(node => node.props['aria-expanded'] === 'true').length
check(expandedCount(beforeExpandAll) === 2, 'default expansion should open the waiting and unread projects, got ' + expandedCount(beforeExpandAll))
expandAllControl.props.onClick()
const allOpen = renderFooter()
check(expandedCount(allOpen) === 3, 'expand-all should open every project, got ' + expandedCount(allOpen))
check(collectByClass(allOpen, 'dsb-footExpandAll')[0].props['aria-pressed'] === 'true', 'expand-all should report all projects open')
const allExpandedIcon = collectByClass(allOpen, 'dsb-expandAllIcon')[0]
check(allExpandedIcon?.props['data-all-expanded'] === 'true', 'the all-expanded icon should report its state')
check(allExpandedIcon?.children?.[0]?.props?.d === 'M2.5 3.4L6 6.9l3.5-3.5', 'the all-expanded icon should point down')
collectByClass(allOpen, 'dsb-footExpandAll')[0].props.onClick()
const allClosed = renderFooter()
check(expandedCount(allClosed) === 0, 'collapse-all should close every project, got ' + expandedCount(allClosed))
check(collectByClass(allClosed, 'dsb-footExpandAll')[0].props['aria-pressed'] === 'false', 'collapse-all should report every project closed')
const allCollapsedIcon = collectByClass(allClosed, 'dsb-expandAllIcon')[0]
check(allCollapsedIcon?.props['data-all-expanded'] === 'false', 'the all-collapsed icon should report its state')
check(allCollapsedIcon?.children?.[0]?.props?.d === 'M2.5 8.6L6 5.1l3.5 3.5', 'the all-collapsed icon should point up')

/* ---------- live status updates ---------- */

statuses.set('s-done', { running: true, completionUnread: false })
const afterAttentionCleared = renderFooter()
check(chipByTone(afterAttentionCleared, 'attention') === undefined, 'the zero attention chip should be hidden')
check(projectNames(afterAttentionCleared).length === 3, 'projects should stay listed after a status update')
statuses.set('s-done', { running: false, pendingInteraction: approvalRequest, completionUnread: false })

/* ---------- rail and empty install ---------- */

check(footRegistration.component({ ...footProps, wide: false }) === null, 'footer widget should stay out of a narrow rail')

const emptySessions = createStore({ ids: [], byId: {}, phase: 'ready', projectionsBySession: {} })
const emptyWorkspaces = createStore({ items: [], archivedSessionIds: [], pinnedSessionIds: [], state: 'ready', phase: 'ready', error: null })
const emptyRegistrations = []
const emptyCtx = {
  ...ctx,
  sessions: { list: emptySessions },
  workspaces: { list: emptyWorkspaces },
  slots: {
    inject: (_key, callback) => {
      callback()
    },
    register: (options, component) => {
      emptyRegistrations.push({ options, component })
    },
  },
}
const emptyPlugin = factory(localRequire)
emptyPlugin.apply(emptyCtx)
check(emptyRegistrations.length === 3, 'empty install should register the footer and the settings section, got ' + emptyRegistrations.length)
const emptyFoot = emptyRegistrations.find(entry => entry.options.name === 'sidebar.footer.action')
check(emptyFoot.component({ ...emptyFoot.options.inject(), useSessionStatus, wide: true }) === null, 'empty install must hide the footer widget')

/* ---------- settings section ---------- */

const settingsProps = { ...settingsRegistration.options.inject() }
hookStates.length = 0
const settingsElement = settingsRegistration.component({ ...settingsProps })
const settingsText = text(settingsElement)
for (const label of ['Виджет проектов', 'Сортировка', 'Счётчики', 'Видимые статусы', 'Непрочитанные завершения', 'Ошибки', 'Только активный нейтральный проект', 'Счётчик непрочитанных', 'Разрешать из виджета']) {
  check(settingsText.includes(label), 'settings section should render ' + label)
}
check(collectByClass(settingsElement, 'pws-seg').length === 2, 'settings should offer two segmented controls')
check(collectByClass(settingsElement, 'pws-switch').length === 10, 'settings should offer ten switches, got ' + collectByClass(settingsElement, 'pws-switch').length)
check(collectByClass(settingsElement, 'pws-reset').length === 1, 'settings should offer a reset action')
const settingsSortItems = collectByClass(settingsElement, 'pws-segItem')
const settingsByNameItem = settingsSortItems.find(item => String(item.children[0]) === 'По названию')
check(settingsByNameItem !== undefined, 'settings should offer the name sort mode')
settingsByNameItem.props.onClick()
check(settingsProps.sort.getSnapshot() === 'name', 'settings sort choice should update the shared sort store')
settingsProps.sort.set('state')
const settingsSwitches = collectByClass(settingsElement, 'pws-switch')
const accordionSwitch = settingsSwitches.find(button => button.props['aria-label'] === 'Только активный нейтральный проект')
check(accordionSwitch !== undefined, 'settings should expose the accordion switch')
accordionSwitch.props.onClick()
check(settingsProps.prefs.getSnapshot().accordion === false, 'accordion switch should update preferences')
settingsProps.prefs.update({ accordion: true })
const finishedSwitch = settingsSwitches.find(button => button.props['aria-label'] === 'Завершены и прочитаны')
const finishedBefore = settingsProps.visible.getSnapshot().finished
finishedSwitch.props.onClick()
check(settingsProps.visible.getSnapshot().finished === !finishedBefore, 'status switch should toggle visibility')
settingsProps.visible.reset()

/* ---------- sticky waiting/unread projects; manual rows stay ---------- */

const accordion = mountFooter()
const expandedStates = element =>
  collectByClass(element, 'dsb-projectChevron').map(node => node.props['aria-expanded'] === 'true')
check(JSON.stringify(expandedStates(accordion)) === JSON.stringify([true, true, false]), 'initial expansion should show waiting and unread projects')
collectByClass(accordion, 'dsb-projectOpen')[1].props.onClick()
const afterSecondOpen = renderFooter()
check(JSON.stringify(expandedStates(afterSecondOpen)) === JSON.stringify([true, true, false]), 'opening an unread project must keep the waiting project expanded')
collectByClass(afterSecondOpen, 'dsb-projectOpen')[2].props.onClick()
const afterThirdOpen = renderFooter()
check(JSON.stringify(expandedStates(afterThirdOpen)) === JSON.stringify([true, true, true]), 'opening a neutral project must keep waiting and unread projects expanded')

collectByClass(afterThirdOpen, 'dsb-projectChevron')[0].props.onClick()
const collapsedWaiting = renderFooter()
check(expandedStates(collapsedWaiting)[0] === false, 'the chevron should still allow a manual collapse')
collectByClass(collapsedWaiting, 'dsb-projectOpen')[1].props.onClick()
const afterManualCollapse = renderFooter()
check(JSON.stringify(expandedStates(afterManualCollapse)) === JSON.stringify([false, true, false]), 'a manually collapsed waiting project should stay collapsed while another opens')
collectByClass(afterManualCollapse, 'dsb-projectOpen')[0].props.onClick()
const reopenedWaiting = renderFooter()
check(JSON.stringify(expandedStates(reopenedWaiting)) === JSON.stringify([true, true, false]), 'clicking its name should reopen the waiting project')

collectByClass(reopenedWaiting, 'dsb-projectChevron')[2].props.onClick()
const manualNeutral = renderFooter()
check(expandedStates(manualNeutral)[2] === true, 'the chevron should manually expand a neutral project')
collectByClass(manualNeutral, 'dsb-projectOpen')[1].props.onClick()
const manualSwitch = renderFooter()
check(JSON.stringify(expandedStates(manualSwitch)) === JSON.stringify([true, true, true]), 'a manually expanded project should survive switching')

settingsProps.prefs.update({ accordion: false })
const multi = mountFooter()
collectByClass(multi, 'dsb-projectOpen')[1].props.onClick()
const multiFirst = renderFooter()
collectByClass(multiFirst, 'dsb-projectOpen')[2].props.onClick()
const multiSecond = renderFooter()
check(expandedStates(multiSecond).filter(Boolean).length === 3, 'with the accordion off, projects opened through their names should stay open')
settingsProps.prefs.update({ accordion: true })

/* ---------- cleanup ---------- */

for (const dispose of effects) {
  if (typeof dispose === 'function') dispose()
}

if (failures.length > 0) {
  console.error('FAIL')
  for (const failure of failures) console.error(' - ' + failure)
  process.exit(1)
}
console.log('PASS: widget-only registration, settings section, status categories and colour mapping (blue permission, yellow running, green unread, red error, grey inactive), error plumbing, inline approval banner with allow-once/reject, unread-finish marker and auto-expand, independent visibility filters, sort choice, expand-all/collapse-all, accordion plus manual rows, collapse-to-strip with state restore, expansion, name-jump, persistence, rail and empty states')
