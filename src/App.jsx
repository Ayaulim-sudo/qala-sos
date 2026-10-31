
import { useEffect, useMemo, useState } from "react";
import CityMap from "./components/CityMap";
import { supabase } from "./lib/supabase";
import "./App.css";

const categories = [
  { name: "Барлығы", icon: "◈" },
  { name: "ДТП", icon: "🚗" },
  { name: "Өрт", icon: "🔥" },
  { name: "Жарық", icon: "💡" },
  { name: "Су құбыры", icon: "💧" },
  { name: "Қоқыс", icon: "🗑️" },
  { name: "Жол мәселесі", icon: "🚧" },
];

const demoReports = [
  {
    id: "QS-1024",
    title: "Жолда үлкен шұңқыр пайда болған",
    description: "Жол жабыны зақымдалған.",
    category: "Жол мәселесі",
    icon: "🚧",
    location: "Бостандық ауданы, әл-Фараби даңғылы",
    lat: 43.215,
    lng: 76.927,
    status: "In Progress",
    color: "orange",
    source: "demo",
    imageUrl: null,
  },
  {
    id: "QS-1023",
    title: "Көшедегі жарық шамдары жанбайды",
    description: "Кешкі уақытта көшеде жарық жоқ.",
    category: "Жарық",
    icon: "💡",
    location: "Медеу ауданы, Достық көшесі",
    lat: 43.247,
    lng: 76.957,
    status: "Pending",
    color: "yellow",
    source: "demo",
    imageUrl: null,
  },
  {
    id: "QS-1022",
    title: "Қоқыс уақытында жиналмаған",
    description: "Қоқыс контейнерлері толған.",
    category: "Қоқыс",
    icon: "🗑️",
    location: "Алмалы ауданы, Абылай хан көшесі",
    lat: 43.258,
    lng: 76.939,
    status: "Completed",
    color: "green",
    source: "demo",
    imageUrl: null,
  },
];

const statusNames = {
  Pending: "Қаралуда",
  "In Progress": "Орындалуда",
  Completed: "Шешілді",
};

const databaseStatus = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
};

const statusToDatabase = {
  Pending: "pending",
  "In Progress": "in_progress",
  Completed: "completed",
};

const panelStyle = {
  background: "white",
  borderRadius: 18,
  padding: 24,
  marginBottom: 20,
  boxShadow: "0 4px 20px rgba(20,30,70,.05)",
};

const inputStyle = {
  width: "100%",
  padding: 12,
  borderRadius: 10,
  border: "1px solid #dce2ec",
  marginTop: 8,
  marginBottom: 16,
  font: "inherit",
  boxSizing: "border-box",
};

