import { useEffect, useMemo, useState } from 'react';
import { api, clearToken, getToken, setToken } from '../api';
import Board from '../components/Board';
import ScaledStage from '../components/ScaledStage';
import '../styles/display.css';
import '../styles/admin.css';

const emptyFuel = () => ({
  id: `fuel-${Date.now()}`,
  name: 'Новое',
  price: '0',
  unit: 'руб',
  icon: 'pump',
});

function stepPrice(price, delta) {
  const n = Number(String(price).replace(',', '.'));
  if (Number.isNaN(n)) return price;
  const next = Math.max(0, Math.round((n + delta) * 100) / 100);
  return String(next).replace('.', ',');
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(Boolean(getToken()));
  const [password, setPassword] = useState('');
  const [layouts, setLayouts] = useState([]);
  const [saved, setSaved] = useState(null);
  const [form, setForm] = useState(null);
  const [toast, setToast] = useState(null);
  const [busy, setBusy] = useState(false);
  const [editList, setEditList] = useState(false);

  const dirty = useMemo(
    () => form && saved && JSON.stringify({ ...form, updatedAt: 0 }) !== JSON.stringify({ ...saved, updatedAt: 0 }),
    [form, saved],
  );

  function notify(text, kind = 'ok') {
    setToast({ text, kind, id: Date.now() });
  }

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  function logout() {
    clearToken();
    setAuthed(false);
    setForm(null);
  }

  function apply(config) {
    setSaved(config);
    setForm(config);
  }

  async function guarded(fn, okText) {
    setBusy(true);
    try {
      await fn();
      if (okText) notify(okText);
    } catch (err) {
      if (/unauthor|invalid token|401/i.test(err.message)) {
        logout();
        notify('Сессия истекла, войдите снова', 'error');
      } else {
        notify(err.message, 'error');
      }
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!authed) return;
    guarded(async () => {
      const [config, layoutRes] = await Promise.all([api.getConfig(), api.getLayouts()]);
      apply(config);
      setLayouts(layoutRes.layouts || []);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed]);

  useEffect(() => {
    if (!dirty) return undefined;
    const handler = (e) => e.preventDefault();
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  async function handleLogin(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const { token } = await api.login(password);
      setToken(token);
      setPassword('');
      setAuthed(true);
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  const save = () => guarded(async () => apply(await api.saveConfig(form)), 'Сохранено — экран обновится за 5 сек');

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    await guarded(async () => {
      const res = await api.uploadBackground(file);
      setSaved(res);
      setForm((prev) => ({ ...prev, backgroundUrl: res.backgroundUrl }));
    }, 'Фон загружен и применён');
  }

  function reset() {
    if (!confirm('Сбросить цены и оформление к значениям по умолчанию?')) return;
    guarded(async () => apply(await api.resetConfig()), 'Сброшено');
  }

  function updateFuel(index, patch) {
    setForm((prev) => ({
      ...prev,
      fuels: prev.fuels.map((f, i) => (i === index ? { ...f, ...patch } : f)),
    }));
  }

  function moveFuel(index, dir) {
    setForm((prev) => {
      const fuels = [...prev.fuels];
      const j = index + dir;
      if (j < 0 || j >= fuels.length) return prev;
      [fuels[index], fuels[j]] = [fuels[j], fuels[index]];
      return { ...prev, fuels };
    });
  }

  if (!authed) {
    return (
      <div className="adm adm--login">
        <form className="login-card" onSubmit={handleLogin}>
          <div className="login-card__mark">М</div>
          <h1>МУСТАНГ</h1>
          <p className="muted">Управление табло цен</p>
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            required
          />
          <button type="submit" className="btn btn--primary btn--lg" disabled={busy}>
            {busy ? 'Вход…' : 'Войти'}
          </button>
          <a className="link" href="/display" target="_blank" rel="noreferrer">
            Открыть экран ТВ ↗
          </a>
        </form>
        <Toast toast={toast} />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="adm adm--login">
        <div className="spinner" />
        <Toast toast={toast} />
      </div>
    );
  }

  return (
    <div className="adm">
      <header className="adm-bar">
        <div className="adm-bar__title">
          <strong>МУСТАНГ</strong>
          <span className="muted">
            {dirty
              ? 'Есть несохранённые изменения'
              : `Сохранено ${saved?.updatedAt ? new Date(saved.updatedAt).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''}`}
          </span>
        </div>
        <div className="adm-bar__actions">
          <a className="btn btn--ghost" href="/display" target="_blank" rel="noreferrer">
            Экран ↗
          </a>
          <button type="button" className="btn btn--ghost" onClick={logout}>
            Выйти
          </button>
        </div>
      </header>

      <main className="adm-layout">
        <section className="panel panel--preview">
          <div className="panel__head">
            <h2>Превью экрана</h2>
            {dirty ? <span className="badge badge--warn">не сохранено</span> : <span className="badge">на экране</span>}
          </div>
          <div className="preview">
            <ScaledStage>
              <Board config={form} />
            </ScaledStage>
          </div>
        </section>

        <section className="panel">
          <div className="panel__head">
            <h2>Цены</h2>
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => setEditList((v) => !v)}>
              {editList ? 'Готово' : 'Изменить список'}
            </button>
          </div>

          <div className="prices">
            {form.fuels.map((fuel, index) => (
              <div className="price-row" key={fuel.id}>
                {editList ? (
                  <div className="price-row__edit">
                    <input
                      value={fuel.name}
                      onChange={(e) => updateFuel(index, { name: e.target.value })}
                      aria-label="Название"
                    />
                    <select
                      value={fuel.icon}
                      onChange={(e) => updateFuel(index, { icon: e.target.value })}
                      aria-label="Иконка"
                    >
                      <option value="pump">⛽ Колонка</option>
                      <option value="flame">🔥 Газ</option>
                    </select>
                    <input
                      className="unit"
                      value={fuel.unit}
                      onChange={(e) => updateFuel(index, { unit: e.target.value })}
                      aria-label="Единица"
                    />
                    <div className="price-row__order">
                      <button type="button" className="icon-btn" onClick={() => moveFuel(index, -1)} aria-label="Выше">↑</button>
                      <button type="button" className="icon-btn" onClick={() => moveFuel(index, 1)} aria-label="Ниже">↓</button>
                      <button
                        type="button"
                        className="icon-btn icon-btn--danger"
                        onClick={() =>
                          setForm((prev) => ({ ...prev, fuels: prev.fuels.filter((_, i) => i !== index) }))
                        }
                        aria-label="Удалить"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <span className="price-row__name">{fuel.name}</span>
                    <div className="stepper">
                      <button type="button" onClick={() => updateFuel(index, { price: stepPrice(fuel.price, -1) })} aria-label="Минус 1">
                        −
                      </button>
                      <input
                        inputMode="decimal"
                        value={fuel.price}
                        onChange={(e) => updateFuel(index, { price: e.target.value.replace(/[^\d.,]/g, '') })}
                        onFocus={(e) => e.target.select()}
                        aria-label={`Цена ${fuel.name}`}
                      />
                      <button type="button" onClick={() => updateFuel(index, { price: stepPrice(fuel.price, 1) })} aria-label="Плюс 1">
                        +
                      </button>
                    </div>
                    <span className="price-row__unit">{fuel.unit}</span>
                  </>
                )}
              </div>
            ))}
          </div>
          {editList ? (
            <button
              type="button"
              className="btn btn--ghost btn--block"
              onClick={() => setForm((prev) => ({ ...prev, fuels: [...prev.fuels, emptyFuel()] }))}
            >
              + Добавить вид топлива
            </button>
          ) : null}
        </section>

        <section className="panel">
          <div className="panel__head">
            <h2>Оформление</h2>
          </div>

          <div className="field-label">Раскладка</div>
          <div className="layouts">
            {layouts.map((l) => (
              <button
                type="button"
                key={l.id}
                className={`layout-card ${form.layout === l.id ? 'is-active' : ''}`}
                onClick={() => setForm({ ...form, layout: l.id })}
              >
                <LayoutThumb id={l.id} />
                <strong>{l.name}</strong>
              </button>
            ))}
          </div>

          <div className="field-label">Фон</div>
          <div className="bg-picker">
            <div
              className={`bg-picker__thumb ${form.backgroundUrl ? '' : 'is-default'}`}
              style={form.backgroundUrl ? { backgroundImage: `url(${form.backgroundUrl})` } : undefined}
            >
              {form.backgroundUrl ? null : <span>Встроенный</span>}
            </div>
            <div className="bg-picker__actions">
              <label className="btn btn--ghost">
                Загрузить картинку
                <input type="file" accept="image/*" hidden onChange={handleUpload} />
              </label>
              {form.backgroundUrl ? (
                <button type="button" className="btn btn--ghost" onClick={() => setForm({ ...form, backgroundUrl: '' })}>
                  Встроенный фон
                </button>
              ) : null}
              <small className="muted">Лучше 1920×1080, JPG до 12 МБ</small>
            </div>
          </div>

          <details className="more">
            <summary>Тексты</summary>
            <label className="field">
              <span>Заголовок</span>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </label>
            <label className="field">
              <span>Бренд</span>
              <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
            </label>
            <button type="button" className="btn btn--danger-ghost" onClick={reset} disabled={busy}>
              Сбросить всё по умолчанию
            </button>
          </details>
        </section>
      </main>

      <footer className={`savebar ${dirty ? 'is-visible' : ''}`}>
        <button type="button" className="btn btn--ghost" onClick={() => setForm(saved)} disabled={busy}>
          Отменить
        </button>
        <button type="button" className="btn btn--primary btn--lg" onClick={save} disabled={busy}>
          {busy ? 'Сохранение…' : 'Сохранить на экран'}
        </button>
      </footer>

      <Toast toast={toast} />
    </div>
  );
}

function LayoutThumb({ id }) {
  if (id === 'list-logo-left') {
    return (
      <span className="thumb thumb--list">
        <i className="thumb__logo" />
        <span className="thumb__rows">
          {Array.from({ length: 6 }).map((_, i) => (
            <i key={i} />
          ))}
        </span>
      </span>
    );
  }
  return (
    <span className="thumb thumb--grid">
      <i className="thumb__head" />
      <span className="thumb__cells">
        {Array.from({ length: 6 }).map((_, i) => (
          <i key={i} />
        ))}
      </span>
    </span>
  );
}

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div key={toast.id} className={`toast toast--${toast.kind}`} role="status">
      {toast.text}
    </div>
  );
}
