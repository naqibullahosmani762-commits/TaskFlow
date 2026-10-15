import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Clock3,
  Filter,
  LayoutGrid,
  ListTodo,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Settings2,
  Sparkles,
  Trash2,
  X,
  Flag,
  PanelLeftClose,
} from "lucide-react";

const KEY = "taskflow-tasks-v1";
const dateOffset = (days = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const seed = [
  {
    id: "seed-1",
    title: "Finish the React portfolio",
    description: "Polish the hero section and add real project links.",
    category: "Work",
    priority: "high",
    dueDate: dateOffset(),
    completed: false,
    createdAt: Date.now() - 9000000,
  },
  {
    id: "seed-2",
    title: "Practice JavaScript array methods",
    description: "Review map, filter, find and reduce with examples.",
    category: "Learning",
    priority: "medium",
    dueDate: dateOffset(1),
    completed: false,
    createdAt: Date.now() - 18000000,
  },
  {
    id: "seed-3",
    title: "Organize project files",
    description: "Remove unused files and keep components easy to find.",
    category: "Personal",
    priority: "low",
    dueDate: dateOffset(2),
    completed: true,
    createdAt: Date.now() - 86400000,
  },
  {
    id: "seed-4",
    title: "Build a responsive dashboard",
    description: "Check layouts on mobile, tablet, and desktop widths.",
    category: "Work",
    priority: "medium",
    dueDate: dateOffset(3),
    completed: false,
    createdAt: Date.now() - 5400000,
  },
  {
    id: "seed-5",
    title: "Read 10 pages",
    description: "Take a short break from the screen this evening.",
    category: "Personal",
    priority: "low",
    dueDate: "",
    completed: false,
    createdAt: Date.now() - 1800000,
  },
];
const filters = [
  { id: "all", label: "All tasks", icon: LayoutGrid },
  { id: "today", label: "Today", icon: CalendarDays },
  { id: "upcoming", label: "Upcoming", icon: Clock3 },
  { id: "completed", label: "Completed", icon: CheckCheckIcon },
];
const categories = ["Work", "Learning", "Personal"];
function CheckCheckIcon(props) {
  return <CheckCircle2 {...props} />;
}
function readTasks() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || seed;
  } catch {
    return seed;
  }
}
function priorityOrder(p) {
  return p === "high" ? 0 : p === "medium" ? 1 : 2;
}
function colorFor(c) {
  return c === "Work" ? "purple" : c === "Learning" ? "blue" : "orange";
}
function formatDate(value) {
  if (!value) return "No due date";
  if (value === dateOffset()) return "Today";
  if (value === dateOffset(1)) return "Tomorrow";
  return new Date(value + "T12:00:00").toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
export default function App() {
  const [tasks, setTasks] = useState(readTasks),
    [activeFilter, setActiveFilter] = useState("all"),
    [category, setCategory] = useState("All"),
    [search, setSearch] = useState(""),
    [modal, setModal] = useState(false),
    [editing, setEditing] = useState(null),
    [navOpen, setNavOpen] = useState(false),
    [toast, setToast] = useState("");
  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(tasks));
  }, [tasks]);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(id);
  }, [toast]);
  const counts = useMemo(
    () => ({
      all: tasks.length,
      today: tasks.filter((t) => !t.completed && t.dueDate === dateOffset())
        .length,
      upcoming: tasks.filter((t) => !t.completed && t.dueDate > dateOffset())
        .length,
      completed: tasks.filter((t) => t.completed).length,
    }),
    [tasks],
  );
  const visible = useMemo(
    () =>
      tasks
        .filter((t) =>
          activeFilter === "today"
            ? !t.completed && t.dueDate === dateOffset()
            : activeFilter === "upcoming"
              ? !t.completed && t.dueDate > dateOffset()
              : activeFilter === "completed"
                ? t.completed
                : true,
        )
        .filter((t) => category === "All" || t.category === category)
        .filter((t) =>
          (t.title + " " + t.description + " " + t.category)
            .toLowerCase()
            .includes(search.toLowerCase()),
        )
        .sort(
          (a, b) =>
            Number(a.completed) - Number(b.completed) ||
            priorityOrder(a.priority) - priorityOrder(b.priority) ||
            b.createdAt - a.createdAt,
        ),
    [tasks, activeFilter, category, search],
  );
  const completed = tasks.filter((t) => t.completed).length,
    progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
  function saveTask(data) {
    if (editing) {
      setTasks((ts) =>
        ts.map((t) => (t.id === editing.id ? { ...t, ...data } : t)),
      );
      setToast("Task updated");
    } else {
      setTasks((ts) => [
        {
          ...data,
          id: crypto.randomUUID?.() || String(Date.now()),
          completed: false,
          createdAt: Date.now(),
        },
        ...ts,
      ]);
      setToast("Task created successfully");
    }
    setModal(false);
    setEditing(null);
  }
  function openNew() {
    setEditing(null);
    setModal(true);
  }
  function toggle(id) {
    setTasks((ts) =>
      ts.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );
  }
  function changeFilter(id) {
    setActiveFilter(id);
    setNavOpen(false);
  }
  return (
    <div className="app-shell">
      <aside className={`sidebar ${navOpen ? "sidebar-open" : ""}`}>
        <div className="brand-row">
          <div className="brand-mark">
            <ListTodo size={21} />
          </div>
          <span className="brand-name">
            taskflow<span>.</span>
          </span>
          <button
            className="icon-button sidebar-close"
            aria-label="Close navigation"
            onClick={() => setNavOpen(false)}
          >
            <X size={18} />
          </button>
        </div>
        <div className="workspace-switch">
          <div className="workspace-avatar">N</div>
          <span className="workspace-copy">
            <strong>Naqibullah's space</strong>
            <small>Personal workspace</small>
          </span>
          <ChevronDown size={16} className="muted-icon" />
        </div>
        <button className="new-task-button" onClick={openNew}>
          <Plus size={18} /> New task <span className="shortcut">N</span>
        </button>
        <div className="side-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Task filters">
          {filters.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`nav-item ${activeFilter === id ? "active" : ""}`}
              onClick={() => changeFilter(id)}
            >
              <Icon size={18} />
              <span>{label}</span>
              <span className="nav-count">{counts[id]}</span>
            </button>
          ))}
        </nav>
        <div className="side-label category-label">
          MY LISTS{" "}
          <button
            className="tiny-icon"
            aria-label="Category tips"
            onClick={() =>
              setToast("Choose a category while creating or editing a task.")
            }
          >
            <Plus size={15} />
          </button>
        </div>
        <div className="category-list">
          {categories.map((c) => (
            <button
              key={c}
              className={`category-item ${category === c ? "category-active" : ""}`}
              onClick={() => setCategory(category === c ? "All" : c)}
            >
              <span className={`category-dot ${colorFor(c)}`} />
              {c}
              <span className="category-count">
                {tasks.filter((t) => t.category === c).length}
              </span>
            </button>
          ))}
        </div>
        <div className="sidebar-bottom">
          <div className="upgrade-card">
            <div className="upgrade-icon">
              <Sparkles size={17} />
            </div>
            <strong>Make space for focus</strong>
            <p>Small steps every day add up to big progress.</p>
            <div className="mini-progress">
              <span style={{ width: `${progress}%` }} />
            </div>
            <small>
              {completed} of {tasks.length} tasks completed
            </small>
          </div>
          <button
            className="nav-item utility-item"
            onClick={() =>
              setToast("Your tasks are saved in this browser automatically.")
            }
          >
            <CircleHelp size={18} />
            <span>Help & tips</span>
          </button>
          <button
            className="nav-item utility-item"
            onClick={() =>
              setToast("TaskFlow stores data locally in this browser.")
            }
          >
            <Settings2 size={18} />
            <span>Settings</span>
          </button>
          <div className="profile-row">
            <div className="profile-avatar">NO</div>
            <div className="profile-copy">
              <strong>Naqibullah Osmani</strong>
              <small>Personal workspace</small>
            </div>
            <MoreHorizontal size={19} className="muted-icon" />
          </div>
        </div>
      </aside>
      {navOpen && (
        <button
          className="mobile-backdrop"
          aria-label="Close menu"
          onClick={() => setNavOpen(false)}
        />
      )}
      <main className="main-area">
        <header className="topbar">
          <button
            className="icon-button mobile-menu"
            aria-label="Open navigation"
            onClick={() => setNavOpen(true)}
          >
            <PanelLeftClose size={19} />
          </button>
          <div className="breadcrumb">
            <span>Workspace</span>
            <span className="crumb-slash">/</span>
            <strong>{filters.find((f) => f.id === activeFilter)?.label}</strong>
          </div>
          <div className="topbar-actions">
            <div className="search-box">
              <Search size={17} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tasks..."
                aria-label="Search tasks"
              />
            </div>
            <div className="avatar-small">N</div>
          </div>
        </header>
        <div className="content-wrap">
          <section className="welcome-row">
            <div>
              <div className="date-kicker">
                <span className="live-dot" /> YOUR PERSONAL WORKSPACE
              </div>
              <h1>
                {activeFilter === "all"
                  ? "Good things take focus."
                  : filters.find((f) => f.id === activeFilter)?.label + "."}
              </h1>
              <p>
                Plan clearly, work calmly, and make progress one task at a time.
              </p>
            </div>
            <button className="primary-button" onClick={openNew}>
              <Plus size={18} /> Add new task
            </button>
          </section>
          <section className="stats-grid" aria-label="Task summary">
            <Stat
              label="Total tasks"
              value={tasks.length}
              caption="Across all your lists"
              icon={<ListTodo size={18} />}
              tone="violet"
            />
            <Stat
              label="Completed"
              value={completed}
              caption={`${progress}% of all tasks`}
              icon={<CheckCircle2 size={18} />}
              tone="green"
            />
            <Stat
              label="Due today"
              value={counts.today}
              caption={
                counts.today ? "Keep your momentum" : "Nothing due today"
              }
              icon={<CalendarDays size={18} />}
              tone="orange"
            />
            <Stat
              label="Upcoming"
              value={counts.upcoming}
              caption="Coming up next"
              icon={<Activity size={18} />}
              tone="blue"
            />
          </section>
          <section className="task-panel">
            <div className="task-panel-header">
              <div>
                <h2>
                  {activeFilter === "all"
                    ? "Your tasks"
                    : filters.find((f) => f.id === activeFilter)?.label}
                </h2>
                <p>
                  {visible.length} {visible.length === 1 ? "task" : "tasks"} to
                  keep things moving
                </p>
              </div>
              <div className="panel-actions">
                <button
                  className={`filter-button ${category !== "All" ? "filter-selected" : ""}`}
                  onClick={() =>
                    setCategory(
                      category === "All"
                        ? "Work"
                        : category === "Work"
                          ? "Learning"
                          : category === "Learning"
                            ? "Personal"
                            : "All",
                    )
                  }
                >
                  <Filter size={16} />
                  {category === "All" ? "Filter" : category}
                  <ChevronDown size={14} />
                </button>
              </div>
            </div>
            <div className="task-table-head">
              <span>TASK NAME</span>
              <span>LIST</span>
              <span>PRIORITY</span>
              <span>DUE DATE</span>
              <span />
            </div>
            {visible.length ? (
              <div className="task-list">
                {visible.map((t) => (
                  <article
                    className={`task-row ${t.completed ? "task-complete" : ""}`}
                    key={t.id}
                  >
                    <div className="task-main">
                      <button
                        className={`check-button ${t.completed ? "checked" : ""}`}
                        aria-label={
                          t.completed ? "Mark incomplete" : "Mark complete"
                        }
                        onClick={() => toggle(t.id)}
                      >
                        {t.completed && <Check size={14} />}
                      </button>
                      <div className="task-text">
                        <strong>{t.title}</strong>
                        {t.description && <small>{t.description}</small>}
                      </div>
                    </div>
                    <div className="task-category">
                      <span
                        className={`category-dot ${colorFor(t.category)}`}
                      />
                      {t.category}
                    </div>
                    <div>
                      <span className={`priority-pill priority-${t.priority}`}>
                        <Flag size={12} fill="currentColor" />
                        {t.priority[0].toUpperCase() + t.priority.slice(1)}
                      </span>
                    </div>
                    <div
                      className={`due-date ${t.dueDate === dateOffset() && !t.completed ? "due-today" : ""}`}
                    >
                      <CalendarDays size={14} />
                      {formatDate(t.dueDate)}
                    </div>
                    <div className="row-actions">
                      <button
                        className="row-action"
                        aria-label={`Edit ${t.title}`}
                        onClick={() => {
                          setEditing(t);
                          setModal(true);
                        }}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        className="row-action delete-action"
                        aria-label={`Delete ${t.title}`}
                        onClick={() => {
                          setTasks((ts) => ts.filter((x) => x.id !== t.id));
                          setToast("Task deleted");
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">
                  <Search size={24} />
                </div>
                <h3>No tasks found</h3>
                <p>Try another filter or create a new task to get started.</p>
                <button className="primary-button" onClick={openNew}>
                  <Plus size={17} /> Create a task
                </button>
              </div>
            )}
            <div className="task-panel-footer">
              <span>
                <span className="footer-dot" /> Changes save automatically on
                this device
              </span>
              <button
                onClick={() => {
                  setActiveFilter("all");
                  setCategory("All");
                  setSearch("");
                }}
              >
                Clear filters <X size={13} />
              </button>
            </div>
          </section>
          <section className="bottom-insight">
            <div className="insight-icon">
              <Sparkles size={18} />
            </div>
            <div>
              <strong>A little progress is still progress.</strong>
              <p>
                Choose the next small step, and let consistency do the rest.
              </p>
            </div>
            <div className="insight-metric">
              <strong>{progress}%</strong>
              <span>completion rate</span>
            </div>
          </section>
          <footer className="app-footer">
            <span>© 2026 TaskFlow</span>
            <span>
              Made for focused work <span className="footer-heart">♥</span>
            </span>
          </footer>
        </div>
      </main>
      {modal && (
        <TaskModal
          task={editing}
          onClose={() => {
            setModal(false);
            setEditing(null);
          }}
          onSave={saveTask}
        />
      )}
      {toast && (
        <div className="toast" role="status">
          <CheckCircle2 size={17} />
          {toast}
        </div>
      )}
    </div>
  );
}
function Stat({ label, value, caption, icon, tone }) {
  return (
    <article className="stat-card">
      <div className={`stat-icon ${tone}`}>{icon}</div>
      <div className="stat-copy">
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{caption}</small>
      </div>
    </article>
  );
}
function TaskModal({ task, onClose, onSave }) {
  const [title, setTitle] = useState(task?.title || ""),
    [description, setDescription] = useState(task?.description || ""),
    [category, setCategory] = useState(task?.category || "Work"),
    [priority, setPriority] = useState(task?.priority || "medium"),
    [dueDate, setDueDate] = useState(task?.dueDate ?? dateOffset()),
    [error, setError] = useState("");
  function submit(e) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please enter a task name.");
      return;
    }
    onSave({
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      dueDate,
    });
  }
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        className="task-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal-header">
          <div>
            <span className="modal-kicker">
              {task ? "UPDATE TASK" : "NEW TASK"}
            </span>
            <h2 id="modal-title">
              {task ? "Edit your task" : "Create a task"}
            </h2>
          </div>
          <button
            className="icon-button"
            aria-label="Close modal"
            onClick={onClose}
          >
            <X size={19} />
          </button>
        </div>
        <form onSubmit={submit}>
          <label className="form-label">
            Task name <span>*</span>
            <input
              autoFocus
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError("");
              }}
              placeholder="e.g. Finish the landing page"
              maxLength={100}
            />
          </label>
          <label className="form-label">
            Description
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a little more detail (optional)"
              rows={3}
              maxLength={280}
            />
          </label>
          <div className="form-two-col">
            <label className="form-label">
              List
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className="form-label">
              Priority
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
          </div>
          <label className="form-label">
            Due date
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <div className="modal-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-button">
              <Check size={16} />
              {task ? "Save changes" : "Create task"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
