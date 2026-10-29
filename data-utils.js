(() => {
  const STORE = {
    moods: 'thalia_moods_v1',
    thoughts: 'thalia_thoughts_v1',
    projects: 'thalia_projects_v1',
    progress: 'thalia_progress_v1',
    notes: 'thalia_notes_v1'
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

  const mount = () => {
    document.querySelectorAll('[data-export-data]').forEach(button => {
      if (button.dataset.exportReady === '1') return;
      button.dataset.exportReady = '1';
      button.addEventListener('click', exportAll);
    });
  };

  window.ThaliaData = { exportAll, mount };
  mount();
})();
