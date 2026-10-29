(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const STORE = { thoughts: 'thalia_thoughts_v1', projects: 'thalia_projects_v1', progress: 'thalia_progress_v1', notes: 'thalia_notes_v1' };
  const pad = n => String(n).padStart(2, '0');
  const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const today = new Date();
  const todayKey = iso(today);
  const addDays = (base, n) => { const d = new Date(base.getFullYear(), base.getMonth(), base.getDate()); d.setDate(d.getDate() + n); return d; };
  const dateLabel = key => { if (!key) return '日期未定'; const d = new Date(key + 'T00:00:00'); return Number.isNaN(d.getTime()) ? key : `${pad(d.getMonth() + 1)}.${pad(d.getDate())}`; };
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
  const write = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { console.warn(e); } };
  const uid = () => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()));
  let thoughts = read(STORE.thoughts, []);
  let projects = read(STORE.projects, []);
  let progress = read(STORE.progress, []);
  let notes = read(STORE.notes, []);
  const seed = () => {
    if (!thoughts.length) {
      thoughts = [
        { id:'t1', date:todayKey, title:'关于“把生活整理成自己的房间”', body:'也许我想要的不是一个更漂亮的日记本，而是一个能回头看的地方。' },
        { id:'t2', date:iso(addDays(today,-2)), title:'今天不想做正确的人', body:'只想先把那口气留在纸上，不急着变成一个情绪稳定的大人。' },
        { id:'t3', date:iso(addDays(today,-5)), title:'给未来的自己', body:'如果有一天你忘了现在的自己有多用力，就回来看看这一页。' }
      ];
      write(STORE.thoughts, thoughts);
    }
    if (!projects.length) {
      projects = [
        {id:'p-vision',name:'智能车视觉',status:'进行中',deadline:'2026-11-25',description:'完成反光保护回归测试。明天把近处 error 和 valid 再对齐一次。',tone:'gold',progress:68},
        {id:'p-project',name:'大创立项',status:'进行中',deadline:'2026-12-18',description:'整理立项书框架，把等离子体表面改性拆成三个可验证的问题。',tone:'rose',progress:36},
        {id:'p-contest',name:'比赛',status:'计划中',deadline:'2026-11-25',description:'确认报名、材料和比赛当天清单，把能提前完成的事先收掉。',tone:'copper',progress:42},
        {id:'p-ielts',name:'雅思',status:'进行中',deadline:'',description:'保持听力和口语手感，整理素材；不设每天必须完成的硬任务。',tone:'taupe',progress:58}
      ];
      write(STORE.projects, projects);
    }
    if (!progress.length) {
      progress = [
        {id:'g1',projectId:'p-vision',date:todayKey,text:'完成反光保护回归测试。明天把近处 error 和 valid 再对齐一次。',link:'',progress:68,noteId:'t1'},
        {id:'g2',projectId:'p-project',date:iso(addDays(today,-1)),text:'整理立项书框架，把等离子体表面改性拆成三个可验证的问题。',link:'',progress:36,noteId:''},
        {id:'g3',projectId:'p-contest',date:todayKey,text:'确认报名、材料和比赛当天清单，把能提前完成的事先收掉。',link:'',progress:42,noteId:''},
        {id:'g4',projectId:'p-ielts',date:iso(addDays(today,-1)),text:'保持听力和口语手感，整理素材；不设每天必须完成的硬任务。',link:'',progress:58,noteId:''}
      ];
      write(STORE.progress, progress);
    }
    if (!notes.length) {
      notes = [
        {id:'n1',title:'大物期中考试',body:'',date:iso(addDays(today,14))},
        {id:'n2',title:'等离子体大赛',body:'',date:'2027-03-15'},
        {id:'n3',title:'给房间换一盏灯',body:'',date:''},
        {id:'n4',title:'读完《一间自己的房间》',body:'',date:''}
      ];
      write(STORE.notes, notes);
    }
  };
  seed();
  const ensureModal = () => {
    let modal = $('#appModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'appModal';
      modal.className = 'modal-backdrop';
      modal.hidden = true;
      document.body.appendChild(modal);
    }
    return modal;
  };

  const closeModal = () => {
    const modal = $('#appModal');
    if (modal) { modal.hidden = true; modal.innerHTML = ''; }
  };

  const showModal = html => {
    const modal = ensureModal();
    modal.innerHTML = `<div class="modal-card"><button class="modal-close" data-close type="button" aria-label="关闭">×</button>${html}</div>`;
    modal.hidden = false;
    $$('[data-close]', modal).forEach(button => button.addEventListener('click', closeModal));
  };

  const openThoughtEditor = (thought, rerender) => {
    showModal(`<p class="modal-kicker">WORDS / EDIT NOTE</p><h2 class="modal-title">编辑手记</h2>
      <form class="modal-form" id="thoughtEditForm">
        <div class="form-field"><label>日期</label><input name="date" type="date" value="${esc(thought.date || todayKey)}" required></div>
        <div class="form-field"><label>标题</label><input name="title" required value="${esc(thought.title)}"></div>
        <div class="form-field"><label>正文</label><textarea name="body" required>${esc(thought.body)}</textarea></div>
        <div class="form-error" id="formError"></div>
        <div class="modal-actions"><button type="button" class="btn" data-close>取消</button><button class="btn primary" type="submit">保存修改</button></div>
      </form>`);
    $('#thoughtEditForm').addEventListener('submit', event => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(event.target).entries());
      thought.date = data.date || thought.date;
      thought.title = data.title.trim();
      thought.body = data.body.trim();
      write(STORE.thoughts, thoughts);
      closeModal();
      rerender();
    });
  };

  const openNotesPage = () => {
    const search = $('#noteSearch'), dateInput = $('#noteDate'), list = $('#notesList'), total = $('#noteTotal'), meta = $('#searchMeta');
    if (!list) return;
    let wanted = new URLSearchParams(location.search).get('note');
    const render = () => {
      const q = (search.value || '').trim().toLowerCase();
      const d = dateInput.value;
      const result = [...thoughts].filter(t => {
        const hay = `${t.title} ${t.body} ${t.date}`.toLowerCase();
        return (!q || hay.includes(q)) && (!d || t.date === d);
      }).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      total.textContent = thoughts.length;
      meta.textContent = `${result.length} 篇手记 · ${q || d ? '筛选结果' : '最新在前'}`;
      list.innerHTML = result.length ? result.map(t => `<article class="note-entry ${t.id === wanted ? 'open' : ''}" data-note-id="${esc(t.id)}">
        <div class="note-entry-top"><time>${dateLabel(t.date)}</time><div><h2>${esc(t.title)}</h2><p class="excerpt">${esc(t.body)}</p><div class="full-body"><div>${esc(t.body)}</div><div class="note-actions"><button type="button" data-edit-thought="${esc(t.id)}">编辑</button><button type="button" data-delete-thought="${esc(t.id)}">删除</button></div></div></div><span class="expand-mark">${t.id === wanted ? '−' : '＋'}</span></div>
      </article>`).join('') : '<div class="empty-state">没有找到匹配的手记。换一个词，或者清除日期筛选。</div>';

      $$('.note-entry', list).forEach(item => item.addEventListener('click', event => {
        if (event.target.closest('a, button, input, textarea, select, label, .note-actions')) return;
        item.classList.toggle('open');
        const mark = $('.expand-mark', item);
        if (mark) mark.textContent = item.classList.contains('open') ? '−' : '＋';
      }));

      $$('[data-edit-thought]', list).forEach(button => button.addEventListener('click', () => {
        const thought = thoughts.find(item => item.id === button.dataset.editThought);
        if (thought) openThoughtEditor(thought, render);
      }));

      $$('[data-delete-thought]', list).forEach(button => button.addEventListener('click', () => {
        const thought = thoughts.find(item => item.id === button.dataset.deleteThought);
        if (!thought) return;
        const linked = progress.filter(item => item.noteId === thought.id).length;
        const message = linked
          ? `删除「${thought.title}」？它关联的 ${linked} 条项目进展会保留，但关联会被解除。`
          : `删除「${thought.title}」？删除后不能恢复。`;
        if (!confirm(message)) return;
        thoughts = thoughts.filter(item => item.id !== thought.id);
        progress = progress.map(item => item.noteId === thought.id ? { ...item, noteId: '' } : item);
        if (wanted === thought.id) wanted = '';
        write(STORE.thoughts, thoughts);
        write(STORE.progress, progress);
        render();
      }));
    };
    search.addEventListener('input', render);
    dateInput.addEventListener('change', render);
    $('#clearSearch').addEventListener('click', () => { search.value = ''; dateInput.value = ''; render(); });
    render();
  };

  const openProgressModal = (project, existing, rerender) => {
    const isEdit = Boolean(existing);
    const noteOptions = notes.map(note => `<option value="${esc(note.title + ' · ' + dateLabel(note.date))}"></option>`).join('');
    const currentNote = existing?.noteId ? notes.find(note => note.id === existing.noteId) : null;
    const noteLabel = currentNote ? `${currentNote.title} · ${dateLabel(currentNote.date)}` : '';
    showModal(`<p class="modal-kicker">PROGRESS / SMALL STEP</p><h2 class="modal-title">${isEdit ? '编辑进展' : `给「${esc(project.name)}」追加进展`}</h2>
      <form class="modal-form" id="progressForm">
        <div class="form-field"><label>日期</label><input name="date" type="date" value="${esc(existing?.date || todayKey)}" required></div>
        <div class="form-field"><label>推进了什么</label><textarea name="text" required placeholder="写下一小步，不必写得完整">${esc(existing?.text || '')}</textarea></div>
        <div class="form-field"><label>外部链接（可选）</label><input name="link" type="url" value="${esc(existing?.link || '')}" placeholder="https://"></div>
        <div class="form-field"><label>关联手记（可选，可搜索）</label><input name="noteLabel" list="noteOptions" value="${esc(noteLabel)}" placeholder="输入标题搜索手记"><datalist id="noteOptions">${noteOptions}</datalist></div>
        <div class="form-field"><label>进度 %（可选）</label><input name="progress" type="number" min="0" max="100" value="${Number(existing?.progress ?? project.progress ?? 0)}"></div>
        <div class="form-error" id="formError"></div>
        <div class="modal-actions"><button type="button" class="btn" data-close>取消</button><button class="btn primary" type="submit">${isEdit ? '保存修改' : '保存进展'}</button></div>
      </form>`);
    $('#progressForm').addEventListener('submit', event => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(event.target).entries());
      const note = notes.find(item => `${item.title} · ${dateLabel(item.date)}` === (data.noteLabel || '').trim());
      const value = Number(data.progress);
      const payload = {
        date: data.date || todayKey,
        text: data.text.trim(),
        link: (data.link || '').trim(),
        progress: Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0,
        noteId: note?.id || ''
      };
      if (existing) Object.assign(existing, payload);
      else progress.push({ id: uid(), projectId: project.id, ...payload });
      project.progress = payload.progress;
      write(STORE.progress, progress);
      write(STORE.projects, projects);
      closeModal();
      rerender();
    });
  };

  const openProjectPage = () => {
    const root = $('#projectPage');
    if (!root) return;
    const projectId = new URLSearchParams(location.search).get('id');
    const project = projects.find(item => item.id === projectId);
    if (!project) {
      root.innerHTML = '<div class="project-empty">没有找到这个项目。 <a class="back-link" href="index.html">返回首页</a></div>';
      return;
    }
    const render = () => {
      const logs = progress.filter(item => item.projectId === project.id).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      root.innerHTML = `<section class="project-hero"><p class="eyebrow">02 / PROJECT THREAD</p><h1>${esc(project.name)}</h1><div class="project-sub"><span class="status">${esc(project.status || '进行中')}</span><span>${project.deadline ? '截止 ' + dateLabel(project.deadline) : '长期项目'}</span><a href="notes.html">查看全部手记 ↗</a><a href="projects.html">全部项目 ↗</a><button class="project-status-toggle ${project.status === '已完成' ? 'is-complete' : ''}" id="toggleProjectStatus" type="button">${project.status === '已完成' ? '恢复进行中' : '标记完成'}</button></div><p>${esc(project.description || '还没有项目简介。')}</p><div class="project-bar"><i style="width:${Math.max(0, Math.min(100, Number(project.progress || 0)))}%"></i></div></section><div class="project-toolbar"><h2>全部进展</h2><button id="addProgress" type="button">＋ 新增进展</button></div><div class="timeline">${logs.length ? logs.map(item => {
        const note = item.noteId ? thoughts.find(thought => thought.id === item.noteId) : null;
        return `<article class="timeline-item" data-progress-id="${esc(item.id)}"><time>${dateLabel(item.date)}</time><p>${esc(item.text)}</p><div class="timeline-links">${item.link ? `<a href="${esc(item.link)}" target="_blank" rel="noreferrer">打开外部链接 ↗</a>` : ''}${note ? `<a href="notes.html?note=${encodeURIComponent(note.id)}">关联手记：${esc(note.title)} ↗</a>` : ''}</div><div class="timeline-actions"><button type="button" data-edit-progress="${esc(item.id)}">编辑</button><button type="button" data-delete-progress="${esc(item.id)}">删除</button></div></article>`;
      }).join('') : '<div class="project-empty">还没有进展。没有进展也可以，日子不是任务清单。</div>'}</div>`;

      $('#addProgress').addEventListener('click', () => openProgressModal(project, null, render));
      $('#toggleProjectStatus').addEventListener('click', () => {
        const completed = project.status === '已完成';
        project.status = completed ? '进行中' : '已完成';
        project.completedAt = completed ? '' : todayKey;
        if (!completed) project.progress = 100;
        write(STORE.projects, projects);
        render();
      });
      $$('[data-edit-progress]', root).forEach(button => button.addEventListener('click', () => {
        const item = progress.find(entry => entry.id === button.dataset.editProgress);
        if (item) openProgressModal(project, item, render);
      }));
      $$('[data-delete-progress]', root).forEach(button => button.addEventListener('click', () => {
        const item = progress.find(entry => entry.id === button.dataset.deleteProgress);
        if (!item || !confirm('删除这条项目进展？删除后不能恢复。')) return;
        progress = progress.filter(entry => entry.id !== item.id);
        const remaining = progress.filter(entry => entry.projectId === project.id).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
        project.progress = Number(remaining[0]?.progress ?? 0);
        write(STORE.progress, progress);
        write(STORE.projects, projects);
        render();
      }));
    };
    render();
  };

  const openProjectsPage = () => {
    const root = $('#projectsArchive');
    if (!root) return;
    const completed = [...projects]
      .filter(project => project.status === '已完成')
      .sort((a, b) => (b.completedAt || b.deadline || '').localeCompare(a.completedAt || a.deadline || ''));
    const active = projects.filter(project => project.status !== '已完成');
    const latestFor = project => progress
      .filter(item => item.projectId === project.id)
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''))[0];

    const card = (project, archived = false) => {
      const latest = latestFor(project);
      return `<article class="archive-project ${archived ? 'is-archived' : `tone-${esc(project.tone || 'gold')}`}" data-project-id="${esc(project.id)}">
        <div class="archive-project-top"><span>${archived ? 'ARCHIVED' : esc(project.status || '进行中')}</span><time>${archived ? '完成于 ' + dateLabel(project.completedAt || project.deadline) : project.deadline ? '截止 ' + dateLabel(project.deadline) : '长期'}</time></div>
        <h3>${esc(project.name)}</h3>
        <p>${esc(latest?.text || project.description || '还没有项目简介。')}</p>
        <div class="archive-project-foot"><span>${project.progress || 0}%</span><span>${latest ? '最近更新 ' + dateLabel(latest.date) : '暂无进展'}</span><b>打开档案 ↗</b></div>
      </article>`;
    };

    root.innerHTML = `<section class="archive-hero"><div><h1>全部项目</h1><p>正在发生的继续往前，已经完成的留在这里。它们都算数。</p></div><div class="archive-count"><strong>${projects.length}</strong><span>PROJECTS KEPT</span></div></section>
      <section class="archive-section"><div class="archive-heading"><h2>已完成</h2><span>${completed.length ? completed.length + ' 项封存' : 'ARCHIVE EMPTY'}</span></div><div class="archive-grid">${completed.length ? completed.map(project => card(project, true)).join('') : '<div class="archive-empty">还没有完成的项目。等在项目详情里点“标记完成”，它会出现在这里。</div>'}</div></section>
      <section class="archive-section"><div class="archive-heading"><h2>进行中与计划中</h2><span>${active.length} 项</span></div><div class="archive-grid">${active.length ? active.map(project => card(project)).join('') : '<div class="archive-empty">目前没有进行中的项目。</div>'}</div></section>`;

    $$('.archive-project', root).forEach(item => item.addEventListener('click', () => {
      window.location.href = 'project.html?id=' + encodeURIComponent(item.dataset.projectId);
    }));
  };

  if (document.body.querySelector('#notesList')) openNotesPage();
  if (document.body.querySelector('#projectPage')) openProjectPage();
  if (document.body.querySelector('#projectsArchive')) openProjectsPage();
})();
