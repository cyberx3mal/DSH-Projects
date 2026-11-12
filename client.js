/**
 * Browser half of the projects board.
 *
 * A left-sidebar entry (`sidebar.panellist`) opens the full board page, and an
 * always-visible compact widget in the sidebar foot (`sidebar.footer.action`)
 * lists every project with its chats. Both read the live Client Session and
 * Workspace projections plus the renderer's session-status hook, so a project
 * shows whether it is running, waiting for the user, or finished.
 */
window.__ModuleLoader__.load({
  id: '@local/projects-board',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    const NS = 'projectsBoard'
    const TICK_MS = 30000
    const MINUTE = 60000
    const HOUR = 3600000
    const DAY = 86400000
    const ATTENTION_KINDS = ['approval', 'plan-review', 'question']
    const STATE_TONE = { attention: 'attention', running: 'running', error: 'error', unread: 'unread', finished: 'finished' }
    const SORT_KEY = 'projects-board:sort'
    const COLLAPSE_KEY = 'projects-board:collapsed'
    const VISIBLE_KEY = 'projects-board:visible'
    const PREFS_KEY = 'projects-board:settings'
    const ALL_VISIBLE = { attention: true, running: true, unread: true, error: true, finished: true }
    const COUNT_MODES = ['projects', 'chats']
    const DEFAULT_PREFS = {
      countMode: 'projects',
      autoExpandAttention: true,
      autoExpandUnread: true,
      accordion: true,
      showUnreadBadge: true,
      inlineApprovals: true,
    }
    const SORTS = ['state', 'activity', 'name', 'chats']
    const SORT_LABEL_KEYS = { state: 'sortState', activity: 'sortActivity', name: 'sortName', chats: 'sortChats' }
    const TIP_KEYS = { attention: 'tipAttention', running: 'tipRunning', unread: 'tipUnread', error: 'tipError', finished: 'tipFinished' }
    const TIP_CHAT_KEYS = {
      attention: 'tipAttentionChats',
      running: 'tipRunningChats',
      unread: 'tipUnreadChats',
      error: 'tipErrorChats',
      finished: 'tipFinishedChats',
    }

    const dictionaries = {
      en: {
        panel: 'Projects',
        title: 'Projects board',
        subtitle: 'Live view of every project: chats that are running, chats that wait for you, and chats where the model finished writing.',
        attentionSection: 'Waiting for you',
        runningSection: 'Running now',
        finishedSection: 'Finished',
        attentionCount: 'Need you: {count}',
        runningCount: 'Running: {count}',
        finishedCount: 'Finished: {count}',
        projectsCount: 'Projects: {count}',
        openProject: 'Open project',
        openBadge: 'Open',
        chipAll: 'All',
        chipRunning: 'Running',
        chipAttention: 'Waiting',
        chipUnread: 'Unread',
        chipError: 'Errors',
        chipFinished: 'Read',
        hideStatus: 'Hide {status}',
        showStatus: 'Show {status}',
        showAllStatuses: 'Show all statuses',
        expandAll: 'Expand all projects',
        collapseAll: 'Collapse all projects',
        unreadHint: 'Finished, not read yet',
        tipUnread: 'Unread finished chats: {count}',
        emptyStatuses: 'No chats match the selected statuses.',
        emptyAttention: 'Nothing waits for your answer.',
        emptyRunning: 'Nothing is running right now.',
        emptyFinished: 'Nothing has finished yet.',
        emptyAll: 'No projects yet. Add a workspace and its chats appear here.',
        emptyFilter: 'Nothing in this category yet.',
        loading: 'Reading project data…',
        justNow: 'just now',
        minutesAgo: '{count} min ago',
        hoursAgo: '{count} h ago',
        daysAgo: '{count} d ago',
        stateRunning: 'running',
        stateFinished: 'done',
        stateError: 'error',
        stateOpen: 'open',
        pendingApproval: 'permission',
        pendingPlan: 'plan review',
        pendingQuestion: 'answer',
        expandProject: 'Show chats of {project}',
        collapseProject: 'Hide chats of {project}',
        openNewestChat: 'Open the most recent chat of {project}',
        chatCount: '{count} chats',
        noTitle: 'Untitled chat',
        noProject: 'No project',
        hereBadge: 'you are here',
        collapseWidget: 'Collapse projects',
        expandWidget: 'Expand projects',
        tipAttention: 'Projects waiting for you: {count}',
        tipRunning: 'Running projects: {count}',
        tipFinished: 'Read finished projects: {count}',
        tipAttentionChats: 'Chats waiting for you: {count}',
        tipRunningChats: 'Running chats: {count}',
        tipFinishedChats: 'Read finished chats: {count}',
        tipUnread: 'Projects with unread finishes: {count}',
        tipUnreadChats: 'Unread finished chats: {count}',
        tipError: 'Projects with errors: {count}',
        tipErrorChats: 'Chats with errors: {count}',
        approvalNeededProject: 'Permission needed: {project}',
        approvalNeededGeneric: 'Permission needed',
        approvalAllow: 'Allow once',
        approvalReject: 'Reject',
        approvalMore: '+{count} more',
        approvalFailed: 'Could not answer the approval request.',
        'settings.inlineApprovals': 'Answer approvals from the widget',
        'settings.inlineApprovalsHint': 'Show Allow once / Reject in the strip. “Always allow” stays in the chat.',
        sortLabel: 'Sorting',
        sortState: 'Active first',
        sortActivity: 'Last activity',
        sortName: 'Name',
        sortChats: 'Chat count',
        sortHint: 'Sorting: {mode}. Click to change.',
        'settings.nav': 'Projects',
        'settings.title': 'Projects widget',
        'settings.subtitle': 'How the sidebar projects strip looks and behaves.',
        'settings.local': 'Preferences are stored in this browser.',
        'settings.sort': 'Sorting',
        'settings.sortHint': 'Applied to the widget and remembered; the compact control changes it too.',
        'settings.counts': 'Counter unit',
        'settings.countsHint': 'Count projects or individual chats in the three status counters.',
        'settings.counts.projects': 'Projects',
        'settings.counts.chats': 'Chats',
        'settings.statuses': 'Visible statuses',
        'settings.statusesHint': 'The same visibility toggles as the three counters in the widget.',
        'settings.attention': 'Waiting',
        'settings.running': 'Running',
        'settings.unread': 'Unread finishes',
        'settings.error': 'Errors',
        'settings.finished': 'Finished and read',
        'settings.autoExpandAttention': 'Keep projects waiting for you expanded',
        'settings.autoExpandUnread': 'Keep projects with unread finishes expanded',
        'settings.autoExpandHint': 'Such projects stay expanded even when another project is open, until you collapse them with the chevron or turn this off.',
        'settings.accordion': 'Only active neutral projects',
        'settings.accordionHint': 'Opening a neutral project collapses the other neutral ones; waiting, unread and error projects stay expanded unless collapsed with the chevron.',
        'settings.unreadBadge': 'Unread counter',
        'settings.unreadBadgeHint': 'Show a green unread count on a project. Unread chats keep their green dot and bold title.',
        'settings.reset': 'Reset to defaults',
      },
      ru: {
        panel: 'Проекты',
        title: 'Дашборд проектов',
        subtitle: 'Живой обзор проектов: какие чаты работают, какие ждут вашего решения и где нейросеть уже закончила писать.',
        attentionSection: 'Требуют вас',
        runningSection: 'Работают сейчас',
        finishedSection: 'Нейросеть закончила',
        attentionCount: 'Требуют ответа: {count}',
        runningCount: 'Работают: {count}',
        finishedCount: 'Завершено: {count}',
        projectsCount: 'Проектов: {count}',
        openProject: 'Открыть проект',
        openBadge: 'Открыт',
        chipAll: 'Все',
        chipRunning: 'Работают',
        chipAttention: 'Ждут',
        chipUnread: 'Новые',
        chipError: 'Ошибки',
        chipFinished: 'Прочитанные',
        hideStatus: 'Скрыть: {status}',
        showStatus: 'Показать: {status}',
        showAllStatuses: 'Показать все статусы',
        expandAll: 'Развернуть все проекты',
        collapseAll: 'Свернуть все проекты',
        unreadHint: 'Завершено, но не прочитано',
        tipUnread: 'Непрочитанных завершённых чатов: {count}',
        emptyStatuses: 'Нет чатов с выбранными статусами.',
        emptyAttention: 'Ничего не ждёт вашего ответа.',
        emptyRunning: 'Сейчас ничего не выполняется.',
        emptyFinished: 'Пока нет завершённых ответов.',
        emptyAll: 'Проектов пока нет. Добавьте рабочую папку — её чаты появятся здесь.',
        emptyFilter: 'В этой категории пока пусто.',
        loading: 'Читаю данные о проектах…',
        justNow: 'только что',
        minutesAgo: '{count} мин назад',
        hoursAgo: '{count} ч назад',
        daysAgo: '{count} дн назад',
        stateRunning: 'работает',
        stateFinished: 'готово',
        stateError: 'ошибка',
        stateOpen: 'открыт',
        pendingApproval: 'разрешение',
        pendingPlan: 'план',
        pendingQuestion: 'ответ',
        expandProject: 'Показать чаты проекта {project}',
        collapseProject: 'Скрыть чаты проекта {project}',
        openNewestChat: 'Открыть последнюю активную сессию проекта {project}',
        chatCount: 'Чатов: {count}',
        noTitle: 'Без названия',
        noProject: 'Без проекта',
        hereBadge: 'вы здесь',
        collapseWidget: 'Свернуть проекты',
        expandWidget: 'Развернуть проекты',
        tipAttention: 'Проектов, ждущих вашего ответа: {count}',
        tipRunning: 'Работающих проектов: {count}',
        tipFinished: 'Прочитанных завершённых проектов: {count}',
        tipAttentionChats: 'Чатов, ждущих вашего ответа: {count}',
        tipRunningChats: 'Работающих чатов: {count}',
        tipFinishedChats: 'Прочитанных завершённых чатов: {count}',
        tipUnread: 'Проектов с непрочитанными завершениями: {count}',
        tipUnreadChats: 'Непрочитанных завершённых чатов: {count}',
        tipError: 'Проектов с ошибками: {count}',
        tipErrorChats: 'Чатов с ошибкой: {count}',
        approvalNeededProject: 'Требуется разрешение: {project}',
        approvalNeededGeneric: 'Требуется разрешение',
        approvalAllow: 'Разрешить один раз',
        approvalReject: 'Отклонить',
        approvalMore: 'ещё {count}',
        approvalFailed: 'Не удалось ответить на запрос разрешения.',
        'settings.inlineApprovals': 'Разрешать из виджета',
        'settings.inlineApprovalsHint': 'Показывать «Разрешить один раз» / «Отклонить» в полоске. «Всегда разрешать» остаётся в чате.',
        sortLabel: 'Сортировка',
        sortState: 'Сначала активные',
        sortActivity: 'По активности',
        sortName: 'По названию',
        sortChats: 'По числу чатов',
        sortHint: 'Сортировка: {mode}. Нажмите, чтобы сменить.',
        'settings.nav': 'Проекты',
        'settings.title': 'Виджет проектов',
        'settings.subtitle': 'Как выглядит и ведёт себя полоска проектов в боковой панели.',
        'settings.local': 'Настройки хранятся в этом браузере.',
        'settings.sort': 'Сортировка',
        'settings.sortHint': 'Применяется к виджету и запоминается; компактный контрол тоже меняет её.',
        'settings.counts': 'Счётчики',
        'settings.countsHint': 'Считать проекты или отдельные чаты в трёх счётчиках статусов.',
        'settings.counts.projects': 'Проекты',
        'settings.counts.chats': 'Чаты',
        'settings.statuses': 'Видимые статусы',
        'settings.statusesHint': 'Те же переключатели, что и три счётчика в виджете.',
        'settings.attention': 'Ждут',
        'settings.running': 'Работают',
        'settings.unread': 'Непрочитанные завершения',
        'settings.error': 'Ошибки',
        'settings.finished': 'Завершены и прочитаны',
        'settings.autoExpandAttention': 'Держать развёрнутыми проекты, ждущие ответа',
        'settings.autoExpandUnread': 'Держать развёрнутыми проекты с непрочитанными завершениями',
        'settings.autoExpandHint': 'Такие проекты остаются развёрнутыми, даже когда открыт другой проект, пока вы не свернёте их стрелочкой или не выключите эту настройку.',
        'settings.accordion': 'Только активный нейтральный проект',
        'settings.accordionHint': 'Открытие нейтрального проекта сворачивает остальные нейтральные; ждущие, непрочитанные и ошибки остаются развёрнутыми, если не свернуть их стрелочкой.',
        'settings.unreadBadge': 'Счётчик непрочитанных',
        'settings.unreadBadgeHint': 'Показывать зелёный счётчик непрочитанных у проекта. У чатов остаются зелёная точка и жирный заголовок.',
        'settings.reset': 'Сбросить настройки',
      },
    }

    /* ------------------------------------------------------------------ *
     * Reading the Client projections
     * ------------------------------------------------------------------ */

    /**
     * Read a service's snapshot store defensively.
     * @param service - Client service carrying a `list` store, or undefined.
     * @returns the store snapshot, or undefined.
     */
    function readStore(service) {
      const store = service && service.list
      if (!store || typeof store.getSnapshot !== 'function') return undefined
      try {
        return store.getSnapshot()
      } catch (error) {
        console.error('[projects-board] snapshot', error)
        return undefined
      }
    }

    /**
     * Subscribe to a service's snapshot store defensively.
     * @param service - Client service carrying a `list` store, or undefined.
     * @param listener - invalidation callback.
     * @returns an unsubscribe function when subscription succeeded.
     */
    function subscribeStore(service, listener) {
      const store = service && service.list
      if (!store || typeof store.subscribe !== 'function') return undefined
      try {
        const off = store.subscribe(listener)
        return typeof off === 'function' ? off : undefined
      } catch (error) {
        console.error('[projects-board] subscribe', error)
        return undefined
      }
    }

    /**
     * Shorten a project path for display.
     * @param value - absolute directory path.
     * @returns the display path.
     */
    function displayPath(value) {
      if (typeof value !== 'string' || value === '') return ''
      const home = value.replace(/^[A-Za-z]:[\\/]+Users[\\/]+[^\\/]+/i, '~')
      return home.replace(/^\/Users\/[^/]+/, '~')
    }

    /**
     * Last path segment of a project directory.
     * @param value - directory path.
     * @returns the final segment, or the input.
     */
    function lastSegment(value) {
      if (typeof value !== 'string' || value === '') return ''
      const parts = value.split(/[\\/]+/).filter(Boolean)
      return parts.length > 0 ? parts[parts.length - 1] : value
    }

    /**
     * Build the raw per-project chat list from the Session and Workspace projections.
     * @param ctx - Client context carrying the injected services.
     * @param tr - translate function bound to the plugin namespace.
     * @returns raw board data: every visible chat grouped by project, newest first.
     */
    function readBoard(ctx, tr) {
      const sessions = readStore(ctx.sessions)
      const workspaces = readStore(ctx.workspaces)
      const byId = (sessions && sessions.byId) || {}
      const sessionIds = (sessions && sessions.ids) || []
      const archived = new Set((workspaces && workspaces.archivedSessionIds) || [])
      const pinned = new Set((workspaces && workspaces.pinnedSessionIds) || [])
      const claimed = new Set()

      /**
       * Detached chat entry for one Session row.
       * @param row - Client session list row.
       * @returns the entry, or undefined when the row is not a visible ordinary chat.
       */
      const entryOf = row => {
        if (row === undefined) return undefined
        if (row.origin === 'subagent' || row.parentId !== undefined) return undefined
        if (row.blank === true) return undefined
        if (archived.has(row.id)) return undefined
        return {
          sessionId: row.id,
          title: row.displayTitle || row.title || tr('noTitle'),
          updatedAt: typeof row.updatedAt === 'number' ? row.updatedAt : 0,
          open: (row.retainedBy && (row.retainedBy.mainView || 0) > 0) || false,
          pinned: pinned.has(row.id),
          listRunning: row.running === true,
          listFailed:
            row.failed === true ||
            row.state === 'error' ||
            row.state === 'failed' ||
            row.phase === 'error' ||
            (row.error !== undefined && row.error !== null && row.error !== false),
        }
      }

      const newest = (left, right) => right.updatedAt - left.updatedAt
      const projects = []
      for (const workspace of (workspaces && workspaces.items) || []) {
        const project = {
          key: String(workspace.workspaceId),
          workspaceId: workspace.workspaceId,
          title: workspace.title || lastSegment(workspace.path) || tr('noProject'),
          path: displayPath(workspace.path),
          sessions: [],
        }
        for (const id of workspace.sessionIds || []) {
          claimed.add(id)
          const entry = entryOf(byId[id])
          if (entry !== undefined) project.sessions.push(entry)
        }
        project.sessions.sort(newest)
        if (project.sessions.length > 0) projects.push(project)
      }

      const loose = { key: 'loose', workspaceId: null, title: tr('noProject'), path: '', sessions: [] }
      for (const id of sessionIds) {
        if (claimed.has(id)) continue
        const entry = entryOf(byId[id])
        if (entry !== undefined) loose.sessions.push(entry)
      }
      loose.sessions.sort(newest)
      if (loose.sessions.length > 0) projects.push(loose)

      return {
        projects,
        projectCount: projects.length,
        ready: Boolean(sessions) && Boolean(workspaces),
      }
    }

    /**
     * Classify one chat with the renderer's live session status.
     * @param entry - raw chat entry.
     * @param statuses - session status map keyed by Session id, or undefined.
     * @param tr - translate function.
     * @returns the chat entry carrying its state and state label.
     */
    function classify(entry, statuses, tr) {
      const status = statuses && typeof statuses.get === 'function' ? statuses.get(entry.sessionId) : undefined
      const pendingInteraction = status && status.pendingInteraction
      const kind = pendingInteraction ? pendingInteraction.kind : undefined
      const pending = ATTENTION_KINDS.includes(kind) ? kind : undefined
      const running = (status && status.running) === true || ((status === undefined || status.running === undefined) && entry.listRunning)
      const failed =
        entry.listFailed === true ||
        Boolean(
          status &&
            (status.failed === true ||
              status.state === 'error' ||
              status.state === 'failed' ||
              status.phase === 'error' ||
              (status.error !== undefined && status.error !== null && status.error !== false)),
        )
      const unread = (status && status.completionUnread) === true
      const state = pending !== undefined ? 'attention' : running ? 'running' : 'finished'
      const tone = pending !== undefined ? 'attention' : failed ? 'error' : unread ? 'unread' : running ? 'running' : 'finished'
      const label =
        pending !== undefined
          ? tr(pending === 'approval' ? 'pendingApproval' : pending === 'plan-review' ? 'pendingPlan' : 'pendingQuestion')
          : failed
            ? tr('stateError')
            : running
              ? tr('stateRunning')
              : tr('stateFinished')
      return { ...entry, state, tone, pending, pendingInteraction, running, unread, failed, label }
    }

    /**
     * Derive the board view: per-project chat groups, filter groups, counts.
     * @param raw - raw board data.
     * @param statuses - session status map, or undefined.
     * @param tr - translate function.
     * @param sortMode - project ordering: `state`, `activity`, `name`, or `chats`.
     * @returns the derived view.
     */
    function deriveBoard(raw, statuses, tr, sortMode, visible = ALL_VISIBLE) {
      const stateRank = { attention: 0, running: 1, finished: 2 }
      const compareSessions = (left, right) => {
        if (sortMode === 'name') return left.title.localeCompare(right.title, undefined, { numeric: true, sensitivity: 'base' })
        if (sortMode === 'activity') return right.updatedAt - left.updatedAt
        if (left.state !== right.state) return stateRank[left.state] - stateRank[right.state]
        if (left.state === 'finished') {
          const leftRank = left.failed ? 0 : left.unread ? 1 : 2
          const rightRank = right.failed ? 0 : right.unread ? 1 : 2
          if (leftRank !== rightRank) return leftRank - rightRank
        }
        return right.updatedAt - left.updatedAt
      }
      const projects = raw.projects.map(project => {
        const allSessions = project.sessions.map(entry => classify(entry, statuses, tr))
        allSessions.sort(compareSessions)
        const sessions = allSessions.filter(entry => visible[entry.tone] !== false)
        const attention = sessions.filter(entry => entry.tone === 'attention')
        const running = sessions.filter(entry => entry.tone === 'running')
        const failed = sessions.filter(entry => entry.tone === 'error')
        const unread = sessions.filter(entry => entry.tone === 'unread')
        const finished = sessions.filter(entry => entry.tone === 'finished')
        const rank = attention.length > 0 ? 0 : running.length > 0 ? 1 : failed.length > 0 ? 2 : unread.length > 0 ? 3 : 4
        const latestAt = sessions.reduce((latest, entry) => Math.max(latest, entry.updatedAt), 0)
        const byRecency = (left, right) => right.updatedAt - left.updatedAt
        const newest =
          attention.slice().sort(byRecency)[0] ??
          running.slice().sort(byRecency)[0] ??
          failed.slice().sort(byRecency)[0] ??
          unread.slice().sort(byRecency)[0] ??
          finished.slice().sort(byRecency)[0]
        return { ...project, sessions, allSessions, attention, running, finished, failed, unread, rank, latestAt, newest }
      })
      const visibleProjects = projects.filter(project => project.sessions.length > 0)
      let currentKey
      for (const project of visibleProjects) {
        if (currentKey !== undefined) break
        if (project.sessions.some(entry => entry.open)) currentKey = project.key
      }
      for (const project of visibleProjects) project.active = project.key === currentKey
      const compareProjects = (left, right) => {
        if (sortMode === 'name') return left.title.localeCompare(right.title, undefined, { numeric: true, sensitivity: 'base' })
        if (sortMode === 'activity') return right.latestAt - left.latestAt
        if (sortMode === 'chats') {
          const delta = right.sessions.length - left.sessions.length
          return delta !== 0 ? delta : left.rank !== right.rank ? left.rank - right.rank : right.latestAt - left.latestAt
        }
        return left.rank !== right.rank ? left.rank - right.rank : right.latestAt - left.latestAt
      }
      visibleProjects.sort(compareProjects)
      const attentionProjects = visibleProjects.filter(project => project.attention.length > 0)
      const runningProjects = visibleProjects.filter(project => project.running.length > 0)
      const unreadProjects = visibleProjects.filter(project => project.unread.length > 0)
      const failedProjects = visibleProjects.filter(project => project.failed.length > 0)
      const finishedProjects = visibleProjects.filter(project => project.finished.length > 0)
      const sum = (list, field) => list.reduce((total, project) => total + project[field].length, 0)
      const unreadCount = sum(unreadProjects, 'unread')
      const failedCount = sum(failedProjects, 'failed')
      const totalAttentionProjects = projects.filter(project => project.allSessions.some(entry => entry.tone === 'attention'))
      const totalRunningProjects = projects.filter(project => project.allSessions.some(entry => entry.tone === 'running'))
      const totalUnreadProjects = projects.filter(project => project.allSessions.some(entry => entry.tone === 'unread'))
      const totalErrorProjects = projects.filter(project => project.allSessions.some(entry => entry.tone === 'error'))
      const totalFinishedProjects = projects.filter(project => project.allSessions.some(entry => entry.tone === 'finished'))
      const totalChats = { attention: 0, running: 0, unread: 0, error: 0, finished: 0 }
      for (const project of projects) {
        for (const entry of project.allSessions) totalChats[entry.tone] += 1
      }
      return {
        projects: visibleProjects,
        attentionProjects,
        runningProjects,
        unreadProjects,
        failedProjects,
        finishedProjects,
        attentionCount: sum(attentionProjects, 'attention'),
        runningCount: sum(runningProjects, 'running'),
        finishedCount: sum(finishedProjects, 'finished'),
        unreadCount,
        failedCount,
        totals: {
          attention: totalAttentionProjects.length,
          running: totalRunningProjects.length,
          unread: totalUnreadProjects.length,
          error: totalErrorProjects.length,
          finished: totalFinishedProjects.length,
          projects: projects.length,
          chats: totalChats,
        },
        projectCount: visibleProjects.length,
        totalProjectCount: projects.length,
        activeProjectKey: currentKey,
        ready: raw.ready,
      }
    }

    /* ------------------------------------------------------------------ *
     * Board store
     * ------------------------------------------------------------------ */

    /**
     * Build the store that snapshots both Client projections on change.
     * @param ctx - Client context carrying the injected services.
     * @param tr - translate function bound to the plugin namespace.
     * @returns the store with `getSnapshot`, `subscribe`, `refresh` and `dispose`.
     */
    function createBoardStore(ctx, tr) {
      let cache = null
      let dirty = true
      const listeners = new Set()
      const detachers = []

      const emit = () => {
        dirty = true
        for (const listener of [...listeners]) {
          try {
            listener()
          } catch (error) {
            console.error('[projects-board] listener', error)
          }
        }
      }

      const attach = () => {
        for (const service of [ctx.sessions, ctx.workspaces]) {
          const off = subscribeStore(service, emit)
          if (off !== undefined) detachers.push(off)
        }
      }

      return {
        get live() {
          return detachers.length > 0
        },
        getSnapshot() {
          if (cache === null || dirty) {
            cache = readBoard(ctx, tr)
            dirty = false
          }
          return cache
        },
        subscribe(listener) {
          listeners.add(listener)
          return () => {
            listeners.delete(listener)
          }
        },
        refresh() {
          emit()
        },
        attach,
        dispose() {
          for (const off of detachers.splice(0)) {
            try {
              off()
            } catch (error) {
              console.error('[projects-board] detach', error)
            }
          }
          listeners.clear()
        },
      }
    }

    /* ------------------------------------------------------------------ *
     * Sort preference
     * ------------------------------------------------------------------ */

    /**
     * Read the saved project ordering for this browser.
     * @returns one of SORTS, defaulting to `state`.
     */
    function readSortPreference() {
      try {
        if (typeof localStorage === 'undefined') return 'state'
        const stored = localStorage.getItem(SORT_KEY)
        return SORTS.includes(stored) ? stored : 'state'
      } catch (error) {
        console.error('[projects-board] read sort', error)
        return 'state'
      }
    }

    /**
     * Persist the project ordering for this browser.
     * @param value - one of SORTS.
     * @returns nothing.
     */
    function writeSortPreference(value) {
      try {
        if (typeof localStorage !== 'undefined') localStorage.setItem(SORT_KEY, value)
      } catch (error) {
        console.error('[projects-board] save sort', error)
      }
    }

    /**
     * Read the saved collapsed state of the sidebar widget.
     * @returns true when the widget was left collapsed.
     */
    function readCollapsedPreference() {
      try {
        if (typeof localStorage === 'undefined') return false
        return localStorage.getItem(COLLAPSE_KEY) === '1'
      } catch (error) {
        console.error('[projects-board] read collapsed', error)
        return false
      }
    }

    /**
     * Persist the collapsed state of the sidebar widget.
     * @param value - whether the widget is collapsed.
     * @returns nothing.
     */
    function writeCollapsedPreference(value) {
      try {
        if (typeof localStorage !== 'undefined') localStorage.setItem(COLLAPSE_KEY, value ? '1' : '0')
      } catch (error) {
        console.error('[projects-board] save collapsed', error)
      }
    }

    /**
     * Read the saved status visibility for this browser.
     * @returns an object with one boolean per chat state.
     */
    function readVisiblePreference() {
      try {
        if (typeof localStorage === 'undefined') return { ...ALL_VISIBLE }
        const stored = localStorage.getItem(VISIBLE_KEY)
        if (stored === null) return { ...ALL_VISIBLE }
        const parsed = JSON.parse(stored)
        if (!parsed || typeof parsed !== 'object') return { ...ALL_VISIBLE }
        return {
          attention: parsed.attention !== false,
          running: parsed.running !== false,
          unread: parsed.unread !== false,
          error: parsed.error !== false,
          finished: parsed.finished !== false,
        }
      } catch (error) {
        console.error('[projects-board] read visible', error)
        return { ...ALL_VISIBLE }
      }
    }

    /**
     * Persist the status visibility for this browser.
     * @param value - object with one boolean per chat state.
     * @returns nothing.
     */
    function writeVisiblePreference(value) {
      try {
        if (typeof localStorage !== 'undefined') localStorage.setItem(VISIBLE_KEY, JSON.stringify(value))
      } catch (error) {
        console.error('[projects-board] save visible', error)
      }
    }

    /**
     * Coerce one stored preferences object into the current shape.
     * @param raw - parsed stored value, or null.
     * @returns the preferences.
     */
    function normalizePrefs(raw) {
      const out = { ...DEFAULT_PREFS }
      if (raw === null || typeof raw !== 'object') return out
      if (COUNT_MODES.includes(raw.countMode)) out.countMode = raw.countMode
      for (const key of ['autoExpandAttention', 'autoExpandUnread', 'accordion', 'showUnreadBadge', 'inlineApprovals']) {
        if (typeof raw[key] === 'boolean') out[key] = raw[key]
      }
      return out
    }

    /**
     * Read the saved widget preferences.
     * @returns the preferences.
     */
    function readPrefsPreference() {
      try {
        if (typeof localStorage === 'undefined') return { ...DEFAULT_PREFS }
        const stored = localStorage.getItem(PREFS_KEY)
        return stored === null ? { ...DEFAULT_PREFS } : normalizePrefs(JSON.parse(stored))
      } catch (error) {
        console.error('[projects-board] read preferences', error)
        return { ...DEFAULT_PREFS }
      }
    }

    /**
     * Persist the widget preferences.
     * @param value - the preferences.
     * @returns nothing.
     */
    function writePrefsPreference(value) {
      try {
        if (typeof localStorage !== 'undefined') localStorage.setItem(PREFS_KEY, JSON.stringify(value))
      } catch (error) {
        console.error('[projects-board] save preferences', error)
      }
    }

    /**
     * Build the store shared by the board page and the footer widget.
     * @returns the store with `getSnapshot`, `subscribe`, `set` and `cycle`.
     */
    function createSortStore() {
      let value = readSortPreference()
      const listeners = new Set()
      const publish = () => {
        for (const listener of [...listeners]) {
          try {
            listener()
          } catch (error) {
            console.error('[projects-board] sort listener', error)
          }
        }
      }
      return {
        getSnapshot: () => value,
        subscribe(listener) {
          listeners.add(listener)
          return () => {
            listeners.delete(listener)
          }
        },
        set(next) {
          if (!SORTS.includes(next) || next === value) return
          value = next
          writeSortPreference(next)
          publish()
        },
        cycle() {
          const index = SORTS.indexOf(value)
          this.set(SORTS[(index + 1) % SORTS.length])
        },
      }
    }

    /**
     * Shared collapsed state: the widget and the settings page read one value.
     * @returns the store with `getSnapshot`, `subscribe`, `set` and `toggle`.
     */
    function createCollapsedStore() {
      let value = readCollapsedPreference()
      const listeners = new Set()
      const publish = () => {
        for (const listener of [...listeners]) listener()
      }
      const set = next => {
        const nextValue = next === true
        if (nextValue === value) return
        value = nextValue
        writeCollapsedPreference(value)
        publish()
      }
      return {
        getSnapshot: () => value,
        subscribe(listener) {
          listeners.add(listener)
          return () => {
            listeners.delete(listener)
          }
        },
        set,
        toggle: () => set(!value),
      }
    }

    /**
     * Shared status visibility: the widget and the settings page read one value.
     * @returns the store with `getSnapshot`, `subscribe`, `set`, `toggle` and `reset`.
     */
    function createVisibleStore() {
      let value = readVisiblePreference()
      const listeners = new Set()
      const publish = () => {
        for (const listener of [...listeners]) listener()
      }
      const set = next => {
        const nextValue = {
          attention: next.attention !== false,
          running: next.running !== false,
          unread: next.unread !== false,
          error: next.error !== false,
          finished: next.finished !== false,
        }
        value = nextValue
        writeVisiblePreference(nextValue)
        publish()
      }
      return {
        getSnapshot: () => value,
        subscribe(listener) {
          listeners.add(listener)
          return () => {
            listeners.delete(listener)
          }
        },
        set,
        toggle(tone) {
          set({ ...value, [tone]: !value[tone] })
        },
        reset() {
          set({ ...ALL_VISIBLE })
        },
      }
    }

    /**
     * Shared widget preferences for the settings page and the footer.
     * @returns the store with `getSnapshot`, `subscribe`, `update` and `reset`.
     */
    function createPrefsStore() {
      let value = readPrefsPreference()
      const listeners = new Set()
      const publish = () => {
        for (const listener of [...listeners]) listener()
      }
      return {
        getSnapshot: () => value,
        subscribe(listener) {
          listeners.add(listener)
          return () => {
            listeners.delete(listener)
          }
        },
        update(patch) {
          value = normalizePrefs({ ...value, ...patch })
          writePrefsPreference(value)
          publish()
        },
        reset() {
          value = { ...DEFAULT_PREFS }
          writePrefsPreference(value)
          publish()
        },
      }
    }


    /**
     * Subscribe to a store snapshot.
     * @param store - store with `subscribe` and `getSnapshot`.
     * @returns the current snapshot.
     */
    function useSnapshot(store) {
      if (typeof React.useSyncExternalStore === 'function') {
        return React.useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot)
      }
      const [value, setValue] = React.useState(store.getSnapshot)
      React.useEffect(() => store.subscribe(() => setValue(store.getSnapshot())), [store])
      return value
    }

    /**
     * Read the renderer's standard session-status hook when the slot provides it.
     * @param props - slot props.
     * @returns the status map keyed by Session id, or undefined.
     */
    function useStatuses(props) {
      const hook = props.useSessionStatus
      if (typeof hook !== 'function') return undefined
      return hook(state => state)
    }

    /**
     * Format an update timestamp as a relative label.
     * @param value - epoch milliseconds.
     * @param tr - translate function.
     * @param now - current epoch milliseconds.
     * @returns the relative label, or an empty string.
     */
    function relativeTime(value, tr, now) {
      if (!value) return ''
      const delta = Math.max(0, now - value)
      if (delta < MINUTE) return tr('justNow')
      if (delta < HOUR) return tr('minutesAgo', { count: Math.floor(delta / MINUTE) })
      if (delta < DAY) return tr('hoursAgo', { count: Math.floor(delta / HOUR) })
      return tr('daysAgo', { count: Math.floor(delta / DAY) })
    }

    /**
     * Keep the relative labels fresh while a surface is mounted.
     * @returns the current epoch milliseconds.
     */
    function useNow() {
      const [now, setNow] = React.useState(() => Date.now())
      React.useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), TICK_MS)
        return () => clearInterval(timer)
      }, [])
      return now
    }

    /**
     * One chat row: state dot, title, state label, open badge.
     * @param props - row props.
     * @returns the row element.
     */
    function ChatRow(props) {
      const { entry, tr, now, onOpen, compact } = props
      const unread = entry.unread === true
      const failed = entry.failed === true
      const tone = entry.tone || (unread ? 'unread' : entry.state)
      const trailing = failed
        ? entry.label
        : entry.state === 'finished'
          ? relativeTime(entry.updatedAt, tr, now)
          : entry.label
      return h(
        'button',
        {
          type: 'button',
          className: compact ? 'dsb-chat dsb-chatCompact' : 'dsb-chat',
          title: failed ? entry.title + ' — ' + tr('stateError') : unread ? entry.title + ' — ' + tr('unreadHint') : entry.title,
          'data-active': entry.open ? 'true' : 'false',
          'data-unread': unread ? 'true' : 'false',
          'data-error': failed ? 'true' : 'false',
          onClick: () => onOpen(entry.sessionId),
        },
        h('span', { className: 'dsb-dot', 'data-tone': tone, 'aria-hidden': 'true' }),
        h('span', { className: 'dsb-chatTitle' }, entry.title),
        entry.open ? h('span', { className: 'dsb-open' }, tr('openBadge')) : null,
        h('span', { className: 'dsb-chatState', 'data-tone': tone }, trailing),
      )
    }

    /* ------------------------------------------------------------------ *
     * Compact sidebar-foot widget
     * ------------------------------------------------------------------ */

    /**
     * Chevron glyph for the expandable project rows.
     * @param props - `open` state.
     * @returns the icon element.
     */
    function Chevron(props) {
      return h(
        'svg',
        {
          width: 10,
          height: 10,
          viewBox: '0 0 10 10',
          fill: 'none',
          'aria-hidden': 'true',
          focusable: 'false',
          className: 'dsb-chevron',
          'data-open': props.open ? 'true' : 'false',
        },
        h('path', {
          d: 'M3.5 1.5L7 5l-3.5 3.5',
          stroke: 'currentColor',
          strokeWidth: 1.4,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        }),
      )
    }

    /**
     * Sort glyph for the compact header control.
     * @returns the icon element.
     */
    function SortIcon() {
      return h(
        'svg',
        { width: 12, height: 12, viewBox: '0 0 12 12', fill: 'none', 'aria-hidden': 'true', focusable: 'false' },
        h('path', {
          d: 'M3.6 2.2v7.6M1.6 7.8l2 2 2-2M8.4 9.8V2.2M6.4 4.2l2-2 2 2',
          stroke: 'currentColor',
          strokeWidth: 1.2,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        }),
      )
    }

    /**
     * Expand-all / collapse-all glyph for the compact header.
     * @param props - `allExpanded`: whether every project is currently expanded.
     * @returns the icon element.
     */
    function ExpandAllIcon(props) {
      const allExpanded = props.allExpanded === true
      const first = allExpanded ? 'M2.5 3.4L6 6.9l3.5-3.5' : 'M2.5 8.6L6 5.1l3.5 3.5'
      const second = allExpanded ? 'M2.5 6.9L6 10.4l3.5-3.5' : 'M2.5 5.1L6 1.6l3.5 3.5'
      return h(
        'svg',
        {
          width: 12,
          height: 12,
          viewBox: '0 0 12 12',
          fill: 'none',
          'aria-hidden': 'true',
          focusable: 'false',
          className: 'dsb-expandAllIcon',
          'data-all-expanded': allExpanded ? 'true' : 'false',
        },
        h('path', {
          d: first,
          stroke: 'currentColor',
          strokeWidth: 1.2,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        }),
        h('path', {
          d: second,
          stroke: 'currentColor',
          strokeWidth: 1.2,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        }),
      )
    }

    /**
     * Check glyph for the inline approval action.
     * @returns the icon element.
     */
    function CheckIcon() {
      return h(
        'svg',
        { width: 10, height: 10, viewBox: '0 0 10 10', fill: 'none', 'aria-hidden': 'true', focusable: 'false' },
        h('path', {
          d: 'M2 5.2L4.1 7.3 8 3',
          stroke: 'currentColor',
          strokeWidth: 1.5,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        }),
      )
    }

    /**
     * Reject glyph for the inline approval action.
     * @returns the icon element.
     */
    function CloseIcon() {
      return h(
        'svg',
        { width: 10, height: 10, viewBox: '0 0 10 10', fill: 'none', 'aria-hidden': 'true', focusable: 'false' },
        h('path', {
          d: 'M2.6 2.6l4.8 4.8M7.4 2.6L2.6 7.4',
          stroke: 'currentColor',
          strokeWidth: 1.4,
          strokeLinecap: 'round',
        }),
      )
    }

    /**
     * One settings row: title, hint and the control on the right.
     * @param props - row props.
     * @returns the row element.
     */
    function ProjectsSettingsRow(props) {
      return h(
        'div',
        { className: 'pws-row' },
        h(
          'div',
          { className: 'pws-text' },
          h('span', { className: 'pws-title' }, props.title),
          props.hint === undefined ? null : h('span', { className: 'pws-hint' }, props.hint),
        ),
        h('div', { className: 'pws-control' }, props.children),
      )
    }

    /**
     * On/off switch following the host switch pattern.
     * @param props - switch props.
     * @returns the switch element.
     */
    function ProjectsSettingsSwitch(props) {
      const { checked, label, onChange } = props
      return h(
        'button',
        {
          type: 'button',
          className: 'pws-switch',
          role: 'switch',
          'aria-checked': checked ? 'true' : 'false',
          'aria-label': label,
          title: label,
          onClick: () => onChange(!checked),
        },
        h('span', { className: 'pws-knob', 'aria-hidden': 'true' }),
      )
    }

    /**
     * Segmented choice: one option pressed at a time.
     * @param props - segment props.
     * @returns the segmented control.
     */
    function ProjectsSettingsSegments(props) {
      const { value, options, label, onChange } = props
      return h(
        'div',
        { className: 'pws-seg', role: 'group', 'aria-label': label },
        options.map(option =>
          h(
            'button',
            {
              key: String(option.value),
              type: 'button',
              className: 'pws-segItem',
              'aria-pressed': value === option.value ? 'true' : 'false',
              onClick: () => onChange(option.value),
            },
            option.label,
          ),
        ),
      )
    }

    /**
     * Navigation glyph of the projects settings section.
     * @param props - slot props (`size`).
     * @returns the icon element.
     */
    function ProjectsSettingsIcon(props) {
      const size = typeof props.size === 'number' ? props.size : 16
      return h(
        'svg',
        {
          width: size,
          height: size,
          viewBox: '0 0 16 16',
          fill: 'none',
          'aria-hidden': 'true',
          focusable: 'false',
          style: { display: 'block' },
        },
        h('rect', { x: 1.4, y: 1.4, width: 5.6, height: 5.6, rx: 1.3, stroke: 'currentColor', strokeWidth: 1.2 }),
        h('rect', { x: 9, y: 1.4, width: 5.6, height: 5.6, rx: 1.3, stroke: 'currentColor', strokeWidth: 1.2 }),
        h('rect', { x: 1.4, y: 9, width: 5.6, height: 5.6, rx: 1.3, stroke: 'currentColor', strokeWidth: 1.2 }),
        h('path', {
          d: 'M9.7 12.1l1.5 1.5 2.7-3',
          stroke: 'currentColor',
          strokeWidth: 1.4,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        }),
      )
    }

    /**
     * The projects section of the harness Settings dialog.
     * @param props - injected stores and translator.
     * @returns the section element.
     */
    function ProjectsSettingsSection(props) {
      const { tr } = props
      const sortMode = useSnapshot(props.sort)
      const visible = useSnapshot(props.visible)
      const prefs = useSnapshot(props.prefs)
      const setVisible = (tone, next) => props.visible.set({ ...visible, [tone]: next })
      const update = patch => props.prefs.update(patch)
      return h(
        'div',
        { className: 'pws' },
        h('style', { 'data-projects-board-settings': '' }, SETTINGS_CSS),
        h('h2', { className: 'pws-heading' }, tr('settings.title')),
        h('p', { className: 'pws-sub' }, tr('settings.subtitle')),
        h('p', { className: 'pws-note' }, tr('settings.local')),
        h(
          ProjectsSettingsRow,
          { title: tr('settings.sort'), hint: tr('settings.sortHint') },
          h(ProjectsSettingsSegments, {
            label: tr('settings.sort'),
            value: sortMode,
            options: SORTS.map(id => ({ value: id, label: tr(SORT_LABEL_KEYS[id]) })),
            onChange: next => props.sort.set(next),
          }),
        ),
        h(
          ProjectsSettingsRow,
          { title: tr('settings.counts'), hint: tr('settings.countsHint') },
          h(ProjectsSettingsSegments, {
            label: tr('settings.counts'),
            value: prefs.countMode,
            options: COUNT_MODES.map(id => ({ value: id, label: tr('settings.counts.' + id) })),
            onChange: next => update({ countMode: next }),
          }),
        ),
        h('h3', { className: 'pws-groupTitle' }, tr('settings.statuses')),
        h('p', { className: 'pws-groupHint' }, tr('settings.statusesHint')),
        h(
          ProjectsSettingsRow,
          { title: tr('settings.attention') },
          h(ProjectsSettingsSwitch, {
            label: tr('settings.attention'),
            checked: visible.attention !== false,
            onChange: next => setVisible('attention', next),
          }),
        ),
        h(
          ProjectsSettingsRow,
          { title: tr('settings.running') },
          h(ProjectsSettingsSwitch, {
            label: tr('settings.running'),
            checked: visible.running !== false,
            onChange: next => setVisible('running', next),
          }),
        ),
        h(
          ProjectsSettingsRow,
          { title: tr('settings.unread') },
          h(ProjectsSettingsSwitch, {
            label: tr('settings.unread'),
            checked: visible.unread !== false,
            onChange: next => setVisible('unread', next),
          }),
        ),
        h(
          ProjectsSettingsRow,
          { title: tr('settings.error') },
          h(ProjectsSettingsSwitch, {
            label: tr('settings.error'),
            checked: visible.error !== false,
            onChange: next => setVisible('error', next),
          }),
        ),
        h(
          ProjectsSettingsRow,
          { title: tr('settings.finished') },
          h(ProjectsSettingsSwitch, {
            label: tr('settings.finished'),
            checked: visible.finished !== false,
            onChange: next => setVisible('finished', next),
          }),
        ),
        h(
          ProjectsSettingsRow,
          { title: tr('settings.autoExpandAttention'), hint: tr('settings.autoExpandHint') },
          h(ProjectsSettingsSwitch, {
            label: tr('settings.autoExpandAttention'),
            checked: prefs.autoExpandAttention !== false,
            onChange: next => update({ autoExpandAttention: next }),
          }),
        ),
        h(
          ProjectsSettingsRow,
          { title: tr('settings.autoExpandUnread') },
          h(ProjectsSettingsSwitch, {
            label: tr('settings.autoExpandUnread'),
            checked: prefs.autoExpandUnread !== false,
            onChange: next => update({ autoExpandUnread: next }),
          }),
        ),
        h(
          ProjectsSettingsRow,
          { title: tr('settings.accordion'), hint: tr('settings.accordionHint') },
          h(ProjectsSettingsSwitch, {
            label: tr('settings.accordion'),
            checked: prefs.accordion !== false,
            onChange: next => update({ accordion: next }),
          }),
        ),
        h(
          ProjectsSettingsRow,
          { title: tr('settings.unreadBadge'), hint: tr('settings.unreadBadgeHint') },
          h(ProjectsSettingsSwitch, {
            label: tr('settings.unreadBadge'),
            checked: prefs.showUnreadBadge !== false,
            onChange: next => update({ showUnreadBadge: next }),
          }),
        ),
        h(
          ProjectsSettingsRow,
          { title: tr('settings.inlineApprovals'), hint: tr('settings.inlineApprovalsHint') },
          h(ProjectsSettingsSwitch, {
            label: tr('settings.inlineApprovals'),
            checked: prefs.inlineApprovals !== false,
            onChange: next => update({ inlineApprovals: next }),
          }),
        ),
        h(
          'div',
          { className: 'pws-actions' },
          h(
            'button',
            {
              type: 'button',
              className: 'pws-reset',
              onClick: () => {
                props.sort.set('state')
                props.visible.reset()
                props.prefs.reset()
                props.collapsed.set(false)
              },
            },
            tr('settings.reset'),
          ),
        ),
      )
    }

    /**
     * Always-visible compact project list with filters and expandable chats.
     * @param props - slot props (`wide`) plus the registration's injected props.
     * @returns the widget element, or null when it should stay hidden.
     */
    function ProjectsFooter(props) {
      const { board, tr, wide } = props
      const snapshot = useSnapshot(board)
      const statuses = useStatuses(props)
      const now = useNow()
      const sortMode = useSnapshot(props.sort)
      const visible = useSnapshot(props.visible)
      const collapsed = useSnapshot(props.collapsed)
      const prefs = useSnapshot(props.prefs)
      const view = React.useMemo(
        () => deriveBoard(snapshot, statuses, tr, sortMode, visible),
        [snapshot, statuses, tr, sortMode, visible],
      )
      const [overrides, setOverrides] = React.useState(() => ({}))
      const [activeKey, setActiveKey] = React.useState(undefined)
      const [answeringApproval, setAnsweringApproval] = React.useState(undefined)
      const [approvalError, setApprovalError] = React.useState('')
      const [sortMenuOpen, setSortMenuOpen] = React.useState(false)
      const sortWrapRef = React.useRef(null)

      React.useEffect(() => {
        if (!sortMenuOpen || typeof document === 'undefined') return undefined
        const onPointer = event => {
          const wrap = sortWrapRef.current
          if (wrap !== null && event.target instanceof Node && wrap.contains(event.target)) return
          setSortMenuOpen(false)
        }
        const onKey = event => {
          if (event.key === 'Escape') setSortMenuOpen(false)
        }
        document.addEventListener('mousedown', onPointer)
        document.addEventListener('keydown', onKey)
        return () => {
          document.removeEventListener('mousedown', onPointer)
          document.removeEventListener('keydown', onKey)
        }
      }, [sortMenuOpen])

      if (!wide) return null
      if (view.totalProjectCount === 0) return null

      const projects = view.projects
      const approvals = projects.flatMap(project =>
        project.sessions
          .filter(
            entry =>
              entry.pending === 'approval' &&
              entry.pendingInteraction &&
              entry.pendingInteraction.answerable !== false &&
              typeof entry.pendingInteraction.answer === 'function',
          )
          .map(entry => ({ project, entry })),
      )
      const firstApproval = approvals[0]
      const firstApprovalKey = firstApproval === undefined ? undefined : firstApproval.entry.pendingInteraction.key ?? firstApproval.entry.sessionId
      const approvalProject = firstApproval === undefined ? '' : firstApproval.project.title
      const approvalChat = firstApproval === undefined ? '' : firstApproval.entry.title
      const approvalTool = firstApproval === undefined ? '' : firstApproval.entry.pendingInteraction.toolName
      const approvalDetail = [approvalChat, approvalTool].filter(part => typeof part === 'string' && part !== '').join(' · ')
      const approvalTooltip = [approvalProject, approvalChat, approvalTool].filter(part => typeof part === 'string' && part !== '').join(' — ')
      const answerApproval = async (item, outcome) => {
        const interaction = item.entry.pendingInteraction
        if (interaction === undefined || typeof interaction.answer !== 'function' || interaction.answerable === false) return
        setAnsweringApproval(interaction.key ?? item.entry.sessionId)
        setApprovalError('')
        try {
          await interaction.answer(outcome)
        } catch (error) {
          console.error('[projects-board] answer approval', error)
          setApprovalError(tr('approvalFailed'))
        } finally {
          setAnsweringApproval(undefined)
        }
      }
      const allVisible = visible.attention && visible.running && visible.unread && visible.error && visible.finished
      const activeVisibleKey =
        activeKey !== undefined && projects.some(project => project.key === activeKey) ? activeKey : undefined
      const open = sessionId => {
        try {
          props.openSession(sessionId)
        } catch (error) {
          console.error('[projects-board] open chat', error)
        }
      }
      const isExpanded = project => {
        const override = overrides[project.key]
        if (override !== undefined) return override
        if (project.failed.length > 0) return true
        if (prefs.autoExpandAttention && project.attention.length > 0) return true
        if (prefs.autoExpandUnread && project.unread.length > 0) return true
        if (activeVisibleKey !== undefined) {
          if (prefs.accordion) return project.key === activeVisibleKey
          if (project.key === activeVisibleKey) return true
        }
        return false
      }
      const toggleCollapsed = () => props.collapsed.toggle()
      const toggle = project => {
        setOverrides(previous => ({ ...previous, [project.key]: !isExpanded(project) }))
      }
      const clearManualCollapse = key => {
        setOverrides(previous => {
          if (previous[key] !== false) return previous
          const next = { ...previous }
          delete next[key]
          return next
        })
      }
      const jump = project => {
        if (project.newest === undefined) return
        setActiveKey(project.key)
        if (prefs.accordion === false) {
          setOverrides(previous => ({ ...previous, [project.key]: true }))
        } else {
          clearManualCollapse(project.key)
        }
        open(project.newest.sessionId)
      }
      const openChat = (project, sessionId) => {
        setActiveKey(project.key)
        if (prefs.accordion === false) {
          setOverrides(previous => ({ ...previous, [project.key]: true }))
        }
        open(sessionId)
      }

      const allExpanded = projects.length > 0 && projects.every(project => isExpanded(project))
      const toggleAll = () => {
        const next = !allExpanded
        setOverrides(previous => {
          const updated = { ...previous }
          for (const project of projects) updated[project.key] = next
          return updated
        })
      }

      const toggleStatus = tone => {
        props.visible.toggle(tone)
        if (collapsed) props.collapsed.set(false)
      }

      const countOf = tone => (prefs.countMode === 'chats' ? view.totals.chats[tone] : view.totals[tone])
      const tipFor = tone => tr((prefs.countMode === 'chats' ? TIP_CHAT_KEYS : TIP_KEYS)[tone], { count: countOf(tone) })

      const chip = (tone, count, label, tip) => {
        const action = tr(visible[tone] ? 'hideStatus' : 'showStatus', { status: label })
        return h(
          'button',
          {
            type: 'button',
            className: 'dsb-chip',
            'data-tone': tone,
            'data-visible': visible[tone] ? 'true' : 'false',
            'aria-pressed': visible[tone] ? 'true' : 'false',
            'aria-label': action + ' — ' + tip,
            title: action + ' — ' + tip,
            onClick: () => toggleStatus(tone),
          },
          h('span', { className: 'dsb-dot', 'data-tone': tone, 'aria-hidden': 'true' }),
          h('span', { className: 'dsb-chipCount' }, String(count)),
          h('span', { className: 'dsb-chipLabel' }, label),
        )
      }

      return h(
        'div',
        { className: 'dsb-foot', 'data-collapsed': collapsed ? 'true' : 'false' },
        h(StyleSheet),
        h(
          'div',
          { className: 'dsb-footHead' },
          h(
            'button',
            {
              type: 'button',
              className: 'dsb-footTitle',
              'aria-expanded': collapsed ? 'false' : 'true',
              title: collapsed ? tr('expandWidget') : tr('collapseWidget'),
              onClick: toggleCollapsed,
            },
            h(Chevron, { open: !collapsed }),
            h('span', { className: 'dsb-footTitleText' }, tr('panel')),
            approvals.length === 0
              ? null
              : h('span', { className: 'dsb-approvalDot', title: tr('approvalNeededGeneric'), 'aria-hidden': 'true' }),
          ),
          collapsed
            ? null
            : h(
                'span',
                { className: 'dsb-footSortWrap', ref: sortWrapRef },
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'dsb-footSort',
                    title: tr('sortHint', { mode: tr(SORT_LABEL_KEYS[sortMode]) }),
                    'aria-label': tr('sortLabel'),
                    'aria-haspopup': 'menu',
                    'aria-expanded': sortMenuOpen ? 'true' : 'false',
                    onClick: () => setSortMenuOpen(current => !current),
                  },
                  h(SortIcon),
                ),
                sortMenuOpen
                  ? h(
                      'div',
                      { className: 'dsb-menu', role: 'menu', 'aria-label': tr('sortLabel') },
                      SORTS.map(id =>
                        h(
                          'button',
                          {
                            key: id,
                            type: 'button',
                            role: 'menuitemradio',
                            className: 'dsb-menuItem',
                            'aria-checked': sortMode === id ? 'true' : 'false',
                            onClick: () => {
                              props.sort.set(id)
                              setSortMenuOpen(false)
                            },
                          },
                          h('span', { className: 'dsb-menuCheck', 'aria-hidden': 'true' }, sortMode === id ? h(CheckIcon) : null),
                          h('span', { className: 'dsb-menuLabel' }, tr(SORT_LABEL_KEYS[id])),
                        ),
                      ),
                    )
                  : null,
              ),
          countOf('attention') > 0 ? chip('attention', countOf('attention'), tr('chipAttention'), tipFor('attention')) : null,
          countOf('running') > 0 ? chip('running', countOf('running'), tr('chipRunning'), tipFor('running')) : null,
          countOf('unread') > 0 ? chip('unread', countOf('unread'), tr('chipUnread'), tipFor('unread')) : null,
          countOf('error') > 0 ? chip('error', countOf('error'), tr('chipError'), tipFor('error')) : null,
          countOf('finished') > 0 ? chip('finished', countOf('finished'), tr('chipFinished'), tipFor('finished')) : null,
          collapsed ? null : h('span', { className: 'dsb-footGap', 'aria-hidden': 'true' }),
          collapsed
            ? null
            : h(
                'button',
                {
                  type: 'button',
                  className: 'dsb-footAll',
                  'data-active': allVisible ? 'true' : 'false',
                  title: tr('showAllStatuses'),
                  onClick: () => props.visible.reset(),
                },
                tr('chipAll'),
              ),
          collapsed || projects.length === 0
            ? null
            : h(
                'button',
                {
                  type: 'button',
                  className: 'dsb-footExpandAll',
                  'aria-pressed': allExpanded ? 'true' : 'false',
                  'aria-label': allExpanded ? tr('collapseAll') : tr('expandAll'),
                  title: allExpanded ? tr('collapseAll') : tr('expandAll'),
                  onClick: toggleAll,
                },
                h(ExpandAllIcon, { allExpanded }),
              ),
        ),
        collapsed || prefs.inlineApprovals === false || firstApproval === undefined
          ? null
          : h(
              'div',
              { className: 'dsb-approval' },
              h(
                'div',
                { className: 'dsb-approvalTexts', title: approvalTooltip },
                h(
                  'span',
                  { className: 'dsb-approvalText' },
                  approvalProject === ''
                    ? tr('approvalNeededGeneric')
                    : tr('approvalNeededProject', { project: approvalProject }),
                ),
                approvalDetail === '' ? null : h('span', { className: 'dsb-approvalSub' }, approvalDetail),
              ),
              approvals.length > 1
                ? h('span', { className: 'dsb-approvalMore' }, tr('approvalMore', { count: approvals.length - 1 }))
                : null,
              h(
                'button',
                {
                  type: 'button',
                  className: 'dsb-approvalAllow',
                  'aria-label': tr('approvalAllow'),
                  title: tr('approvalAllow'),
                  disabled: answeringApproval === firstApprovalKey,
                  onClick: () => answerApproval(firstApproval, 'allowed-once'),
                },
                h(CheckIcon),
              ),
              h(
                'button',
                {
                  type: 'button',
                  className: 'dsb-approvalReject',
                  'aria-label': tr('approvalReject'),
                  title: tr('approvalReject'),
                  disabled: answeringApproval === firstApprovalKey,
                  onClick: () => answerApproval(firstApproval, 'rejected'),
                },
                h(CloseIcon),
              ),
            ),
        approvalError === '' ? null : h('p', { className: 'dsb-approvalError' }, approvalError),
        collapsed
          ? null
          : h(
              'div',
              { className: 'dsb-footList' },
          projects.length === 0
            ? h('p', { className: 'dsb-empty' }, tr('emptyStatuses'))
            : projects.map(project => {
                const expanded = isExpanded(project)
                return h(
                  'div',
                  { className: 'dsb-project', key: project.key, 'data-active': project.active ? 'true' : 'false', 'data-unread': project.unread.length > 0 ? 'true' : 'false', 'data-error': project.failed.length > 0 ? 'true' : 'false' },
                  h(
                    'div',
                    { className: 'dsb-projectHead' },
                    h(
                      'button',
                      {
                        type: 'button',
                        className: 'dsb-projectChevron',
                        'aria-expanded': expanded ? 'true' : 'false',
                        'aria-label': expanded
                          ? tr('collapseProject', { project: project.title })
                          : tr('expandProject', { project: project.title }),
                        title: expanded
                          ? tr('collapseProject', { project: project.title })
                          : tr('expandProject', { project: project.title }),
                        onClick: () => toggle(project),
                      },
                      h(Chevron, { open: expanded }),
                    ),
                    h(
                      'button',
                      {
                        type: 'button',
                        className: 'dsb-projectOpen',
                        title: tr('openNewestChat', { project: project.title }),
                        'aria-label': tr('openNewestChat', { project: project.title }),
                        onClick: () => jump(project),
                      },
                      h('span', { className: 'dsb-dot', 'data-tone': STATE_TONE[['attention', 'running', 'error', 'unread', 'finished'][project.rank]], 'aria-hidden': 'true' }),
                      h('span', { className: 'dsb-projectName' }, project.title),
                      h(
                        'span',
                        { className: 'dsb-counts' },
                        project.attention.length === 0
                          ? null
                          : h(
                              'span',
                              { className: 'dsb-count', 'data-tone': 'attention', title: tr('tipAttentionChats', { count: project.attention.length }) },
                              String(project.attention.length),
                            ),
                        project.running.length === 0
                          ? null
                          : h(
                              'span',
                              { className: 'dsb-count', 'data-tone': 'running', title: tr('tipRunningChats', { count: project.running.length }) },
                              String(project.running.length),
                            ),
                        project.failed.length === 0
                          ? null
                          : h(
                              'span',
                              { className: 'dsb-count', 'data-tone': 'error', title: tr('tipErrorChats', { count: project.failed.length }) },
                              String(project.failed.length),
                            ),
                        project.unread.length === 0 || prefs.showUnreadBadge === false
                          ? null
                          : h(
                              'span',
                              { className: 'dsb-count', 'data-tone': 'unread', title: tr('tipUnreadChats', { count: project.unread.length }) },
                              String(project.unread.length),
                            ),
                        project.finished.length === 0
                          ? null
                          : h(
                              'span',
                              { className: 'dsb-count', 'data-tone': 'finished', title: tr('tipFinishedChats', { count: project.finished.length }) },
                              String(project.finished.length),
                            ),
                      ),
                    ),
                  ),
                  expanded
                    ? h(
                        'div',
                        { className: 'dsb-chats' },
                        project.sessions.map(entry =>
                          h(ChatRow, {
                            key: entry.sessionId,
                            entry,
                            tr,
                            now,
                            onOpen: sessionId => openChat(project, sessionId),
                            compact: true,
                          }),
                        ),
                      )
                    : null,
                )
              }),
        ),
      )
    }

    /* ------------------------------------------------------------------ *
     * Styles and icons
     * ------------------------------------------------------------------ */

    const CSS = `
.dsb-page{box-sizing:border-box;height:100%;overflow:auto;padding:28px clamp(24px,4vw,48px) 72px;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-base);}
[data-platform='darwin'] .dsb-page{padding-top:calc(28px + var(--dsh-frame-top-clearance,0px));}
.dsb-inner{display:flex;flex-direction:column;gap:26px;max-width:960px;margin:0 auto;}
.dsb-head{display:flex;flex-wrap:wrap;align-items:flex-start;justify-content:space-between;gap:12px 20px;}
.dsb-headMain{display:flex;flex-direction:column;gap:6px;min-width:0;flex:1 1 420px;}
.dsb-title{margin:0;font-size:20px;font-weight:500;line-height:28px;}
.dsb-sub{margin:0;max-width:720px;color:var(--dsw-alias-label-secondary);font-size:13px;line-height:20px;}
.dsb-sortField{display:inline-flex;align-items:center;gap:6px;flex:none;margin-top:3px;font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary);}
.dsb-sortLabel{white-space:nowrap;}
.dsb-sort{box-sizing:border-box;height:28px;border:.5px solid var(--dsw-alias-border-l3);border-radius:7px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;line-height:18px;padding:0 6px;cursor:pointer;}
.dsb-sort:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-brand-primary));outline-offset:1px;}
.dsb-summary{display:flex;flex-wrap:wrap;align-items:center;gap:6px 18px;margin-top:2px;color:var(--dsw-alias-label-secondary);font-size:12.5px;line-height:20px;}
.dsb-tally{display:inline-flex;align-items:center;gap:7px;}
.dsb-dot{display:inline-block;width:8px;height:8px;border-radius:999px;background:var(--dsw-alias-state-idle-primary);flex:none;}
.dsb-dot[data-tone='finished']{background:var(--dsw-alias-state-idle-primary);}
.dsb-dot[data-tone='running']{background:var(--dsw-alias-state-warn-primary);box-shadow:0 0 0 3px color-mix(in srgb,var(--dsw-alias-state-warn-primary) 16%,transparent);animation:dsb-pulse 1.9s ease-in-out infinite;}
.dsb-dot[data-tone='attention']{background:var(--dsw-alias-state-business-primary,var(--dsw-alias-brand-primary));box-shadow:0 0 0 3px color-mix(in srgb,var(--dsw-alias-state-business-primary,var(--dsw-alias-brand-primary)) 18%,transparent);}
.dsb-dot[data-tone='unread']{background:var(--dsw-alias-state-success-primary);box-shadow:0 0 0 3px color-mix(in srgb,var(--dsw-alias-state-success-primary) 18%,transparent);}
.dsb-dot[data-tone='error']{background:var(--dsw-alias-state-error-primary);box-shadow:0 0 0 3px color-mix(in srgb,var(--dsw-alias-state-error-primary) 18%,transparent);}
@keyframes dsb-pulse{0%,100%{opacity:1}50%{opacity:.4}}
@media (prefers-reduced-motion:reduce){.dsb-dot[data-tone='running']{animation:none;}}
.dsb-section{display:flex;flex-direction:column;gap:10px;}
.dsb-sectionHead{display:flex;align-items:center;gap:8px;}
.dsb-sectionTitle{margin:0;font-size:14px;font-weight:500;line-height:22px;}
.dsb-sectionCount{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px;font-variant-numeric:tabular-nums;}
.dsb-groups{display:flex;flex-direction:column;gap:12px;}
.dsb-group{border:.5px solid var(--dsw-alias-border-l1);border-radius:12px;background:var(--dsw-alias-bg-layer-1);overflow:hidden;}
.dsb-group[data-active='true']{border-color:color-mix(in srgb,var(--dsw-alias-brand-primary) 45%,var(--dsw-alias-border-l1));}
.dsb-group[data-active='true'] .dsb-groupHead{background:color-mix(in srgb,var(--dsw-alias-brand-primary) 8%,transparent);}
.dsb-here{flex:none;border-radius:999px;background:color-mix(in srgb,var(--dsw-alias-brand-primary) 15%,transparent);color:var(--dsw-alias-brand-primary);font-size:10.5px;line-height:16px;padding:0 7px;white-space:nowrap;}
.dsb-groupHead{display:flex;align-items:center;gap:10px;padding:10px 14px;border-bottom:.5px solid var(--dsw-alias-border-l2);}
.dsb-groupMain{display:flex;flex-direction:column;gap:1px;min-width:0;flex:1;}
.dsb-groupTitle{font-size:13px;font-weight:500;line-height:20px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.dsb-groupPath{color:var(--dsw-alias-label-tertiary);font-size:11.5px;line-height:16px;font-family:var(--dsw-font-mono,ui-monospace,SFMono-Regular,Menlo,monospace);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.dsb-groupAction{flex:none;border:.5px solid var(--dsw-alias-border-l2);border-radius:8px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;line-height:18px;padding:4px 10px;cursor:pointer;}
.dsb-groupAction:active{background:var(--dsw-alias-interactive-bg-active);}
@media (hover:hover){.dsb-groupAction:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary);}}
.dsb-groupAction:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-brand-primary));outline-offset:1px;}
.dsb-list{display:flex;flex-direction:column;}
.dsb-chat{display:flex;align-items:center;gap:9px;width:100%;box-sizing:border-box;background:transparent;border:0;border-top:.5px solid var(--dsw-alias-border-l2);color:inherit;font:inherit;text-align:left;padding:9px 14px;cursor:pointer;}
.dsb-chat:first-child{border-top:0;}
@media (hover:hover){.dsb-chat:hover{background:var(--dsw-alias-interactive-bg-hover);}}
.dsb-chat:active{background:var(--dsw-alias-interactive-bg-active);}
.dsb-chat:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-brand-primary));outline-offset:-2px;}
.dsb-chatTitle{flex:1;min-width:0;font-size:13px;line-height:20px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.dsb-chatState{flex:none;font-size:11.5px;line-height:16px;color:var(--dsw-alias-label-tertiary);white-space:nowrap;font-variant-numeric:tabular-nums;}
.dsb-chatState[data-tone='running']{color:var(--dsw-alias-state-warn-primary);}
.dsb-chatState[data-tone='attention']{color:var(--dsw-alias-state-business-primary,var(--dsw-alias-brand-primary));}
.dsb-chatState[data-tone='unread']{color:var(--dsw-alias-state-success-primary);}
.dsb-chatState[data-tone='error']{color:var(--dsw-alias-state-error-primary);}
.dsb-chat[data-unread='true'] .dsb-chatTitle{font-weight:500;}
.dsb-open{flex:none;border-radius:999px;background:color-mix(in srgb,var(--dsw-alias-brand-primary) 12%,transparent);color:var(--dsw-alias-brand-primary);font-size:10.5px;line-height:16px;padding:0 7px;white-space:nowrap;}
.dsb-empty{margin:0;padding:2px 5px;color:var(--dsw-alias-label-tertiary);font-size:12.5px;line-height:18px;}
.dsb-foot{box-sizing:border-box;width:100%;padding:6px 5px 5px;border:.5px solid var(--dsw-alias-border-l1);border-radius:10px;background:var(--dsw-alias-bg-layer-1);display:flex;flex-direction:column;gap:2px;margin-bottom:2px;}
.dsb-footHead{display:flex;align-items:center;gap:4px;padding:1px 4px 3px;color:var(--dsw-alias-label-secondary);font-size:11px;line-height:16px;}
.dsb-footTitle{display:inline-flex;align-items:center;gap:3px;box-sizing:border-box;border:0;border-radius:5px;background:transparent;padding:1px 3px;margin-right:2px;color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;font-weight:500;line-height:18px;cursor:pointer;flex:none;}
@media (hover:hover){.dsb-footTitle:hover{background:var(--dsw-alias-interactive-bg-hover);}}
.dsb-footTitle:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-brand-primary));outline-offset:1px;}
.dsb-foot[data-collapsed='true']{padding:5px 5px 4px;}
.dsb-chip{display:inline-flex;align-items:center;gap:3px;box-sizing:border-box;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:11px;line-height:16px;padding:1px 3px;cursor:pointer;font-variant-numeric:tabular-nums;}
.dsb-chip[data-visible='false']{opacity:.4;}
@media (hover:hover){.dsb-chip[data-visible='false']:hover{opacity:.8;}}
.dsb-chip:hover{background:var(--dsw-alias-interactive-bg-hover);}
.dsb-chip:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-brand-primary));outline-offset:1px;}
.dsb-chip[data-tone='attention'] .dsb-chipCount{color:var(--dsw-alias-state-business-primary,var(--dsw-alias-brand-primary));}
.dsb-chip[data-tone='running'] .dsb-chipCount{color:var(--dsw-alias-state-warn-primary);}
.dsb-chip[data-tone='unread'] .dsb-chipCount{color:var(--dsw-alias-state-success-primary);}
.dsb-chip[data-tone='error'] .dsb-chipCount{color:var(--dsw-alias-state-error-primary);}
.dsb-chipLabel{display:none;}
.dsb-footGap{flex:1;min-width:0;}
.dsb-footExpandAll{flex:none;display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border:0;border-radius:5px;background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer;padding:0;margin-right:2px;}
@media (hover:hover){.dsb-footExpandAll:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary);}}
.dsb-footExpandAll:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-brand-primary));outline-offset:1px;}
.dsb-footAll{border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:11px;line-height:16px;padding:1px 5px;cursor:pointer;}
.dsb-footAll[data-active='true']{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary);}
@media (hover:hover){.dsb-footAll:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary);}}
.dsb-footAll:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-brand-primary));outline-offset:1px;}
.dsb-footList{display:flex;flex-direction:column;gap:1px;max-height:min(42vh,340px);overflow:auto;--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);}
.dsb-approval{display:flex;align-items:center;gap:5px;box-sizing:border-box;margin:2px 0 3px;padding:4px 6px;border:.5px solid color-mix(in srgb,var(--dsw-alias-state-business-primary,var(--dsw-alias-brand-primary)) 30%,var(--dsw-alias-border-l1));border-radius:7px;background:color-mix(in srgb,var(--dsw-alias-state-business-primary,var(--dsw-alias-brand-primary)) 9%,transparent);font-size:11px;line-height:16px;}
.dsb-approvalTexts{flex:1;min-width:0;display:flex;flex-direction:column;gap:0;}
.dsb-approvalText{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-primary);font-size:11px;line-height:15px;}
.dsb-approvalSub{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-tertiary);font-size:10px;line-height:13px;}
.dsb-approvalMore{flex:none;color:var(--dsw-alias-label-tertiary);font-size:10px;}
.dsb-approvalAllow,.dsb-approvalReject{flex:none;display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border:0;border-radius:5px;background:transparent;cursor:pointer;padding:0;}
.dsb-approvalAllow{color:var(--dsw-alias-state-success-primary);}
.dsb-approvalReject{color:var(--dsw-alias-state-error-primary);}
@media (hover:hover){.dsb-approvalAllow:hover,.dsb-approvalReject:hover{background:var(--dsw-alias-interactive-bg-hover);}}
.dsb-approvalAllow:focus-visible,.dsb-approvalReject:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-brand-primary));outline-offset:1px;}
.dsb-approvalAllow:disabled,.dsb-approvalReject:disabled{opacity:.4;cursor:default;}
.dsb-approvalError{margin:0 1px 3px;color:var(--dsw-alias-state-error-primary);font-size:10.5px;line-height:14px;}
.dsb-approvalDot{flex:none;display:inline-block;width:6px;height:6px;border-radius:999px;background:var(--dsw-alias-state-business-primary,var(--dsw-alias-brand-primary));box-shadow:0 0 0 2px color-mix(in srgb,var(--dsw-alias-state-business-primary,var(--dsw-alias-brand-primary)) 22%,transparent);}
.dsb-project{display:flex;flex-direction:column;}
.dsb-project[data-active='true']{background:color-mix(in srgb,var(--dsw-alias-brand-primary) 9%,transparent);border-radius:6px;box-shadow:inset 2px 0 0 var(--dsw-alias-brand-primary);}
.dsb-project[data-active='true'] .dsb-projectName{font-weight:500;}
.dsb-footSortWrap{position:relative;flex:none;display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;margin-right:2px;}
.dsb-footSort{display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border:0;border-radius:5px;background:transparent;color:var(--dsw-alias-label-tertiary);padding:0;cursor:pointer;}
@media (hover:hover){.dsb-footSortWrap:hover .dsb-footSort{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary);}}
.dsb-footSortWrap:focus-within .dsb-footSort{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-brand-primary));outline-offset:1px;}
.dsb-menu{position:absolute;bottom:calc(100% + 5px);left:0;z-index:40;display:flex;flex-direction:column;gap:1px;min-width:168px;max-width:calc(100vw - 24px);padding:3px;border:.5px solid var(--dsw-alias-border-l2);border-radius:9px;background:var(--dsw-alias-bg-layer-1);box-shadow:0 10px 28px color-mix(in srgb,#000 24%,transparent);}
.dsb-menuItem{display:flex;align-items:center;gap:6px;width:100%;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;line-height:18px;padding:5px 8px;text-align:left;cursor:pointer;}
.dsb-menuItem[data-active='true'],.dsb-menuItem[aria-checked='true']{background:var(--dsw-alias-interactive-bg-hover);}
@media (hover:hover){.dsb-menuItem:hover{background:var(--dsw-alias-interactive-bg-hover);}}
.dsb-menuItem:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-2px;}
.dsb-menuCheck{display:inline-flex;flex:none;width:14px;height:14px;align-items:center;justify-content:center;color:var(--dsw-alias-brand-primary);}
.dsb-menuLabel{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.dsb-projectHead{display:flex;align-items:center;gap:1px;border-radius:6px;}
@media (hover:hover){.dsb-projectHead:hover{background:var(--dsw-alias-interactive-bg-hover);}}
.dsb-projectChevron{flex:none;display:inline-flex;align-items:center;justify-content:center;width:18px;height:20px;background:transparent;border:0;border-radius:5px;color:var(--dsw-alias-label-tertiary);cursor:pointer;padding:0;}
.dsb-projectChevron:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-brand-primary));outline-offset:-1px;}
.dsb-projectOpen{display:flex;align-items:center;gap:6px;flex:1;min-width:0;background:transparent;border:0;border-radius:6px;color:inherit;font:inherit;text-align:left;padding:3px 3px 3px 2px;cursor:pointer;}
.dsb-projectOpen:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-brand-primary));outline-offset:-2px;}
.dsb-projectName{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;line-height:17px;}
.dsb-chevron{flex:none;color:var(--dsw-alias-label-tertiary);transition:transform .12s ease;}
.dsb-chevron[data-open='true']{transform:rotate(90deg);}
@media (prefers-reduced-motion:reduce){.dsb-chevron{transition:none;}}
.dsb-counts{display:inline-flex;align-items:center;gap:4px;flex:none;}
.dsb-count{font-size:10px;line-height:14px;font-variant-numeric:tabular-nums;color:var(--dsw-alias-label-tertiary);padding:0 3px;border-radius:4px;background:var(--dsw-alias-bg-layer-2);}
.dsb-count[data-tone='running']{color:var(--dsw-alias-state-warn-primary);}
.dsb-count[data-tone='attention']{color:var(--dsw-alias-state-business-primary,var(--dsw-alias-brand-primary));}
.dsb-count[data-tone='unread']{color:var(--dsw-alias-state-success-primary);}
.dsb-count[data-tone='error']{color:var(--dsw-alias-state-error-primary);}
.dsb-chats{display:flex;flex-direction:column;margin:1px 0 3px 12px;border-left:.5px solid var(--dsw-alias-border-l2);padding-left:2px;}
.dsb-chat[data-active='true']{background:color-mix(in srgb,var(--dsw-alias-brand-primary) 8%,transparent);}
.dsb-chat[data-active='true'] .dsb-chatTitle{font-weight:500;}
.dsb-chatCompact{padding:2px 2px 2px 4px;border-top:0;border-radius:5px;gap:6px;}
@media (hover:hover){.dsb-chatCompact:hover{background:var(--dsw-alias-interactive-bg-hover);}}
.dsb-chatCompact .dsb-chatTitle{font-size:11.5px;line-height:16px;}
.dsb-chatCompact .dsb-chatState{font-size:10.5px;line-height:14px;}
.dsb-chatCompact .dsb-open{font-size:10px;line-height:14px;padding:0 5px;}
`

    /** Settings page styles: rendered with the section, removed with it. */
    const SETTINGS_CSS = `
.pws{display:flex;flex-direction:column;color:var(--dsw-alias-label-primary);}
.pws-heading{margin:0 0 4px;font-size:16px;font-weight:500;line-height:24px;}
.pws-sub{margin:0 0 8px;max-width:640px;color:var(--dsw-alias-label-secondary);font-size:12.5px;line-height:19px;}
.pws-note{margin:0 0 14px;color:var(--dsw-alias-label-tertiary);font-size:11.5px;line-height:16px;}
.pws-groupTitle{margin:16px 0 2px;font-size:13px;font-weight:500;line-height:19px;}
.pws-groupHint{margin:0 0 4px;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:17px;}
.pws-row{display:flex;align-items:center;gap:48px;padding:12px 0;border-top:.5px solid var(--dsw-alias-border-l1);}
.pws-row:first-of-type{border-top:0;}
.pws-text{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1;}
.pws-title{font-size:13px;line-height:19px;}
.pws-hint{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:17px;}
.pws-control{flex:none;display:inline-flex;align-items:center;}
.pws-seg{display:inline-flex;border:.5px solid var(--dsw-alias-border-l2);border-radius:8px;overflow:hidden;background:var(--dsw-alias-bg-layer-1);}
.pws-segItem{border:0;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;line-height:18px;padding:3px 10px;cursor:pointer;white-space:nowrap;}
.pws-segItem+.pws-segItem{border-left:.5px solid var(--dsw-alias-border-l1);}
.pws-segItem[aria-pressed='true']{background:color-mix(in srgb,var(--dsw-alias-brand-primary) 12%,transparent);color:var(--dsw-alias-label-primary);}
@media (hover:hover){.pws-segItem:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary);}}
.pws-segItem:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-brand-primary));outline-offset:-2px;}
.pws-switch{position:relative;flex:none;width:34px;height:20px;padding:0;border:.5px solid var(--dsw-alias-border-l2);border-radius:999px;background:var(--dsw-alias-bg-layer-2);cursor:pointer;}
.pws-knob{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:999px;background:var(--dsw-alias-label-secondary);transition:transform .12s ease,background .12s ease;}
.pws-switch[aria-checked='true']{background:var(--dsw-alias-brand-primary);border-color:transparent;}
.pws-switch[aria-checked='true'] .pws-knob{transform:translateX(14px);background:var(--dsw-alias-bg-layer-1);}
.pws-switch:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-brand-primary));outline-offset:2px;}
@media (prefers-reduced-motion:reduce){.pws-knob{transition:none;}}
.pws-actions{margin-top:20px;padding-top:14px;border-top:.5px solid var(--dsw-alias-border-l1);}
.pws-reset{border:.5px solid var(--dsw-alias-border-l2);border-radius:8px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;line-height:18px;padding:4px 12px;cursor:pointer;}
@media (hover:hover){.pws-reset:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary);}}
.pws-reset:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-brand-primary));outline-offset:1px;}
`

    /** The page-local stylesheet element. @returns the style element. */
    function StyleSheet() {
      return h('style', { 'data-projects-board': '' }, CSS)
    }

    /* ------------------------------------------------------------------ *
     * Plugin
     * ------------------------------------------------------------------ */

    return {
      inject: ['slots', 'locale', 'sessions', 'workspaces', 'uiWorkspace'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, dictionaries), 'projects-board: dictionaries')
        const tr = ctx.locale.bind(NS)
        const board = createBoardStore(ctx, tr)
        const sort = createSortStore()
        const visible = createVisibleStore()
        const collapsed = createCollapsedStore()
        const prefs = createPrefsStore()

        ctx.effect(() => {
          board.attach()
          return () => board.dispose()
        }, 'projects-board: projections')

        const navigation = {
          openSession: sessionId => ctx.uiWorkspace.openSession(sessionId),
        }

        /* ---- Sidebar footer order (shared convention with @local/sidebar-widget-order) ---- */
        const SIDEBAR_ORDER_KEY = 'dsh.sidebar.footer.order.v1'
        const SIDEBAR_ORDER_EVENT = 'dsh/sidebar-footer-order'

        const readSidebarOrder = () => {
          try {
            const raw = typeof localStorage === 'undefined' ? null : localStorage.getItem(SIDEBAR_ORDER_KEY)
            const list = raw === null ? [] : JSON.parse(raw)
            return Array.isArray(list) ? list.filter(id => typeof id === 'string') : []
          } catch {
            return []
          }
        }

        const sidebarOrder = (id, fallback) => {
          const index = readSidebarOrder().indexOf(id)
          return index < 0 ? fallback : (index + 1) * 10
        }

        ctx.slots.inject('sidebar.footer.action', () => {
          let disposeEntry
          let live = true

          const install = () => {
            if (!live) return
            if (disposeEntry !== undefined) disposeEntry()
            disposeEntry = ctx.slots.register(
              {
                name: 'sidebar.footer.action',
                id: 'projects-board-foot',
                order: sidebarOrder('projects-board-foot', -10),
                locale: NS,
                label: () => tr('panel'),
                inject: () => ({ board, sort, visible, collapsed, prefs, tr, ...navigation }),
              },
              ProjectsFooter,
            )
          }

          install()
          const off = ctx.on(SIDEBAR_ORDER_EVENT, install)
          return () => {
            live = false
            off()
            if (disposeEntry !== undefined) disposeEntry()
          }
        })

        ctx.effect(
          () =>
            ctx.slots.inject('settings.section', () =>
              ctx.slots.register(
                {
                  name: 'settings.section',
                  id: 'projects-board',
                  order: 40,
                  locale: NS,
                  label: () => tr('settings.nav'),
                  inject: () => ({ sort, visible, collapsed, prefs, tr }),
                },
                ProjectsSettingsSection,
              ),
            ),
          'projects-board: settings section',
        )

        ctx.effect(
          () =>
            ctx.slots.inject('settings.section.icon', () =>
              ctx.slots.register({ name: 'settings.section.icon', id: 'projects-board', order: 40 }, ProjectsSettingsIcon),
            ),
          'projects-board: settings icon',
        )
      },
    }
  },
})
