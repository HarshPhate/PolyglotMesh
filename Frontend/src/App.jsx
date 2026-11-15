import { useMemo, useState } from 'react'
import './App.css'

const initialCode = {
  javascript: `// Welcome to PolyglotMesh\n// Write JavaScript and press Run\n\nconst message = "Hello from JavaScript!";\nconsole.log(message);\nconsole.log(10 + 20);`,
  python: `# Welcome to PolyglotMesh\n# Write Python and press Run\n\nmessage = "Hello from Python!"\nprint(message)\nprint(10 + 20)`,
  java: `// Welcome to PolyglotMesh\n// Write Java and press Run\n\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from Java!");\n        System.out.println(10 + 20);\n    }\n}`,
}

const languageMeta = {
  javascript: { label: 'JavaScript', ext: 'js', color: '#e9bd4b' },
  python: { label: 'Python', ext: 'py', color: '#5c9fe6' },
  java: { label: 'Java', ext: 'java', color: '#e58b58' },
}

const navGroups = [
  { title: 'WORKSPACE', items: [{ id: 'editor', icon: '⌘', label: 'Code Editor' }, { id: 'dashboard', icon: '▦', label: 'Overview' }, { id: 'history', icon: '◷', label: 'Execution History' }] },
  { title: 'INSIGHTS', items: [{ id: 'metrics', icon: '▥', label: 'Performance Metrics' }, { id: 'database', icon: '▤', label: 'Data Binding' }] },
]

function Icon({ children, className = '' }) { return <span aria-hidden="true" className={`icon ${className}`}>{children}</span> }

