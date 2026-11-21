import { useEffect, useState } from 'react';
import { api, clearToken, getToken, setToken } from '../api';
import '../styles/admin.css';

const emptyFuel = () => ({
  id: `fuel-${Date.now()}`,
  name: '',
  price: '',
  unit: 'руб',
  icon: 'pump',
});

export default function AdminPage() {
  const [authed, setAuthed] = useState(Boolean(getToken()));
  const [password, setPassword] = useState('');
  const [layouts, setLayouts] = useState([]);
  const [form, setForm] = useState(null);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!authed) return;
    let alive = true;
    (async () => {
      try {
        const [config, layoutRes] = await Promise.all([api.getConfig(), api.getLayouts()]);
        if (!alive) return;
        setForm(config);
        setLayouts(layoutRes.layouts || []);
      } catch (e) {
        setStatus(e.message);
        if (String(e.message).includes('401') || e.message === 'Unauthorized') {
          clearToken();
          setAuthed(false);
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, [authed]);

  async function handleLogin(e) {
    e.preventDefault();
    setBusy(true);
    setStatus('');
    try {
      const { token } = await api.login(password);
      setToken(token);
      setAuthed(true);
      setPassword('');
    } catch (err) {
      setStatus(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form) return;
    setBusy(true);
    setStatus('');
    try {
      const saved = await api.saveConfig(form);
      setForm(saved);
      setStatus('Сохранено');
    } catch (err) {
      setStatus(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleBackgroundUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setStatus('');
    try {
      const saved = await api.uploadBackground(file);
      setForm(saved);
      setStatus('Фон сохранён на сервере');
    } catch (err) {
      setStatus(err.message);
    } finally {
      setBusy(false);
      e.target.value = '';
    }
  }

  async function handleLogoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setStatus('');
    try {
      const saved = await api.uploadLogo(file);
      setForm(saved);
      setStatus('Логотип сохранён на сервере');
    } catch (err) {
      setStatus(err.message);
    } finally {
      setBusy(false);
      e.target.value = '';
    }
  }

  async function clearMedia(field) {
    if (!form) return;
    setBusy(true);
    setStatus('');
    try {
      const saved = await api.saveConfig({ ...form, [field]: '' });
      setForm(saved);
      setStatus(field === 'logoUrl' ? 'Логотип убран' : 'Фон убран');
    } catch (err) {
      setStatus(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleReset() {
    if (!confirm('Сбросить к значениям по умолчанию?')) return;
    setBusy(true);
    try {
      const saved = await api.resetConfig();
      setForm(saved);
      setStatus('Сброшено');
    } catch (err) {
      setStatus(err.message);
    } finally {
      setBusy(false);
    }
  }

  function updateFuel(index, patch) {
    setForm((prev) => {
      const fuels = prev.fuels.map((f, i) => (i === index ? { ...f, ...patch } : f));
      return { ...prev, fuels };
    });
  }

  function addFuel() {
    setForm((prev) => ({ ...prev, fuels: [...prev.fuels, emptyFuel()] }));
  }

  function removeFuel(index) {
    setForm((prev) => ({
      ...prev,
      fuels: prev.fuels.filter((_, i) => i !== index),
    }));
  }

  if (!authed) {
    return (
      <div className="admin admin--login">
        <form className="admin-card" onSubmit={handleLogin}>
          <h1>МУСТАНГ · Админка</h1>
          <p className="admin-muted">Вход для смены цен и оформления экрана</p>
          <label>
            Пароль
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              required
            />
          </label>
          {status ? <p className="admin-status admin-status--error">{status}</p> : null}
          <button type="submit" disabled={busy}>
            Войти
          </button>
          <a className="admin-link" href="/display" target="_blank" rel="noreferrer">
            Открыть экран ТВ
          </a>
        </form>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="admin">
        <p className="admin-muted">{status || 'Загрузка…'}</p>
      </div>
    );
  }

  return (
    <div className="admin">
      <header className="admin-top">
        <div>
          <h1>Админка МУСТАНГ</h1>
          <p className="admin-muted">
            Обновлено: {form.updatedAt ? new Date(form.updatedAt).toLocaleString('ru-RU') : '—'}
          </p>
        </div>
        <div className="admin-top__actions">
          <a className="admin-link" href="/display" target="_blank" rel="noreferrer">
            Экран ТВ
          </a>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => {
              clearToken();
              setAuthed(false);
            }}
          >
            Выйти
          </button>
        </div>
      </header>

      <form className="admin-grid" onSubmit={handleSave}>
        <section className="admin-card">
          <h2>Экран</h2>
          <label>
            Заголовок
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </label>
          <label>
            Бренд (если нет фото логотипа)
            <input
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
            />
          </label>
          <label>
            Логотип (фото)
            <input type="file" accept="image/*" onChange={handleLogoUpload} disabled={busy} />
          </label>
          {form.logoUrl ? (
            <div className="media-preview media-preview--logo">
              <img src={form.logoUrl} alt="Логотип" />
              <button
                type="button"
                className="btn-ghost"
                onClick={() => clearMedia('logoUrl')}
                disabled={busy}
              >
                Убрать логотип
              </button>
            </div>
          ) : (
            <p className="admin-muted">Без фото — текстовый логотип из поля «Бренд»</p>
          )}
          <fieldset>
            <legend>Раскладка</legend>
            <div className="layout-options">
              {layouts.map((layout) => (
                <label key={layout.id} className="layout-option">
                  <input
                    type="radio"
                    name="layout"
                    checked={form.layout === layout.id}
                    onChange={() => setForm({ ...form, layout: layout.id })}
                  />
                  <span>
                    <strong>{layout.name}</strong>
                    <small>{layout.description}</small>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <label>
            Фон (картинка)
            <input type="file" accept="image/*" onChange={handleBackgroundUpload} disabled={busy} />
          </label>
          {form.backgroundUrl ? (
            <div className="media-preview">
              <img src={form.backgroundUrl} alt="Фон" />
              <button
                type="button"
                className="btn-ghost"
                onClick={() => clearMedia('backgroundUrl')}
                disabled={busy}
              >
                Убрать фон
              </button>
            </div>
          ) : (
            <p className="admin-muted">Без загруженного фона — встроенный тёмный градиент</p>
          )}
        </section>

        <section className="admin-card">
          <div className="admin-card__head">
            <h2>Топливо и цены</h2>
            <button type="button" className="btn-ghost" onClick={addFuel}>
              + Добавить
            </button>
          </div>
          <div className="fuel-editor">
            {form.fuels.map((fuel, index) => (
              <div className="fuel-row" key={fuel.id}>
                <input
                  placeholder="Название"
                  value={fuel.name}
                  onChange={(e) => updateFuel(index, { name: e.target.value })}
                />
                <input
                  placeholder="Цена"
                  value={fuel.price}
                  onChange={(e) => updateFuel(index, { price: e.target.value })}
                />
                <input
                  placeholder="Ед."
                  value={fuel.unit}
                  onChange={(e) => updateFuel(index, { unit: e.target.value })}
                />
                <select
                  value={fuel.icon}
                  onChange={(e) => updateFuel(index, { icon: e.target.value })}
                >
                  <option value="pump">Колонка</option>
                  <option value="flame">Газ</option>
                </select>
                <button type="button" className="btn-danger" onClick={() => removeFuel(index)}>
                  ×
                </button>
              </div>
            ))}
          </div>
        </section>

        <div className="admin-actions">
          {status ? <p className="admin-status">{status}</p> : <span />}
          <div className="admin-actions__btns">
            <button type="button" className="btn-ghost" onClick={handleReset} disabled={busy}>
              Сброс
            </button>
            <button type="submit" disabled={busy}>
              {busy ? 'Сохранение…' : 'Сохранить'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
