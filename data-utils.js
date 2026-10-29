(() => {
  const STORE = {
    moods: 'thalia_moods_v1',
    thoughts: 'thalia_thoughts_v1',
    projects: 'thalia_projects_v1',
    progress: 'thalia_progress_v1',
    notes: 'thalia_notes_v1'
  };
  const LABELS = {
    moods: '心情',
    thoughts: '手记',
    projects: '项目',
    progress: '项目进展',
    notes: '便签'
  };

  const read = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  };

  const exportAll = () => {
    const stamp = new Date();
    const pad = value => String(value).padStart(2, '0');
    const dateKey = `${stamp.getFullYear()}-${pad(stamp.getMonth() + 1)}-${pad(stamp.getDate())}`;
    const payload = {
      app: 'thalia-private-space',
      schemaVersion: 1,
      exportedAt: stamp.toISOString(),
      data: Object.fromEntries(Object.entries(STORE).map(([name, key]) => [name, read(key, [])]))
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `thalia-private-space-${dateKey}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const normalizeImport = payload => {
    const data = payload?.data && typeof payload.data === 'object' ? payload.data : payload;
    if (!data || typeof data !== 'object') throw new Error('备份文件格式不正确。');
    const missing = Object.keys(STORE).filter(name => !Array.isArray(data[name]));
    if (missing.length) throw new Error(`备份缺少：${missing.map(name => LABELS[name]).join('、')}`);
    return Object.fromEntries(Object.keys(STORE).map(name => [name, data[name]]));
  };

  const importPayload = async payload => {
    const data = normalizeImport(payload);
    const counts = Object.keys(STORE)
      .filter(name => data[name].length)
      .map(name => `${LABELS[name]} ${data[name].length} 条`)
      .join(' · ');
    const message = `导入会覆盖当前浏览器里的全部数据。${counts ? `\n\n备份内容：${counts}` : '\n\n这个备份目前是空的。'}\n\n建议先点“下载全部数据”保留现有内容。确定继续吗？`;
    if (!window.confirm(message)) return false;
    Object.entries(STORE).forEach(([name, key]) => {
      localStorage.setItem(key, JSON.stringify(data[name]));
    });
    window.alert('导入完成。页面将刷新并显示备份中的数据。');
    window.location.reload();
    return true;
  };

  const importFile = async file => {
    try {
      const text = await file.text();
      const payload = JSON.parse(text);
      await importPayload(payload);
    } catch (error) {
      console.error(error);
      window.alert(`导入失败：${error.message || '无法读取这个文件。'}`);
    }
  };

  const mount = () => {
    document.querySelectorAll('[data-export-data]').forEach(button => {
      let actions = button.closest('.footer-data-actions');
      if (!actions) {
        actions = document.createElement('div');
        actions.className = 'footer-data-actions';
        button.parentNode.insertBefore(actions, button);
        actions.appendChild(button);
      }

      if (button.dataset.exportReady !== '1') {
        button.dataset.exportReady = '1';
        button.addEventListener('click', exportAll);
      }

      if (!actions.querySelector('[data-import-data]')) {
        const importButton = document.createElement('button');
        importButton.type = 'button';
        importButton.className = 'footer-import';
        importButton.dataset.importData = '';
        importButton.textContent = '导入数据';
        actions.appendChild(importButton);

        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,application/json';
        input.hidden = true;
        actions.appendChild(input);

        importButton.addEventListener('click', () => {
          input.value = '';
          input.click();
        });
        input.addEventListener('change', () => {
          const file = input.files?.[0];
          if (file) importFile(file);
        });
      }
    });
  };

  window.ThaliaData = { exportAll, importPayload, mount };
  mount();
})();