function loadSaved(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function statusLabel(status) {
  return statusNames[databaseStatus[status]] || status;
}

function convertReport(report) {
  const categoryInfo = categories.find(
    (item) => item.name === report.category
  );

  return {
    id: report.id,
    userId: report.user_id,
    title: report.title,
    description: report.description,
    category: report.category,
    icon: categoryInfo?.icon || "📍",
    location: report.address || "",
    lat: report.latitude,
    lng: report.longitude,
    status: databaseStatus[report.status] || "Pending",
    time: report.created_at
      ? new Date(report.created_at).toLocaleString("kk-KZ")
      : "",
    color:
      report.status === "completed"
        ? "green"
        : report.status === "in_progress"
        ? "orange"
        : "yellow",
    source: "supabase",
    imageUrl: report.image_url || null,
  };
}

function ReportList({
  reports,
  onSelect,
  isAdmin = false,
  onStatusChange,
  savingId,
}) {
  return (
    <div style={panelStyle}>
      <div className="section-heading">
        <div>
          <h2>
            {isAdmin
              ? "Өтініштерді басқару"
              : "Өтініштер тізімі"}
          </h2>
          <p>{reports.length} өтініш табылды</p>
        </div>
      </div>

      {reports.length === 0 && (
        <p>Бұл шарттарға сәйкес өтініш жоқ.</p>
      )}

      {reports.map((report) => (
        <div
          key={report.id}
          style={{
            padding: "16px 0",
            borderBottom: "1px solid #edf0f5",
          }}
        >
          <div className="recent-item">
            <div className={`report-icon ${report.color}`}>
              {report.icon}
            </div>

            <div className="recent-info" style={{ flex: 1 }}>
              <strong>{report.title}</strong>
              <small>⌖ {report.location}</small>

              <div className="recent-meta">
                <span className="status pending">
                  {statusNames[report.status]}
                </span>
                <span>
                  {report.source === "supabase"
                    ? "Серверде сақталған"
                    : "Демо"}
                </span>
              </div>
            </div>
          </div>

          <button
            className="text-btn"
            onClick={() => onSelect(report)}
          >
            Толығырақ →
          </button>

          {report.imageUrl && (
            <span
              style={{
                marginLeft: 12,
                color: "#247c50",
                fontSize: 13,
              }}
            >
              📷 Фото бар
            </span>
          )}

          {isAdmin && report.source === "supabase" && (
            <div style={{ marginTop: 14 }}>
              <label>
                <strong>Өтініш мәртебесі</strong>

                <select
                  style={inputStyle}
                  value={report.status}
                  disabled={savingId === report.id}
                  onChange={(event) =>
                    onStatusChange(report, event.target.value)
                  }
                >
                  <option value="Pending">Қаралуда</option>
                  <option value="In Progress">Орындалуда</option>
                  <option value="Completed">Шешілді</option>
                </select>
              </label>

              {savingId === report.id && (
                <p>Өзгеріс сақталуда...</p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function MapSection({
  reports,
  search,
  setSearch,
  onSelect,
  onLocationSelect,
  selectedLocation,
  onCreate,
  onOpenReports,
  onOpenMap,
  activeCategory,
  setActiveCategory,
}) {
  return (
    <section className="map-section">
      <div className="section-heading">
        <div>
          <h2>Қала картасы</h2>
          <p>Алматы қаласының интерактивті картасы</p>
        </div>

        <button className="text-btn" onClick={onOpenMap}>
          Толық карта ↗
        </button>
      </div>

      <div className="map-layout">
        <div className="map-placeholder">
          <div className="map-toolbar">
            <div className="map-search">
              <span>⌕</span>
              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Мәселені немесе мекенжайды іздеу"
              />
            </div>

            <button
              className="map-filter"
              onClick={() =>
                setActiveCategory(
                  activeCategory === "Барлығы"
                    ? "Жол мәселесі"
                    : "Барлығы"
                )
              }
            >
              ☷ Сүзгі
            </button>
          </div>

          <CityMap
            reports={reports}
            onLocationSelect={onLocationSelect}
          />

          {selectedLocation && (
            <div style={{ padding: 12 }}>
              Таңдалған орын:{" "}
              {selectedLocation.lat.toFixed(5)},{" "}
              {selectedLocation.lng.toFixed(5)}

              <button
                className="text-btn"
                onClick={onCreate}
              >
                Осы жерге өтініш қосу +
              </button>
            </div>
          )}

          <div className="map-legend">
            <span>
              <i className="legend-dot orange" />
              {" "}Қаралуда
            </span>
            <span>
              <i className="legend-dot green" />
              {" "}Шешілген
            </span>
          </div>
        </div>

        <div className="recent-panel">
          <div className="recent-heading">
            <h3>Соңғы өтініштер</h3>
            <span className="live-badge">ДЕРЕКТЕР</span>
          </div>

          <div className="recent-list">
            {reports.slice(0, 5).map((report) => (
              <button
                className="recent-item"
                key={report.id}
                onClick={() => onSelect(report)}
              >
                <div className={`report-icon ${report.color}`}>
                  {report.icon}
                </div>

                <div className="recent-info">
                  <strong>{report.title}</strong>
                  <small>⌖ {report.location}</small>

                  <div className="recent-meta">
                    <span className="status pending">
                      {statusNames[report.status]}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <button
            className="all-reports"
            onClick={onOpenReports}
          >
            Барлық өтініштерді көру →
          </button>
        </div>
      </div>
    </section>
  );
}

export default function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [activeCategory, setActiveCategory] =
    useState("Барлығы");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [savingReport, setSavingReport] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");

  const [profile, setProfile] = useState({
    name: "Қала тұрғыны",
    email: "",
    role: "resident",
  });
  const [profileLoading, setProfileLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  const isAdmin = profile.role === "admin";

  const [settings, setSettings] = useState(() =>
    loadSaved("qala-settings", {
      notifications: true,
      showDemo: true,
    })
  );

  const [messages, setMessages] = useState(() =>
    loadSaved("qala-messages", [])
  );

  // SUPABASE ХАБАРЛАМАЛАРЫ
  const [reportNotifications, setReportNotifications] =
    useState([]);
  const [notificationsLoading, setNotificationsLoading] =
    useState(false);
  const [notificationError, setNotificationError] =
    useState("");
  const [readNotificationIds, setReadNotificationIds] =
    useState([]);

  const [notice, setNotice] = useState("");
  const [logoutLoading, setLogoutLoading] = useState(false);

  const unreadCount = settings.notifications
    ? reportNotifications.filter(
        (item) => !readNotificationIds.includes(item.id)
      ).length
    : 0;

  useEffect(() => {
    localStorage.setItem(
      "qala-settings",
      JSON.stringify(settings)
    );
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(
      "qala-messages",
      JSON.stringify(messages)
    );
  }, [messages]);

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) throw authError;

        if (user && mounted) {
          setCurrentUserId(user.id);

          const { data: profileData, error: profileError } =
            await supabase
              .from("profiles")
              .select("full_name, role")
              .eq("id", user.id)
              .single();

          if (profileError) {
            console.error(
              "Профиль қатесі:",
              profileError.message
            );
          }

          if (mounted) {
            setProfile({
              name:
                profileData?.full_name ||
                user.user_metadata?.full_name ||
                "Қала тұрғыны",
              email: user.email || "",
              role: profileData?.role || "resident",
            });
          }
        }

        if (mounted) await loadReports();
      } catch (initialError) {
        if (mounted) setError(initialError.message);
      } finally {
        if (mounted) setProfileLoading(false);
      }
    }

    initialize();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  useEffect(() => {
    if (!currentUserId) return;

    setReportNotifications([]);
    setReadNotificationIds(
      loadSaved(`qala-read-${currentUserId}`, [])
    );
  }, [currentUserId]);

  async function loadReports() {
    setLoadingReports(true);
    setError("");

    try {
      const { data, error: fetchError } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      setReports((data || []).map(convertReport));
    } catch (fetchError) {
      setError(fetchError.message);
    } finally {
      setLoadingReports(false);
    }
  }

  // ТҰРҒЫННЫҢ ХАБАРЛАМАЛАРЫН ЖҮКТЕУ
  async function loadReportNotifications() {
    if (!currentUserId) return;

    setNotificationsLoading(true);
    setNotificationError("");

    try {
      const { data: ownReports, error: reportsError } =
        await supabase
          .from("reports")
          .select("id, title")
          .eq("user_id", currentUserId);

      if (reportsError) throw reportsError;

      const reportIds = (ownReports || []).map(
        (report) => report.id
      );

      if (reportIds.length === 0) {
        setReportNotifications([]);
        return;
      }

      const { data: updates, error: updatesError } =
        await supabase
          .from("report_updates")
          .select(
            "id, report_id, old_status, new_status, created_at"
          )
          .in("report_id", reportIds)
          .order("created_at", { ascending: false });

      if (updatesError) throw updatesError;

      const titles = new Map(
        ownReports.map((report) => [
          report.id,
          report.title,
        ])
      );

      const notifications = (updates || []).map(
        (update) => {
          const title =
            titles.get(update.report_id) || "Өтініш";

          return {
            id: update.id,
            reportId: update.report_id,
            title,
            text:
              `«${title}» өтінішінің мәртебесі ` +
              `«${statusLabel(update.new_status)}» ` +
              `болып өзгерді.`,
            date: new Date(
              update.created_at
            ).toLocaleString("kk-KZ"),
          };
        }
      );

      setReportNotifications(notifications);
    } catch (fetchError) {
      console.error(
        "Хабарламалар қатесі:",
        fetchError.message
      );
      setNotificationError(fetchError.message);
    } finally {
      setNotificationsLoading(false);
    }
  }

  useEffect(() => {
    if (!currentUserId) return;

    loadReportNotifications();

    // Әр 30 секунд сайын өзгерістерді тексеру
    const interval = setInterval(() => {
      loadReportNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [currentUserId]);

  function markNotificationsRead() {
    if (!currentUserId) return;

    const ids = reportNotifications.map(
      (item) => item.id
    );

    const updated = [
      ...new Set([...readNotificationIds, ...ids]),
    ];

    setReadNotificationIds(updated);

    localStorage.setItem(
      `qala-read-${currentUserId}`,
      JSON.stringify(updated)
    );
  }

  function openReportNotification(notification) {
    if (currentUserId) {
      const updated = [
        ...new Set([
          ...readNotificationIds,
          notification.id,
        ]),
      ];

      setReadNotificationIds(updated);

      localStorage.setItem(
        `qala-read-${currentUserId}`,
        JSON.stringify(updated)
      );
    }

    const report = reports.find(
      (item) => item.id === notification.reportId
    );

    if (report) {
      setSelectedReport(report);
    } else {
      setActivePage("Reports");
      loadReports();
    }
  }

  const allReports = useMemo(() => {
    return settings.showDemo
      ? [...reports, ...demoReports]
      : reports;
  }, [reports, settings.showDemo]);

  const visibleReports = useMemo(() => {
    return allReports.filter((report) => {
      const query = search.toLowerCase();

      const matchesSearch = [
        report.title,
        report.location,
        report.description,
        report.id,
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(query)
      );

      const matchesCategory =
        activeCategory === "Барлығы" ||
        report.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [allReports, search, activeCategory]);

  const stats = [
    {
      label: "Барлық өтініш",
      value: allReports.length,
      icon: "◈",
      color: "purple",
    },
    {
      label: "Қаралуда",
      value: allReports.filter(
        (report) => report.status === "Pending"
      ).length,
      icon: "◷",
      color: "orange",
    },
    {
      label: "Орындалуда",
      value: allReports.filter(
        (report) => report.status === "In Progress"
      ).length,
      icon: "↗",
      color: "blue",
    },
    {
      label: "Шешілген",
      value: allReports.filter(
        (report) => report.status === "Completed"
      ).length,
      icon: "✓",
      color: "green",
    },
  ];

  function notify(message) {
    setNotice(message);

    if (settings.notifications) {
      setMessages((previous) => [
        {
          id: crypto.randomUUID(),
          text: message,
          date: new Date().toLocaleString("kk-KZ"),
        },
        ...previous,
      ]);
    }
  }

  function openPage(page) {
    if (page === "Admin" && !isAdmin) {
      notify("Бұл бөлім тек әкімшіге қолжетімді.");
      return;
    }

    setActivePage(page);
    setSelectedReport(null);
    setNotice("");

    if (page === "Notifications") {
      loadReportNotifications();
    }
  }

  function handlePhotoChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setNotice(
        "Тек JPG, PNG немесе WEBP форматындағы фото таңдаңыз."
      );
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setNotice("Фото көлемі 5 МБ-тан аспауы керек.");
      event.target.value = "";
      return;
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function clearPhoto() {
    setPhotoFile(null);
    setPhotoPreview("");
  }

  function closeForm() {
    if (savingReport) return;

    setShowForm(false);
    clearPhoto();
  }

  async function handleLogout() {
    setLogoutLoading(true);

    const { error: logoutError } =
      await supabase.auth.signOut();

    if (logoutError) {
      notify(
        "Жүйеден шығу қатесі: " +
        logoutError.message
      );
    }

    setLogoutLoading(false);
  }

  async function updateReportStatus(report, newStatus) {
    if (!isAdmin) {
      notify("Әкімші құқығы қажет.");
      return;
    }

    if (report.source !== "supabase") {
      notify("Демо өтінішті өзгертуге болмайды.");
      return;
    }

    const dbStatus = statusToDatabase[newStatus];

    if (!dbStatus) {
      notify("Белгісіз мәртебе.");
      return;
    }

    if (report.status === newStatus) return;

    setSavingId(report.id);
    setError("");

    try {
      const { data, error: updateError } =
        await supabase
          .from("reports")
          .update({ status: dbStatus })
          .eq("id", report.id)
          .select()
          .single();

      if (updateError) throw updateError;

      const updatedReport = convertReport(data);

      setReports((previous) =>
        previous.map((item) =>
          item.id === report.id
            ? updatedReport
            : item
        )
      );

      setSelectedReport((previous) =>
        previous?.id === report.id
          ? updatedReport
          : previous
      );

      notify(
        `Өтініш мәртебесі өзгерді: ${statusNames[newStatus]}`
      );

      await loadReportNotifications();
    } catch (updateError) {
      setError(updateError.message);
      notify(
        "Мәртебені өзгерту қатесі: " +
        updateError.message
      );
    } finally {
      setSavingId(null);
    }
  }

  async function createReport(event) {
    event.preventDefault();

    if (savingReport) return;

    const form = new FormData(event.currentTarget);

    const title = String(
      form.get("title") || ""
    ).trim();

    const description = String(
      form.get("description") || ""
    ).trim();

    const location = String(
      form.get("location") || ""
    ).trim();

    const category = String(
      form.get("category") || ""
    );

    if (!title || !description || !location || !category) {
      setNotice("Барлық міндетті өрістерді толтырыңыз.");
      return;
    }

    setSavingReport(true);
    setError("");

    let uploadedPath = null;

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!user) {
        throw new Error("Алдымен жүйеге кіріңіз.");
      }

      let imageUrl = null;

      if (photoFile) {
        const extension =
          photoFile.type === "image/png"
            ? "png"
            : photoFile.type === "image/webp"
            ? "webp"
            : "jpg";

        uploadedPath =
          `${user.id}/${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } =
          await supabase.storage
            .from("report-images")
            .upload(uploadedPath, photoFile, {
              cacheControl: "3600",
              upsert: false,
              contentType: photoFile.type,
            });

        if (uploadError) throw uploadError;

        const { data: urlData } =
          supabase.storage
            .from("report-images")
            .getPublicUrl(uploadedPath);

        imageUrl = urlData.publicUrl;
      }

      const { data, error: insertError } =
        await supabase
          .from("reports")
          .insert({
            user_id: user.id,
            title,
            description,
            category,
            address: location,
            latitude: selectedLocation?.lat ?? null,
            longitude: selectedLocation?.lng ?? null,
            status: "pending",
            image_url: imageUrl,
          })
          .select()
          .single();

      if (insertError) throw insertError;

      setReports((previous) => [
        convertReport(data),
        ...previous,
      ]);

      setShowForm(false);
      clearPhoto();
      setSelectedLocation(null);
      setActivePage("Reports");

      notify(
        "Өтініш Supabase базасына сәтті сақталды!"
      );
    } catch (saveError) {
      if (uploadedPath) {
        try {
          await supabase.storage
            .from("report-images")
            .remove([uploadedPath]);
        } catch (removeError) {
          console.error(removeError);
        }
      }

      setError(saveError.message);
      setNotice(
        "Өтініш сақталмады: " +
        saveError.message
      );
    } finally {
      setSavingReport(false);
    }
  }

  return (
    <div className="app">
      {/* СОЛ ЖАҚ МӘЗІР */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <span>Q</span>
            <i>+</i>
          </div>

          <div className="brand-text">
            <strong>
              QALA<span>SOS</span>
            </strong>
            <small>SMART CITY PLATFORM</small>
          </div>
        </div>

        <div className="sidebar-label">
          БАСТЫ МӘЗІР
        </div>

        <nav className="navigation">
          {[
            ["Dashboard", "▦", "Dashboard"],
            ["Map", "⌖", "Қала картасы"],
            ["Reports", "▤", "Өтініштер"],
            ["Statistics", "▥", "Статистика"],
          ].map(([page, icon, title]) => (
            <button
              key={page}
              className={`nav-item ${
                activePage === page ? "active" : ""
              }`}
              onClick={() => openPage(page)}
            >
              <span className="nav-icon">
                {icon}
              </span>

              {title}

              {page === "Reports" && (
                <span className="nav-count">
                  {allReports.length}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-label second-label">
          ЖҮЙЕ
        </div>

        <nav className="navigation">
          {isAdmin && (
            <button
              className={`nav-item ${
                activePage === "Admin"
                  ? "active"
                  : ""
              }`}
              onClick={() => openPage("Admin")}
            >
              <span className="nav-icon">♙</span>
              Әкімші панелі
            </button>
          )}

          <button
            className={`nav-item ${
              activePage === "Settings"
                ? "active"
                : ""
            }`}
            onClick={() => openPage("Settings")}
          >
            <span className="nav-icon">⚙</span>
            Баптаулар
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon">✳</div>

            <strong>Көмек керек пе?</strong>

            <p>
              Сұрақтарыңызға жауап алуға болады.
            </p>

            <button
              onClick={() => openPage("Support")}
            >
              Қолдау қызметі ↗
            </button>
          </div>

          <div className="profile">
            <div className="avatar">
              {profile.name.charAt(0).toUpperCase()}
            </div>

            <div className="profile-info">
              <strong>{profile.name}</strong>
              <small>
                {isAdmin
                  ? "Әкімші"
                  : "Пайдаланушы"}
              </small>
            </div>

            <button
              className="profile-more"
              onClick={() => openPage("Profile")}
              aria-label="Профиль"
            >
              •••
            </button>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={logoutLoading}
            style={{
              width: "100%",
              padding: 12,
              marginTop: 12,
              borderRadius: 10,
              border: "1px solid #d5e3d7",
              background: "#ffffff",
              color: "#174f32",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            {logoutLoading
              ? "Шығу орындалуда..."
              : "↪ Жүйеден шығу"}
          </button>
        </div>
      </aside>

      {/* НЕГІЗГІ БӨЛІМ */}
      <main className="main">
        <header className="topbar">
          <div className="breadcrumb">
            <span>QalaSOS</span>
            <b>/</b>
            <strong>{activePage}</strong>
          </div>

          <div className="top-actions">
            <div className="city-select">
              ⌖ Алматы қаласы
            </div>

            <button
              className="notification"
              onClick={() => openPage("Notifications")}
              aria-label="Хабарламалар"
              title={`${unreadCount} жаңа хабарлама`}
              style={{ position: "relative" }}
            >
              🔔

              {unreadCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    minWidth: 17,
                    height: 17,
                    padding: "0 3px",
                    borderRadius: 20,
                    background: "#dc2626",
                    color: "white",
                    fontSize: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            <button
              className="top-avatar"
              onClick={() => openPage("Profile")}
              aria-label="Жеке кабинет"
            >
              {profile.name.charAt(0).toUpperCase()}
            </button>
          </div>
        </header>

        <div className="content">
          <div className="welcome-row">
            <div>
              <div className="eyebrow">
                <span className="live-dot" />
                ҚАЛАНЫ БІРГЕ ЖАҚСАРТАМЫЗ
              </div>

              <h1>
                Қайырлы күн, <span>Алматы!</span> 👋
              </h1>

              <p className="welcome-subtitle">
                Қаладағы жағдайды бақылаңыз және
                мәселелерді бірге шешейік.
              </p>
            </div>

            <button
              className="primary-btn"
              onClick={() => setShowForm(true)}
            >
              ＋ Мәселе хабарлау
            </button>
          </div>

          {notice && (
            <div
              style={{
                ...panelStyle,
                borderLeft: "4px solid #165dde",
              }}
            >
              {notice}

              <button
                style={{ float: "right" }}
                onClick={() => setNotice("")}
              >
                ×
              </button>
            </div>
          )}

          {error && (
            <div
              style={{
                ...panelStyle,
                color: "#b91c1c",
              }}
            >
              Қате: {error}
            </div>
          )}

          {(loadingReports || profileLoading) && (
            <div style={panelStyle}>
              Деректер жүктелуде...
            </div>
          )}

          {/* СТАТИСТИКА КАРТОЧКАЛАРЫ */}
          {["Dashboard", "Statistics"].includes(
            activePage
          ) && (
            <section className="stats-grid">
              {stats.map((stat) => (
                <div
                  className="stat-card"
                  key={stat.label}
                >
                  <div className="stat-top">
                    <div
                      className={`stat-icon ${stat.color}`}
                    >
                      {stat.icon}
                    </div>

                    <span
                      className={`stat-change ${stat.color}`}
                    >
                      Нақты сан
                    </span>
                  </div>

                  <div className="stat-value">
                    {stat.value}
                  </div>

                  <div className="stat-label">
                    {stat.label}
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* КАРТА */}
          {["Dashboard", "Map"].includes(
            activePage
          ) && (
            <MapSection
              reports={visibleReports}
              search={search}
              setSearch={setSearch}
              onSelect={setSelectedReport}
              onLocationSelect={setSelectedLocation}
              selectedLocation={selectedLocation}
              onCreate={() => setShowForm(true)}
              onOpenReports={() => openPage("Reports")}
              onOpenMap={() => openPage("Map")}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
            />
          )}

          {/* САНАТТАР */}
          {activePage === "Dashboard" && (
            <section className="bottom-section">
              <div className="section-heading">
                <div>
                  <h2>Мәселе санаттары</h2>
                  <p>
                    Қаладағы мәселенің түрін таңдаңыз
                  </p>
                </div>
              </div>

              <div className="category-grid">
                {categories.slice(1).map(
                  (category, index) => (
                    <button
                      key={category.name}
                      className="category-card"
                      onClick={() => {
                        setActiveCategory(category.name);
                        openPage("Reports");
                      }}
                    >
                      <div
                        className={`category-icon category-${index}`}
                      >
                        {category.icon}
                      </div>

                      <strong>{category.name}</strong>

                      <span>
                        Өтініштерді қарау ↗
                      </span>
                    </button>
                  )
                )}
              </div>
            </section>
          )}

          {/* ӨТІНІШТЕР */}
          {activePage === "Reports" && (
            <>
              <div style={panelStyle}>
                <h2>Іздеу және сүзгілеу</h2>

                <input
                  style={inputStyle}
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Өтінішті іздеу..."
                />

                <select
                  style={inputStyle}
                  value={activeCategory}
                  onChange={(event) =>
                    setActiveCategory(event.target.value)
                  }
                >
                  {categories.map((category) => (
                    <option
                      key={category.name}
                      value={category.name}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>

                <button
                  className="text-btn"
                  onClick={loadReports}
                >
                  Жаңарту ↻
                </button>
              </div>

              <ReportList
                reports={visibleReports}
                onSelect={setSelectedReport}
              />
            </>
          )}

          {/* ӘКІМШІ ПАНЕЛІ */}
          {activePage === "Admin" && isAdmin && (
            <>
              <div style={panelStyle}>
                <h2>Әкімші панелі</h2>

                <p>
                  Тұрғындардың өтініштерін басқарыңыз.
                </p>

                <p>
                  Барлық нақты өтініш:{" "}
                  <strong>{reports.length}</strong>
                </p>

                <button
                  className="primary-btn"
                  onClick={loadReports}
                >
                  Өтініштерді жаңарту ↻
                </button>
              </div>

              <div style={panelStyle}>
                <h3>Өтініштерді іздеу</h3>

                <input
                  style={inputStyle}
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Өтініш атауы немесе мекенжай"
                />

                <select
                  style={inputStyle}
                  value={activeCategory}
                  onChange={(event) =>
                    setActiveCategory(event.target.value)
                  }
                >
                  {categories.map((category) => (
                    <option
                      key={category.name}
                      value={category.name}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <ReportList
                reports={visibleReports.filter(
                  (report) =>
                    report.source === "supabase"
                )}
                onSelect={setSelectedReport}
                isAdmin={true}
                onStatusChange={updateReportStatus}
                savingId={savingId}
              />
            </>
          )}

          {/* СТАТИСТИКА */}
          {activePage === "Statistics" && (
            <div style={panelStyle}>
              <h2>Өтініштердің орындалуы</h2>

              <p>
                Шешілген өтініштер:{" "}
                {allReports.length
                  ? Math.round(
                      (stats[3].value /
                        allReports.length) *
                        100
                    )
                  : 0}
                %
              </p>

              <progress
                value={stats[3].value}
                max={Math.max(allReports.length, 1)}
                style={{
                  width: "100%",
                  height: 22,
                }}
              />

              <p>
                Көрсеткіштер Supabase және демо
                өтініштерінен есептеледі.
              </p>
            </div>
          )}

          {/* ЖЕКЕ КАБИНЕТ */}
          {activePage === "Profile" && (
            <div style={panelStyle}>
              <h2>Жеке кабинет</h2>

              <label>
                Аты-жөніңіз
                <input
                  style={inputStyle}
                  value={profile.name}
                  readOnly
                />
              </label>

              <label>
                Email
                <input
                  style={inputStyle}
                  value={profile.email}
                  readOnly
                />
              </label>

              <label>
                Рөлі
                <input
                  style={inputStyle}
                  value={
                    isAdmin ? "Әкімші" : "Тұрғын"
                  }
                  readOnly
                />
              </label>

              <p>
                Аккаунт Supabase Authentication
                жүйесі арқылы басқарылады.
              </p>
            </div>
          )}

          {/* БАПТАУЛАР */}
          {activePage === "Settings" && (
            <div style={panelStyle}>
              <h2>Баптаулар</h2>

              <label
                style={{
                  display: "block",
                  margin: "18px 0",
                }}
              >
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={(event) =>
                    setSettings({
                      ...settings,
                      notifications:
                        event.target.checked,
                    })
                  }
                />
                {" "}Хабарламаларды қосу
              </label>

              <label
                style={{
                  display: "block",
                  margin: "18px 0",
                }}
              >
                <input
                  type="checkbox"
                  checked={settings.showDemo}
                  onChange={(event) =>
                    setSettings({
                      ...settings,
                      showDemo:
                        event.target.checked,
                    })
                  }
                />
                {" "}Демонстрациялық өтініштерді көрсету
              </label>

              <button
                className="primary-btn"
                onClick={() =>
                  notify("Баптаулар сақталды.")
                }
              >
                Сақтау
              </button>
            </div>
          )}

          {/* ЖАҢА: SUPABASE ХАБАРЛАМАЛАРЫ */}
          {activePage === "Notifications" && (
            <div style={panelStyle}>
              <div className="section-heading">
                <div>
                  <h2>🔔 Хабарламалар</h2>
                  <p>
                    Өтініштеріңіздің мәртебесі
                    туралы ақпарат
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 12,
                  flexWrap: "wrap",
                  marginBottom: 20,
                }}
              >
                <button
                  className="text-btn"
                  onClick={loadReportNotifications}
                >
                  ↻ Жаңарту
                </button>

                <button
                  className="text-btn"
                  onClick={markNotificationsRead}
                >
                  ✓ Барлығын оқылды деп белгілеу
                </button>
              </div>

              {notificationsLoading && (
                <p>Хабарламалар жүктелуде...</p>
              )}

              {notificationError && (
                <p style={{ color: "#b91c1c" }}>
                  Хабарламаларды жүктеу қатесі:{" "}
                  {notificationError}
                </p>
              )}

              {!notificationsLoading &&
                !notificationError &&
                reportNotifications.length === 0 &&
                messages.length === 0 && (
                  <p>Әзірге хабарламалар жоқ.</p>
                )}

              {reportNotifications.map(
                (notification) => {
                  const isUnread =
                    !readNotificationIds.includes(
                      notification.id
                    );

                  return (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() =>
                        openReportNotification(notification)
                      }
                      style={{
                        display: "block",
                        width: "100%",
                        padding: 18,
                        marginBottom: 12,
                        textAlign: "left",
                        border: "1px solid #dce9df",
                        borderRadius: 14,
                        background: isUnread
                          ? "#edf8f0"
                          : "#ffffff",
                        cursor: "pointer",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent:
                            "space-between",
                          gap: 12,
                        }}
                      >
                        <strong
                          style={{ color: "#20583b" }}
                        >
                          {isUnread ? "🟢 " : "✓ "}
                          Өтініш мәртебесі өзгерді
                        </strong>

                        {isUnread && (
                          <span
                            style={{ color: "#248452" }}
                          >
                            Жаңа
                          </span>
                        )}
                      </div>

                      <p style={{ margin: "10px 0" }}>
                        {notification.text}
                      </p>

                      <small
                        style={{ color: "#64748b" }}
                      >
                        {notification.date}
                      </small>
                    </button>
                  );
                }
              )}

              {messages.length > 0 && (
                <h3 style={{ marginTop: 24 }}>
                  Жүйелік хабарламалар
                </h3>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  style={{
                    padding: 14,
                    borderBottom: "1px solid #eee",
                  }}
                >
                  <strong>{message.text}</strong>
                  <p>{message.date}</p>
                </div>
              ))}

              {messages.length > 0 && (
                <button
                  className="text-btn"
                  onClick={() => setMessages([])}
                >
                  Жүйелік хабарламаларды тазалау
                </button>
              )}
            </div>
          )}

          {/* ҚОЛДАУ */}
          {activePage === "Support" && (
            <div style={panelStyle}>
              <h2>Қолдау қызметі</h2>

              <p>
                Qala SOS жобасына қатысты сұрақтар
                үшін әкімшілікке хабарласыңыз.
              </p>

              <p>
                Онлайн қолдау сұрауларын жіберу
                келесі кезеңде қосылады.
              </p>
            </div>
          )}

          <footer className="footer">
            <span>
              © 2026 QalaSOS. Қаланы бірге жақсартамыз.
            </span>
            <span>Алматы · Прототип</span>
          </footer>
        </div>
      </main>

      {/* ӨТІНІШ ТУРАЛЫ ТОЛЫҚ АҚПАРАТ */}
      {selectedReport && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedReport(null)}
        >
          <div
            className="report-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-heading">
              <div>
                <span className="eyebrow">
                  {selectedReport.id}
                </span>

                <h2>{selectedReport.title}</h2>
              </div>

              <button
                className="modal-close"
                onClick={() => setSelectedReport(null)}
              >
                ×
              </button>
            </div>

            <p>
              <strong>Санат:</strong>{" "}
              {selectedReport.category}
            </p>

            <p>
              <strong>Мекенжай:</strong>{" "}
              {selectedReport.location}
            </p>

            <p>
              <strong>Сипаттама:</strong>{" "}
              {selectedReport.description}
            </p>

            <p>
              <strong>Мәртебесі:</strong>{" "}
              {statusNames[selectedReport.status]}
            </p>

            {selectedReport.imageUrl && (
              <div style={{ margin: "20px 0" }}>
                <strong>Тіркелген фото:</strong>

                <img
                  src={selectedReport.imageUrl}
                  alt="Өтінішке тіркелген фото"
                  style={{
                    width: "100%",
                    maxHeight: 350,
                    objectFit: "contain",
                    borderRadius: 14,
                    marginTop: 12,
                    border: "1px solid #e5e7eb",
                  }}
                />

                <a
                  href={selectedReport.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-block",
                    marginTop: 10,
                    color: "#176b45",
                  }}
                >
                  Фотоны толық ашу ↗
                </a>
              </div>
            )}

            {isAdmin &&
              selectedReport.source === "supabase" && (
                <label>
                  <strong>Мәртебені өзгерту</strong>

                  <select
                    style={inputStyle}
                    value={selectedReport.status}
                    disabled={
                      savingId === selectedReport.id
                    }
                    onChange={(event) =>
                      updateReportStatus(
                        selectedReport,
                        event.target.value
                      )
                    }
                  >
                    <option value="Pending">
                      Қаралуда
                    </option>
                    <option value="In Progress">
                      Орындалуда
                    </option>
                    <option value="Completed">
                      Шешілді
                    </option>
                  </select>
                </label>
              )}

            {selectedReport.lat != null &&
              selectedReport.lng != null && (
                <a
                  href={`https://www.openstreetmap.org/?mlat=${selectedReport.lat}&mlon=${selectedReport.lng}#map=17/${selectedReport.lat}/${selectedReport.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Картадан ашу ↗
                </a>
              )}
          </div>
        </div>
      )}

      {/* ЖАҢА ӨТІНІШ ЖІБЕРУ */}
      {showForm && (
        <div
          className="modal-overlay"
          onClick={closeForm}
        >
          <div
            className="report-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-heading">
              <div>
                <span className="eyebrow">
                  QALASOS · NEW REPORT
                </span>

                <h2>Мәселе хабарлау</h2>

                <p>
                  Қаладағы мәселе туралы ақпарат
                  жіберіңіз.
                </p>
              </div>

              <button
                className="modal-close"
                onClick={closeForm}
                disabled={savingReport}
              >
                ×
              </button>
            </div>

            <form onSubmit={createReport}>
              <label>
                Мәселенің атауы
                <input
                  style={inputStyle}
                  name="title"
                  placeholder="Мысалы: Жолда шұңқыр бар"
                  required
                />
              </label>

              <label>
                Санат
                <select
                  style={inputStyle}
                  name="category"
                  required
                >
                  <option value="">
                    Санатты таңдаңыз
                  </option>

                  {categories.slice(1).map(
                    (category) => (
                      <option
                        key={category.name}
                        value={category.name}
                      >
                        {category.name}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label>
                Мекенжай
                <input
                  style={inputStyle}
                  name="location"
                  placeholder="Аудан, көше, үй нөмірі"
                  required
                />
              </label>

              <label>
                Сипаттама
                <textarea
                  style={inputStyle}
                  name="description"
                  rows={4}
                  placeholder="Мәселені толық сипаттаңыз"
                  required
                />
              </label>

              <div
                style={{
                  marginBottom: 20,
                  padding: 18,
                  background: "#f3f8f5",
                  border: "1px dashed #9ec6ad",
                  borderRadius: 14,
                }}
              >
                <strong>
                  📷 Мәселенің фотосы
                </strong>

                <p
                  style={{
                    fontSize: 13,
                    color: "#64748b",
                  }}
                >
                  JPG, PNG, WEBP · 5 МБ дейін
                </p>

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoChange}
                  disabled={savingReport}
                  style={{
                    display: "block",
                    width: "100%",
                    marginTop: 12,
                  }}
                />

                {photoPreview && (
                  <div style={{ marginTop: 15 }}>
                    <img
                      src={photoPreview}
                      alt="Таңдалған фото"
                      style={{
                        width: "100%",
                        maxHeight: 240,
                        objectFit: "contain",
                        borderRadius: 12,
                      }}
                    />

                    <button
                      type="button"
                      className="text-btn"
                      onClick={clearPhoto}
                      disabled={savingReport}
                    >
                      Фотосуретті алып тастау ×
                    </button>
                  </div>
                )}
              </div>

              <p style={{ fontSize: 13 }}>
                {selectedLocation
                  ? `Картадағы орын: ${selectedLocation.lat.toFixed(5)}, ${selectedLocation.lng.toFixed(5)}`
                  : "Координаттарды қосу үшін картадан орынды таңдаңыз."}
              </p>

              <button
                className="primary-btn submit-btn"
                type="submit"
                disabled={savingReport}
              >
                {savingReport
                  ? "Фото және өтініш сақталуда..."
                  : "Өтініш жіберу →"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