function App() {
  const [page, setPage] = useState('editor')
  const [language, setLanguage] = useState('javascript')
  const [codes, setCodes] = useState(initialCode)
  const [output, setOutput] = useState(['Ready. Select a language and run your code.'])
  const [runState, setRunState] = useState('idle')
  const [runs, setRuns] = useState([])
  const [activeTab, setActiveTab] = useState('output')
  const [theme, setTheme] = useState('dark')
  const [showSettings, setShowSettings] = useState(false)
  const [projectName, setProjectName] = useState('untitled-project')
  const [toast, setToast] = useState('')

  const currentMeta = languageMeta[language]
  const executionCount = runs.length
  const averageTime = runs.length ? (runs.reduce((sum, run) => sum + run.time, 0) / runs.length).toFixed(2) : '0.00'
  const successRate = runs.length ? Math.round((runs.filter((run) => run.status === 'Success').length / runs.length) * 100) : 100

  const pageTitle = useMemo(() => ({ editor: 'Code Editor', dashboard: 'Overview', history: 'Execution History', metrics: 'Performance Metrics', database: 'Data Binding' }[page]), [page])

  function notify(message) {
    setToast(message)
    window.setTimeout(() => setToast(''), 2200)
  }

  function runCode() {
    setRunState('running')
    setActiveTab('output')
    setOutput(['Preparing isolated execution context…', `Runtime: ${currentMeta.label}`, 'Executing code…'])
    window.setTimeout(() => {
      const code = codes[language]
      const lines = []
      if (language === 'python') {
        const matches = [...code.matchAll(/print\((.*?)\)/g)]
        matches.forEach((match) => {
          const value = match[1].trim()
          if (/^['"].*['"]$/.test(value)) lines.push(value.slice(1, -1))
          else if (/^\d+\s*[+*-]\s*\d+$/.test(value)) {
            try { lines.push(String(Function(`return ${value}`)())) } catch { lines.push(value) }
          } else lines.push(value)
        })
      } else if (language === 'javascript') {
        const logs = [...code.matchAll(/console\.log\((.*?)\)/g)]
        logs.forEach((match) => {
          const value = match[1].trim()
          if (/^['"].*['"]$/.test(value)) lines.push(value.slice(1, -1))
          else if (/^\d+\s*[+*-]\s*\d+$/.test(value)) {
            try { lines.push(String(Function(`return ${value}`)())) } catch { lines.push(value) }
          } else lines.push(value)
        })
      } else {
        const strings = [...code.matchAll(/System\.out\.println\((.*?)\)/g)]
        strings.forEach((match) => {
          const value = match[1].trim()
          if (/^['"].*['"]$/.test(value)) lines.push(value.slice(1, -1))
          else if (/^\d+\s*[+*-]\s*\d+$/.test(value)) {
            try { lines.push(String(Function(`return ${value}`)())) } catch { lines.push(value) }
          } else lines.push(value)
        })
      }
      const time = Number((Math.random() * 7 + 2).toFixed(2))
      const result = lines.length ? lines : ['Program finished with no captured output.']
      setOutput(['Execution completed successfully.', '', ...result, '', `Process finished · ${time} ms`])
      setRuns((old) => [{ id: Date.now(), language: currentMeta.label, time, status: 'Success', date: new Date().toLocaleTimeString() }, ...old])
      setRunState('success')
    }, 650)
  }

  function stopCode() {
    setRunState('idle')
    setOutput(['Execution stopped by user.'])
  }

  function clearOutput() { setOutput([]); notify('Console cleared') }

  return (
    <div className={`app-shell ${theme}`}>
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark">P<span>m</span></div><div><strong>PolyglotMesh</strong><small>RUNTIME WORKSPACE</small></div></div>
        <button className="workspace-switch"><span className="workspace-dot" /> {projectName} <span className="chevron">⌄</span></button>
        <div className="nav-scroll">
          {navGroups.map((group) => <div className="nav-group" key={group.title}><div className="nav-heading">{group.title}</div>{group.items.map((item) => <button key={item.id} className={`nav-item ${page === item.id ? 'active' : ''}`} onClick={() => setPage(item.id)}><Icon>{item.icon}</Icon>{item.label}{item.id === 'editor' && <span className="nav-live" />}</button>)}</div>)}
        </div>
        <div className="sidebar-bottom"><div className="runtime-card"><div className="runtime-top"><span className="status-dot"/> Runtime status</div><strong>Sandbox ready</strong><small>GraalVM · Connected UI</small></div><button className="nav-item" onClick={() => setShowSettings(true)}><Icon>⚙</Icon> Settings</button><div className="profile"><div className="avatar">G</div><div><strong>Developer</strong><small>Local workspace</small></div><span className="more">•••</span></div></div>
      </aside>

      <main className="main-area">
        <header className="topbar"><div className="breadcrumbs"><span>Workspace</span><b>/</b><strong>{pageTitle}</strong></div><div className="top-actions"><div className="connection"><span className="status-dot"/> All systems operational</div><button className="icon-button" title="Toggle theme" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>◐</button><button className="icon-button" title="Settings" onClick={() => setShowSettings(true)}>⚙</button><div className="avatar small-avatar">G</div></div></header>

        {page === 'editor' && <>
          <section className="page-heading editor-heading"><div><div className="eyebrow">DEVELOPMENT ENVIRONMENT</div><h1>Code Editor</h1><p>Write, run and inspect programs across multiple languages.</p></div><div className="heading-actions"><span className="autosave"><span className="status-dot"/> All changes saved</span><button className="secondary-button" onClick={() => notify('Share link copied (demo)')}>↗ Share</button></div></section>
          <section className="editor-toolbar"><div className="file-label"><span className="file-icon">▣</span><span>{projectName}</span><span className="slash">/</span><strong>main.{currentMeta.ext}</strong><span className="unsaved-dot" /></div><div className="toolbar-right"><span className="runtime-label"><span className="status-dot"/> GraalVM runtime</span><button className="secondary-button compact" onClick={() => { setCodes({ ...codes, [language]: initialCode[language] }); notify('Starter code restored') }}>↺ Reset</button><button className="run-button" onClick={runCode} disabled={runState === 'running'}><span>▶</span> {runState === 'running' ? 'Running…' : 'Run Code'}</button><button className="stop-button" onClick={stopCode} disabled={runState !== 'running'}>■</button></div></section>
          <section className="language-tabs">{Object.keys(languageMeta).map((key) => <button key={key} className={`language-tab ${language === key ? 'selected' : ''}`} onClick={() => setLanguage(key)}><span className="language-dot" style={{ background: languageMeta[key].color }} />{languageMeta[key].label}{language === key && <span className="tab-close">×</span>}</button>)}<button className="add-tab" onClick={() => notify('More runtimes can be enabled when backend support is available')}>＋</button><span className="tab-spacer"/><span className="editor-info">UTF-8&nbsp;&nbsp; · &nbsp;&nbsp;Spaces: 4&nbsp;&nbsp; · &nbsp;&nbsp;{currentMeta.label}</span></section>
          <div className="workspace-grid"><section className="code-panel"><div className="panel-title"><div><span className="panel-dot"/> main.{currentMeta.ext}</div><div className="panel-tools"><span>⌘</span><button onClick={() => { navigator.clipboard?.writeText(codes[language]); notify('Code copied') }} title="Copy code">▢</button><button onClick={() => setCodes({ ...codes, [language]: '' })} title="Clear editor">⌫</button></div></div><div className="code-editor"><div className="line-numbers">{codes[language].split('\n').map((_, i) => <span key={i}>{i + 1}</span>)}</div><textarea aria-label="Code editor" spellCheck="false" value={codes[language]} onChange={(event) => setCodes({ ...codes, [language]: event.target.value })} /></div><div className="editor-footer"><span>● {runState === 'running' ? 'Executing' : 'Ready'}</span><span>Ln {codes[language].split('\n').length}, Col 1</span></div></section>
            <section className="console-panel"><div className="console-header"><div className="console-tabs"><button className={activeTab === 'output' ? 'active' : ''} onClick={() => setActiveTab('output')}>Output</button><button className={activeTab === 'problems' ? 'active' : ''} onClick={() => setActiveTab('problems')}>Problems <span className="problem-count">0</span></button><button className={activeTab === 'terminal' ? 'active' : ''} onClick={() => setActiveTab('terminal')}>Terminal</button></div><button className="clear-button" onClick={clearOutput}>Clear console</button></div><div className="console-content">{activeTab === 'output' ? output.map((line, index) => <div className={`output-line ${index === 0 && line.includes('successfully') ? 'success-line' : ''}`} key={`${line}-${index}`}>{line || '\u00a0'}</div>) : activeTab === 'problems' ? <div className="empty-state"><span>✓</span><strong>No problems detected</strong><small>Diagnostics will appear here.</small></div> : <div className="output-line">$ PolyglotMesh terminal ready (demo)</div>}</div><div className="console-status"><span><span className="status-dot"/> {runState === 'running' ? 'Running' : 'Idle'}</span><span>Sandbox · Mock execution</span></div></section></div>
          <section className="bottom-stats"><div className="stat-card"><span className="stat-icon blue">◷</span><div><small>Last execution</small><strong>{runs[0] ? `${runs[0].time} ms` : '—'}</strong></div></div><div className="stat-card"><span className="stat-icon purple">▣</span><div><small>Memory used</small><strong>{runs.length ? '24.8 MB' : '—'}</strong></div></div><div className="stat-card"><span className="stat-icon green">✓</span><div><small>Execution status</small><strong>{runState === 'success' ? 'Successful' : runState === 'running' ? 'Running' : 'Waiting'}</strong></div></div><div className="stat-card"><span className="stat-icon amber">⌁</span><div><small>Runtime</small><strong>GraalVM Sandbox</strong></div></div></section>
        </>}

        {page === 'dashboard' && <><section className="page-heading"><div><div className="eyebrow">WORKSPACE SUMMARY</div><h1>Overview</h1><p>Welcome back. Here's what's happening in your workspace.</p></div><button className="run-button" onClick={() => setPage('editor')}>Open Editor →</button></section><div className="dashboard-grid"><div className="overview-card accent-card"><div className="card-kicker">ACTIVE WORKSPACE</div><h2>{projectName}</h2><p>Your multi-language development environment is ready.</p><div className="language-pills">{Object.keys(languageMeta).map((key) => <span key={key}><i style={{ background: languageMeta[key].color }}/>{languageMeta[key].label}</span>)}</div><button className="light-button" onClick={() => setPage('editor')}>Continue coding →</button></div><div className="metric-tile"><small>Total executions</small><strong>{executionCount}</strong><span>Across all languages</span></div><div className="metric-tile"><small>Average execution</small><strong>{averageTime} <em>ms</em></strong><span>Runtime duration</span></div><div className="metric-tile"><small>Success rate</small><strong>{successRate}%</strong><span>Successful runs</span></div><div className="content-card recent-card"><div className="card-header"><h3>Recent executions</h3><button onClick={() => setPage('history')}>View history →</button></div>{runs.length ? runs.slice(0, 5).map((run) => <div className="history-row" key={run.id}><span className="history-language">{run.language.slice(0, 2).toUpperCase()}</span><div><strong>{run.language} execution</strong><small>{run.date}</small></div><span className="success-tag">{run.status}</span><b>{run.time} ms</b></div>) : <div className="empty-state"><span>⌘</span><strong>No executions yet</strong><small>Run your first program in the Code Editor.</small><button className="secondary-button" onClick={() => setPage('editor')}>Open editor</button></div>}</div><div className="content-card runtime-overview"><div className="card-header"><h3>Runtime environment</h3><span className="ready-pill">● Ready</span></div><div className="runtime-detail"><span>Execution engine</span><strong>GraalVM Polyglot</strong></div><div className="runtime-detail"><span>Sandbox isolation</span><strong>Backend integration pending</strong></div><div className="runtime-detail"><span>Supported interfaces</span><strong>3 languages</strong></div><small className="muted-note">Runtime details shown here are illustrative until connected to the backend.</small></div></div></>}

        {page === 'history' && <><section className="page-heading"><div><div className="eyebrow">ACTIVITY</div><h1>Execution History</h1><p>Review recent program runs in this workspace.</p></div><button className="secondary-button" onClick={() => { setRuns([]); notify('Local history cleared') }}>Clear history</button></section><section className="content-card table-card"><div className="table-head"><h3>Recent runs</h3><span>{runs.length} executions</span></div>{runs.length ? <table><thead><tr><th>LANGUAGE</th><th>DATE / TIME</th><th>DURATION</th><th>STATUS</th></tr></thead><tbody>{runs.map((run) => <tr key={run.id}><td><span className="history-language">{run.language.slice(0, 2).toUpperCase()}</span>{run.language}</td><td>{run.date}</td><td>{run.time} ms</td><td><span className="success-tag">{run.status}</span></td></tr>)}</tbody></table> : <div className="empty-state"><span>◷</span><strong>No execution history</strong><small>Your completed code runs will appear here.</small><button className="secondary-button" onClick={() => setPage('editor')}>Go to editor</button></div>}</section></>}

        {page === 'metrics' && <><section className="page-heading"><div><div className="eyebrow">RUNTIME OBSERVABILITY</div><h1>Performance Metrics</h1><p>Inspect execution duration, memory and runtime health.</p></div><span className="demo-label">DEMO DATA</span></section><div className="metric-summary"><div className="metric-tile"><small>Executions</small><strong>{executionCount}</strong><span>Current session</span></div><div className="metric-tile"><small>Average duration</small><strong>{averageTime} <em>ms</em></strong><span>Across recorded runs</span></div><div className="metric-tile"><small>Success rate</small><strong>{successRate}%</strong><span>Current session</span></div><div className="metric-tile"><small>Peak memory</small><strong>{runs.length ? '24.8' : '—'} <em>MB</em></strong><span>Illustrative measurement</span></div></div><div className="content-card chart-card"><div className="card-header"><div><h3>Execution performance</h3><small className="muted-note">Recent local runs · illustrative chart</small></div><span className="chart-legend"><i/> Duration (ms)</span></div><div className="chart-area"><div className="chart-y"><span>10 ms</span><span>7.5 ms</span><span>5 ms</span><span>2.5 ms</span><span>0</span></div><div className="chart-plot"><div className="chart-gridlines"><i/><i/><i/><i/><i/></div><div className="bars">{(runs.length ? runs.slice(0, 8).reverse() : [{ time: 3.2 }, { time: 5.8 }, { time: 4.1 }, { time: 7.2 }, { time: 3.9 }]).map((run, i) => <div className="bar-column" key={i}><div className="bar" style={{ height: `${Math.min(run.time * 10, 95)}%` }} /><small>{runs.length ? `Run ${i + 1}` : `Sample ${i + 1}`}</small></div>)}</div></div></div><p className="chart-footnote">Connect the backend metrics API to replace these illustrative values with actual GraalVM measurements.</p></div></>}

        {page === 'database' && <><section className="page-heading"><div><div className="eyebrow">APPLICATION DATA</div><h1>Data Binding</h1><p>Configure data sources and inspect bound records.</p></div><button className="secondary-button" onClick={() => notify('Connection test is a frontend demo')}>Test connection</button></section><div className="database-grid"><section className="content-card connection-card"><div className="card-header"><h3>Database connection</h3><span className="pending-pill">Not connected</span></div><label>Connection name<input defaultValue="Local MongoDB" /></label><label>Database type<select defaultValue="mongodb"><option value="mongodb">MongoDB</option><option value="other">Other data source</option></select></label><label>Connection string<input type="password" placeholder="mongodb://localhost:27017" /></label><div className="helper-text">Credentials and connection details are not sent anywhere in this frontend demo.</div><button className="run-button full-button" onClick={() => notify('Backend connection endpoint is not configured')}>Save connection</button></section><section className="content-card data-card"><div className="card-header"><h3>Sample collection</h3><span className="demo-label">MOCK DATA</span></div><div className="collection-name">▤ &nbsp; polyglotmesh.samples <span>3 documents</span></div><table><thead><tr><th>_id</th><th>name</th><th>language</th><th>status</th></tr></thead><tbody><tr><td>001</td><td>Hello World</td><td>Python</td><td><span className="success-tag">Ready</span></td></tr><tr><td>002</td><td>Quick Sort</td><td>Java</td><td><span className="success-tag">Ready</span></td></tr><tr><td>003</td><td>Array Demo</td><td>JavaScript</td><td><span className="success-tag">Ready</span></td></tr></tbody></table><p className="chart-footnote">Sample records are static placeholders until database APIs are available.</p></section></div></>}
      </main>

      {showSettings && <div className="modal-backdrop" onClick={() => setShowSettings(false)}><section className="settings-modal" onClick={(event) => event.stopPropagation()}><div className="modal-header"><div><div className="eyebrow">PREFERENCES</div><h2>Workspace settings</h2></div><button className="icon-button" onClick={() => setShowSettings(false)}>×</button></div><label>Project name<input value={projectName} onChange={(event) => setProjectName(event.target.value)} /></label><label>Appearance<select value={theme} onChange={(event) => setTheme(event.target.value)}><option value="dark">Dark</option><option value="light">Light</option></select></label><div className="helper-text">Settings are stored for this page session only. Persistent preferences can be added later.</div><button className="run-button full-button" onClick={() => { setShowSettings(false); notify('Settings applied') }}>Save settings</button></section></div>}
      {toast && <div className="toast">✓ {toast}</div>}
    </div>
  )
}

export default App
