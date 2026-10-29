(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const STORE = {
    moods: 'thalia_moods_v1',
    thoughts: 'thalia_thoughts_v1',
    projects: 'thalia_projects_v1',
    progress: 'thalia_progress_v1',
    notes: 'thalia_notes_v1'
  };
  const MOODS = [
    { key: 'satisfied', emoji: '😽', name: '满足' },
    { key: 'happy', emoji: '😸', name: '开心' },
    { key: 'little-happy', emoji: '😺', name: '小开心' },
    { key: 'super-happy', emoji: '😻', name: '超开心' },
    { key: 'sad', emoji: '😿', name: '难过' },
    { key: 'angry', emoji: '😾', name: '生气' },
    { key: 'breakdown', emoji: '🙀', name: '崩溃' },
    { key: 'calm', emoji: '🐱', name: '平静' }
  ];
  const TONES = ['gold', 'rose', 'copper', 'taupe'];
  const pad = n => String(n).padStart(2, '0');
  const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const addDays = (base, n) => {
    const d = new Date(base.getFullYear(), base.getMonth(), base.getDate());
    d.setDate(d.getDate() + n);
    return d;
  };
  const today = new Date();
  const todayKey = iso(today);
  const dateLabel = key => {
    if (!key) return '日期未定';
    const d = new Date(key + 'T00:00:00');
    if (Number.isNaN(d.getTime())) return key;
    return `${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
  };
  const weekday = key => {
    const d = new Date(key + 'T00:00:00');
    return ['SUN','MON','TUE','WED','THU','FRI','SAT'][d.getDay()];
  };
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[ch]));
  const uid = () => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()));
  const read = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
  };
  const write = (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { console.warn('保存失败', e); }
  };

  let state = {
    moods: read(STORE.moods, []),
    thoughts: read(STORE.thoughts, []),
    projects: read(STORE.projects, []),
    progress: read(STORE.progress, []),
    notes: read(STORE.notes, [])
  };

  const seed = () => {
    if (!state.moods.length) {
      state.moods = [
        { date: iso(addDays(today, -6)), mood: 'little-happy', note: '' },
        { date: iso(addDays(today, -5)), mood: 'satisfied', note: '' },
        { date: iso(addDays(today, -4)), mood: 'calm', note: '' },
        { date: iso(addDays(today, -3)), mood: 'breakdown', note: '' },
        { date: iso(addDays(today, -2)), mood: 'angry', note: '' },
        { date: iso(addDays(today, -1)), mood: 'happy', note: '' },
        { date: todayKey, mood: 'super-happy', note: '今天把页面定下来了。' }
      ];
      write(STORE.moods, state.moods);
    }
    if (!state.projects.length) {
      state.projects = [
        { id: 'p-vision', name: '智能车视觉', status: '进行中', deadline: '2026-11-25', description: '完成反光保护回归测试。明天把近处 error 和 valid 再对齐一次。', tone: 'gold', progress: 68 },
        { id: 'p-project', name: '大创立项', status: '进行中', deadline: '2026-12-18', description: '整理立项书框架，把等离子体表面改性拆成三个可验证的问题。', tone: 'rose', progress: 36 },
        { id: 'p-contest', name: '比赛', status: '计划中', deadline: '2026-11-25', description: '确认报名、材料和比赛当天清单，把能提前完成的事先收掉。', tone: 'copper', progress: 42 },
        { id: 'p-ielts', name: '雅思', status: '进行中', deadline: '', description: '保持听力和口语手感，整理素材；不设每天必须完成的硬任务。', tone: 'taupe', progress: 58 }
      ];
      write(STORE.projects, state.projects);
    }
    if (!state.progress.length) {
      state.progress = [
        { id: 'g1', projectId: 'p-vision', date: todayKey, text: '完成反光保护回归测试。明天把近处 error 和 valid 再对齐一次。', link: '', progress: 68 },
        { id: 'g2', projectId: 'p-project', date: iso(addDays(today, -1)), text: '整理立项书框架，把等离子体表面改性拆成三个可验证的问题。', link: '', progress: 36 },
        { id: 'g3', projectId: 'p-contest', date: todayKey, text: '确认报名、材料和比赛当天清单，把能提前完成的事先收掉。', link: '', progress: 42 },
        { id: 'g4', projectId: 'p-ielts', date: iso(addDays(today, -1)), text: '保持听力和口语手感，整理素材；不设每天必须完成的硬任务。', link: '', progress: 58 }
      ];
      write(STORE.progress, state.progress);
    }
    if (!state.thoughts.length) {
      state.thoughts = [
        { id: 't1', date: todayKey, title: '关于“把生活整理成自己的房间”', body: '也许我想要的不是一个更漂亮的日记本，而是一个能回头看的地方。' },
        { id: 't2', date: iso(addDays(today, -2)), title: '今天不想做正确的人', body: '只想先把那口气留在纸上，不急着变成一个情绪稳定的大人。' },
        { id: 't3', date: iso(addDays(today, -5)), title: '给未来的自己', body: '如果有一天你忘了现在的自己有多用力，就回来看看这一页。' }
      ];
      write(STORE.thoughts, state.thoughts);
    }
    if (!state.notes.length) {
      state.notes = [
        { id: 'n1', title: '大物期中考试', body: '把错题和公式再过一遍。焦虑没有用，先做一页算一页。', date: iso(addDays(today, 14)) },
        { id: 'n2', title: '等离子体大赛', body: '明年 3 月 · 官方通知未定', date: '2027-03-15' },
        { id: 'n3', title: '给房间换一盏灯', body: '想要一盏不刺眼的黄光台灯。', date: '' },
        { id: 'n4', title: '读完《一间自己的房间》', body: '慢慢读，不写读书报告。', date: '' }
      ];
      write(STORE.notes, state.notes);
    }
  };

  seed();

  const saveAll = () => {
    write(STORE.moods, state.moods);
    write(STORE.thoughts, state.thoughts);
    write(STORE.projects, state.projects);
    write(STORE.progress, state.progress);
    write(STORE.notes, state.notes);
  };

  const renderMoods = () => {
    const wrap = $('.week-row');
    if (!wrap) return;
    wrap.innerHTML = Array.from({ length: 7 }).map((_, index) => {
      const date = addDays(today, index - 6);
      const key = iso(date);
      const item = state.moods.find(m => m.date === key);
      const mood = MOODS.find(m => m.key === item?.mood);
      const moodKey = mood ? mood.key : 'none';
      return `<div class="day mood-${moodKey} ${key === todayKey ? 'today' : ''}" data-mood-date="${key}" title="点击记录 ${key} 的心情">
        <span class="weekday">${weekday(key)}</span>
        <span class="cat">${mood ? mood.emoji : '🐾'}</span>
        <span class="mood-name">${mood ? mood.name : '未记录'}</span>
        <span class="date">${dateLabel(key)}</span>
      </div>`;
    }).join('');
    $$('.week-row .day').forEach(el => el.addEventListener('click', () => openMoodPicker(el.dataset.moodDate)));
  };

  const renderProjects = () => {
    const wrap = $('.projects');
    if (!wrap) return;
    const activeProjects = state.projects.filter(project => project.status !== '已完成');
    const allCount = $('#allProjectsCount');
    if (allCount) allCount.textContent = String(state.projects.length);
    if (!activeProjects.length) {
      wrap.innerHTML = state.projects.length
        ? '<div class="projects-empty">目前没有进行中的项目。<a class="view-all" href="projects.html">去全部项目看看 ↗</a></div>'
        : '<div class="projects-empty">还没有项目。点右上角“＋ 记录”，新建一个。</div>';
      return;
    }
    wrap.innerHTML = activeProjects.map(project => {
      const logs = state.progress.filter(p => p.projectId === project.id).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      const latest = logs[0];
      return `<article class="project tone-${escapeHtml(project.tone || 'gold')}" data-project-id="${escapeHtml(project.id)}">
        <div class="project-top"><h3>${escapeHtml(project.name)}</h3><span class="status">${escapeHtml(project.status || '进行中')}</span></div>
        <p>${escapeHtml(latest?.text || project.description || '还没有进展，也没关系。')}</p>
        ${latest?.link ? `<a class="latest-progress" href="${escapeHtml(latest.link)}" target="_blank" rel="noreferrer">打开进展链接 ↗</a>` : ''}
        <div class="progress-line"><i style="width:${Math.max(0, Math.min(100, Number(project.progress ?? 0)))}%"></i></div>
        <div class="project-meta"><span>最近更新 · ${latest ? dateLabel(latest.date) : '暂无'}</span><span>${project.deadline ? '截止 ' + dateLabel(project.deadline) : '长期'}</span></div>
      </article>`;
    }).join('');
    $$('.projects .project').forEach(card => card.addEventListener('click', () => { window.location.href = 'project.html?id=' + encodeURIComponent(card.dataset.projectId); }));
  };

  const renderThoughts = () => {
    const wrap = $('.thoughts');
    if (!wrap) return;
    const recent = [...state.thoughts].sort((a, b) => (b.date || '').localeCompare(a.date || '')).slice(0, 3);
    if (!recent.length) {
      wrap.innerHTML = '<li><div class="thought-row"><span class="thought-excerpt">还没有想说的话。</span></div></li>';
      return;
    }
    wrap.innerHTML = recent.map(t => `<li>
      <time>${dateLabel(t.date)}</time>
      <div class="thought-row"><a class="thought-title" href="notes.html?note=${encodeURIComponent(t.id)}">${escapeHtml(t.title)}</a><p class="thought-excerpt">${escapeHtml(t.body)}</p></div>
      <span class="arrow">↗</span>
    </li>`).join('');
  };

  const daysUntil = key => {
    if (!key) return null;
    const d = new Date(key + 'T00:00:00');
    if (Number.isNaN(d.getTime())) return null;
    const a = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return Math.round((d - a) / 86400000);
  };

  const renderNotes = () => {
    const board = $('.sticky-board');
    if (!board) return;
    const sorted = [...state.notes].sort((a, b) => {
      const da = daysUntil(a.date), db = daysUntil(b.date);
      if (da === null && db === null) return 0;
      if (da === null) return 1;
      if (db === null) return -1;
      return da - db;
    });
    const urgent = sorted.filter(n => { const d = daysUntil(n.date); return d !== null && d >= 0 && d <= 30; });
    const long = sorted.filter(n => { const d = daysUntil(n.date); return d === null || d > 30 || d < 0; });
    const renderNote = n => {
      const d = daysUntil(n.date);
      return `<div class="${d !== null && d >= 0 && d <= 30 ? 'urgent-note' : 'long-note'}">
        <button class="note-delete" data-delete-note="${n.id}" title="删除便签">×</button>
        <h3>${escapeHtml(n.title)}</h3>
        <time>${d === null ? '日期未定' : dateLabel(n.date) + (d < 0 ? ' · 已过期' : d === 0 ? ' · 今天' : ` · 还有 ${d} 天`)}</time>
      </div>`;
    };
    board.innerHTML = `<div class="board-title"><h2>便签</h2><span>ONE BOARD · ALL NOTES</span></div>
      <div class="urgent-block"><div class="urgent-label">近期重要 · 一个月内</div>${urgent.length ? urgent.map(renderNote).join('') : '<div class="notes-empty">这一个月没有临近的重要事项。</div>'}</div>
      <p class="long-label">长期与未定日期</p>
      <div class="long-list">${long.length ? long.map(renderNote).join('') : '<div class="notes-empty">还没有长期便签。</div>'}</div>`;
    $$('[data-delete-note]').forEach(btn => btn.addEventListener('click', e => {
      e.stopPropagation();
      if (!confirm('删除这条便签？')) return;
      state.notes = state.notes.filter(n => n.id !== btn.dataset.deleteNote);
      write(STORE.notes, state.notes);
      renderNotes();
    }));
  };

  const openMoodPicker = (dateKey) => {
    const old = $('.mood-picker'); if (old) old.remove();
    const row = $('.week-row'); if (!row) return;
    const current = state.moods.find(m => m.date === dateKey)?.mood;
    const picker = document.createElement('div');
    picker.className = 'mood-picker';
    picker.innerHTML = `<div class="mood-picker-label">选择 ${dateKey} 的心情</div>` + MOODS.map(m => `<button class="mood-choice ${m.key === current ? 'current' : ''}" data-mood-key="${m.key}"><b>${m.emoji}</b>${m.name}</button>`).join('');
    row.insertAdjacentElement('afterend', picker);
    $$('.mood-choice', picker).forEach(btn => btn.addEventListener('click', () => {
      state.moods = state.moods.filter(m => m.date !== dateKey);
      state.moods.push({ date: dateKey, mood: btn.dataset.moodKey, note: '' });
      write(STORE.moods, state.moods);
      picker.remove();
      renderMoods();
    }));
  };

  const renderAll = () => { renderMoods(); renderProjects(); renderThoughts(); renderNotes(); };

  const formShell = (kicker, title, fields, submit = '保存') => `
    <p class="modal-kicker">${kicker}</p><h2 class="modal-title">${title}</h2>
    <form class="modal-form" id="recordForm">
      ${fields}
      <div class="form-error" id="formError"></div>
      <div class="modal-actions"><button type="button" class="btn" data-close>取消</button><button class="btn primary" type="submit">${submit}</button></div>
    </form>`;

  const moodFields = (date = todayKey) => `<div class="form-field"><label>日期</label><input name="date" type="date" value="${escapeHtml(date)}" required></div>
    <div class="form-field"><label>今天像哪只猫</label><select name="mood" required>${MOODS.map(m => `<option value="${m.key}">${m.emoji} ${m.name}</option>`).join('')}</select></div>
    <div class="form-field"><label>备注（可选）</label><textarea name="note" placeholder="今天发生了什么"></textarea></div>`;

  const thoughtFields = () => `<div class="form-field"><label>标题</label><input name="title" required placeholder="一句话标题"></div>
    <div class="form-field"><label>正文</label><textarea name="body" required placeholder="想说什么就写什么"></textarea></div>`;

  const projectFields = () => `<div class="form-field"><label>项目名</label><input name="name" required placeholder="比如：等离子体大赛"></div>
    <div class="form-field"><label>截止日期（可选）</label><input name="deadline" type="date"></div>
    <div class="form-field"><label>状态</label><select name="status"><option>进行中</option><option>计划中</option><option>已完成</option></select></div>
    <div class="form-field"><label>简介（可选）</label><textarea name="description" placeholder="这个项目在做什么"></textarea></div>`;

  const progressFields = () => `<div class="form-field"><label>选择项目</label><select name="projectId" required>${state.projects.map(p => `<option value="${p.id}">${escapeHtml(p.name)}</option>`).join('')}</select></div>
    <div class="form-field"><label>进展</label><textarea name="text" required placeholder="今天推进了什么"></textarea></div>
    <div class="form-field"><label>链接（可选）</label><input name="link" type="url" placeholder="https://"></div>
    <div class="form-field"><label>进度 %（可选）</label><input name="progress" type="number" min="0" max="100" value="50"></div>`;

  const noteFields = () => `<div class="form-field"><label>便签标题</label><input name="title" required placeholder="要记住什么"></div>
    <div class="form-field"><label>内容</label><textarea name="body" placeholder="补充说明"></textarea></div>
    <div class="form-field"><label>日期（可选）</label><input name="date" type="date"></div>`;

  const openModal = (mode = 'chooser', options = {}) => {
    let modal = $('#appModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'appModal';
      modal.className = 'modal-backdrop';
      modal.hidden = true;
      document.body.appendChild(modal);
    }
    const show = html => {
      modal.innerHTML = `<div class="modal-card"><button class="modal-close" data-close aria-label="关闭">×</button>${html}</div>`;
      modal.hidden = false;
      $$('[data-close]', modal).forEach(b => b.addEventListener('click', closeModal));
    };
    const closeModal = () => { modal.hidden = true; modal.innerHTML = ''; };
    if (mode === 'chooser') {
      show(`<p class="modal-kicker">NEW ENTRY / ADD TO YOUR ROOM</p><h2 class="modal-title">今天想留下什么？</h2><p class="modal-sub">不需要完整，也不需要正确。先记下来，剩下的以后再说。</p>
        <div class="modal-choices"><button class="modal-choice" data-action="thought"><b>想说的话</b><span>写下标题和正文</span></button><button class="modal-choice" data-action="project"><b>新建项目</b><span>建立一个长期目标</span></button><button class="modal-choice" data-action="progress"><b>项目进展</b><span>给已有项目追加一条</span></button><button class="modal-choice wide" data-action="note"><b>新增便签</b><span>日期可以以后再定</span></button></div>`);
      $$('[data-action]', modal).forEach(b => b.addEventListener('click', () => openModal(b.dataset.action)));
      return;
    }
    if (mode === 'mood') show(formShell('MOOD / DAILY CHECK-IN', '今天像哪只猫？', moodFields(options.date || todayKey)));
    if (mode === 'thought') show(formShell('WORDS / NEW NOTE', '想说的话', thoughtFields()));
    if (mode === 'project') show(formShell('PROJECT / NEW THREAD', '新建项目', projectFields()));
    if (mode === 'progress') show(formShell('PROGRESS / SMALL STEP', '追加一条项目进展', progressFields()));
    if (mode === 'note') show(formShell('NOTE / FUTURE REMINDER', '新增便签', noteFields()));
    const form = $('#recordForm', modal);
    if (!form) return;
    form.addEventListener('submit', e => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      try {
        if (mode === 'mood') {
          state.moods = state.moods.filter(m => m.date !== data.date);
          state.moods.push({ date: data.date, mood: data.mood, note: (data.note || '').trim() });
        } else if (mode === 'thought') {
          state.thoughts.push({ id: uid(), date: todayKey, title: data.title.trim(), body: data.body.trim() });
        } else if (mode === 'project') {
          const tone = TONES[state.projects.length % TONES.length];
          const status = data.status || '进行中';
          state.projects.push({ id: uid(), name: data.name.trim(), deadline: data.deadline || '', status, completedAt: status === '已完成' ? todayKey : '', description: (data.description || '').trim(), tone, progress: status === '已完成' ? 100 : 0 });
        } else if (mode === 'progress') {
          const progressValue = Number(data.progress);
          state.progress.push({ id: uid(), projectId: data.projectId, date: todayKey, text: data.text.trim(), link: (data.link || '').trim(), progress: Number.isFinite(progressValue) ? progressValue : 0 });
          const p = state.projects.find(x => x.id === data.projectId);
          if (p && Number.isFinite(progressValue)) p.progress = Math.max(0, Math.min(100, progressValue));
        } else if (mode === 'note') {
          state.notes.push({ id: uid(), title: data.title.trim(), body: (data.body || '').trim(), date: data.date || '' });
        }
        saveAll();
        closeModal();
        renderAll();
      } catch (err) {
        const box = $('#formError', modal);
        if (box) box.textContent = '保存失败，请检查输入后再试。';
        console.error(err);
      }
    });
  };

  const addButton = $('#addBtn');
  if (addButton) {
    const clean = addButton.cloneNode(true);
    addButton.replaceWith(clean);
    clean.addEventListener('click', () => openModal('chooser'));
  }
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { const m = $('#appModal'); if (m) { m.hidden = true; m.innerHTML = ''; } } });
  document.addEventListener('click', e => { const m = $('#appModal'); if (m && e.target === m) { m.hidden = true; m.innerHTML = ''; } });
  renderAll();
})();
