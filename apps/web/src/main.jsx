import React, { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowUpRight,
  Bell,
  CalendarDays,
  ChevronDown,
  HelpCircle,
  CloudSun,
  Compass,
  FileText,
  Eye,
  EyeOff,
  IndianRupee,
  Leaf,
  MapPin,
  Menu,
  Search,
  Settings,
  Sprout,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import "./styles.css";

const centres = [
  {
    name: "Kolar APMC",
    place: "Kolar",
    district: "Kolar",
    state: "Karnataka",
    distance: "12.4 km",
    status: "Open now",
    wait: "18 min",
    tone: "mint",
  },
  {
    name: "Chikkaballapur Yard",
    place: "Chikkaballapur",
    district: "Chikkaballapur",
    state: "Karnataka",
    distance: "28.1 km",
    status: "Moderate traffic",
    wait: "42 min",
    tone: "amber",
  },
  {
    name: "Malur Farmers Hub",
    place: "Malur",
    district: "Kolar",
    state: "Karnataka",
    distance: "35.8 km",
    status: "Open now",
    wait: "24 min",
    tone: "mint",
  },
];

const prices = [
  {
    crop: "Tomato",
    market: "Kolar APMC",
    price: "₹2,850",
    numericPrice: 2850,
    msp: null,
    change: "+8.4%",
    trend: "up",
  },
  {
    crop: "Ragi",
    market: "Bengaluru North",
    price: "₹3,420",
    numericPrice: 3420,
    msp: 4290,
    change: "+2.1%",
    trend: "up",
  },
  {
    crop: "Beans",
    market: "Chikkaballapur",
    price: "₹4,100",
    numericPrice: 4100,
    msp: null,
    change: "-1.7%",
    trend: "down",
  },
];

const mspReferences = [
  { crop: "Ragi", msp: 4290, season: "Kharif 2026" },
  { crop: "Paddy", msp: 2369, season: "Kharif 2026" },
  { crop: "Maize", msp: 2400, season: "Kharif 2026" },
  { crop: "Tur", msp: 8000, season: "Kharif 2026" },
];

const getLiveMarketPrice = (crop) =>
  prices.find((item) => item.crop.toLowerCase() === crop.toLowerCase())
    ?.numericPrice;

const getAiSlot = (centre, date) => {
  const crowdByCentre = {
    "Kolar APMC": { label: "Low", score: 28, time: "09:30 AM", wait: "18 min" },
    "Chikkaballapur Yard": {
      label: "Moderate",
      score: 57,
      time: "02:00 PM",
      wait: "42 min",
    },
    "Malur Farmers Hub": {
      label: "Low",
      score: 34,
      time: "11:00 AM",
      wait: "24 min",
    },
  };
  const prediction = crowdByCentre[centre] ?? crowdByCentre["Kolar APMC"];
  const requestedDate = date || new Date().toISOString().slice(0, 10);
  const candidateDays = [0, 1, 2, 3, 4].map((offset) => {
    const candidate = new Date(`${requestedDate}T00:00:00`);
    candidate.setDate(candidate.getDate() + offset);
    const day = candidate.getDay();
    const score = Math.min(
      92,
      prediction.score + (day === 1 ? 12 : day === 5 ? 7 : day === 0 ? 18 : 0),
    );
    return { date: candidate.toISOString().slice(0, 10), score };
  });
  const bestDay = candidateDays.reduce(
    (best, candidate) => (candidate.score < best.score ? candidate : best),
    candidateDays[0],
  );
  const adjustedScore = bestDay.score;
  return {
    ...prediction,
    score: adjustedScore,
    label:
      adjustedScore >= 70 ? "High" : adjustedScore >= 45 ? "Moderate" : "Low",
    requestedDate,
    assignedDate: bestDay.date,
    dateChanged: bestDay.date !== requestedDate,
  };
};

const loginImages = [
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1492496913980-501348b61469?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1499529112087-3cb3b73cec95?auto=format&fit=crop&w=1400&q=85",
];

function App() {
  const [role, setRole] = useState("farmer");
  const [authenticated, setAuthenticated] = useState(false);
  const [activePage, setActivePage] = useState("Overview");
  const [menuOpen, setMenuOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [bookings, setBookings] = useState(() => {
    try {
      const savedBookings = window.localStorage.getItem("krishiq-bookings");
      return savedBookings
        ? JSON.parse(savedBookings)
        : [
          {
            date: "20",
            month: "SEP",
            title: "Tomato delivery",
            location: "Kolar APMC",
            time: "09:30 AM",
            token: "K-204",
            quantity: 12,
            value: 34200,
            status: "confirmed",
          },
          {
            date: "24",
            month: "SEP",
            title: "Ragi delivery",
            location: "Malur Farmers Hub",
            time: "02:00 PM",
            token: "M-118",
            quantity: 8,
            value: 27360,
            status: "confirmed",
          },
        ];
    } catch {
      return [];
    }
  });
  const activeBookings = bookings.filter(
    (booking) => booking.status !== "cancelled",
  );

  useEffect(() => {
    window.localStorage.setItem("krishiq-bookings", JSON.stringify(bookings));
  }, [bookings]);

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  };

  const openBooking = () => {
    setBookingOpen(true);
    setMenuOpen(false);
  };

  if (!authenticated) {
    return (
      <LoginPage
        onLogin={(selectedRole) => {
          setRole(selectedRole);
          setAuthenticated(true);
        }}
      />
    );
  }

  if (role !== "farmer") {
    return <RoleWorkspace role={role} onToast={showToast} />;
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? "is-open" : ""}`}>
        <div className="brand-row">
          <div className="brand-mark">
            <Sprout size={20} strokeWidth={2.5} />
          </div>
          <span>
            Mandi<span className="brand-accent">Flow</span>
          </span>
          <button
            className="icon-button close-menu"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={19} />
          </button>
        </div>
        <div className="profile-card">
          <div className="avatar">RK</div>
          <div>
            <strong>Ramesh Kumar</strong>
            <span>Farmer account</span>
          </div>
          <ChevronDown size={16} className="muted-icon" />
        </div>
        <nav className="main-nav" aria-label="Main navigation">
          {[
            ["Overview", Compass],
            ["My bookings", CalendarDays],
            ["Market prices", TrendingUp],
            ["Nearby centres", MapPin],
          ].map(([label, Icon]) => (
            <button
              key={label}
              className={`nav-item ${activePage === label ? "active" : ""}`}
              onClick={() => {
                setActivePage(label);
                setMenuOpen(false);
              }}
            >
              <Icon size={18} /> <span>{label}</span>
              {label === "My bookings" && <em>{activeBookings.length}</em>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-note">
            <HelpCircle size={18} />
            <div>
              <strong>Need a hand?</strong>
              <span>Talk to our support team</span>
            </div>
          </div>
          <button className="nav-item">
            <Settings size={18} />
            <span>Settings</span>
          </button>
          <div className="version">
            KRISHIQ v1.0 <span>•</span> Demo mode
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <button
            className="icon-button mobile-menu"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={21} />
          </button>
          <div className="breadcrumb">
            <span>Workspace</span>
            <span>/</span>
            <strong>{activePage}</strong>
          </div>
          <div className="top-actions">
            <button
              className="icon-button notification-button"
              aria-label="Notifications"
              onClick={() => setNotificationsOpen((open) => !open)}
            >
              <Bell size={19} />
              {notifications.length > 0 && <i />}
            </button>
            <div className="top-avatar">RK</div>
          </div>
          {notificationsOpen && (
            <div className="notification-drawer">
              <div className="notification-drawer-header">
                <strong>Notifications</strong>
                <button onClick={() => setNotifications([])}>Clear</button>
              </div>
              {notifications.length === 0 ? (
                <p className="notification-empty">No new notifications.</p>
              ) : (
                notifications.map((notification) => (
                  <article className="notification-item" key={notification.id}>
                    <span className="notification-icon">
                      <Bell size={14} />
                    </span>
                    <div>
                      <strong>{notification.title}</strong>
                      <p>{notification.body}</p>
                      <small>{notification.sms}</small>
                    </div>
                  </article>
                ))
              )}
            </div>
          )}
        </header>

        <div className="content-wrap">
          <section className="welcome-row">
            <div>
              <p className="eyebrow">Saturday, 19 September 2026</p>
              <h1>Good morning, Ramesh.</h1>
              <p className="subheading">
                Here is what is happening with your produce today.
              </p>
            </div>
            <button className="primary-button" onClick={openBooking}>
              <CalendarDays size={17} /> Book a slot <ArrowUpRight size={16} />
            </button>
          </section>

          {activePage === "Overview" ? (
            <>
              <section className="metric-grid" aria-label="Your farm metrics">
                <article className="metric-card featured">
                  <div className="metric-label">
                    <span className="metric-icon leaf">
                      <Leaf size={17} />
                    </span>
                    <span>Next appointment</span>
                    <span className="status-pill">Confirmed</span>
                  </div>
                  <strong className="metric-value">
                    {activeBookings[0]?.date ?? "--"}{" "}
                    {activeBookings[0]?.month ?? ""},{" "}
                    {activeBookings[0]?.time ?? "No active slot"}
                  </strong>
                  <span className="metric-detail">
                    {activeBookings[0]?.location ?? "Book a procurement centre"}{" "}
                    {activeBookings[0] && (
                      <>
                        <span>•</span> Token {activeBookings[0].token}
                      </>
                    )}
                  </span>
                  <button
                    className="text-button"
                    onClick={() => setActivePage("My bookings")}
                  >
                    View booking <ArrowUpRight size={14} />
                  </button>
                </article>
                <article className="metric-card">
                  <div className="metric-label">
                    <span className="metric-icon sun">
                      <CloudSun size={17} />
                    </span>
                    <span>Field conditions</span>
                  </div>
                  <strong className="metric-value">
                    28°<small> C</small>
                  </strong>
                  <span className="metric-detail">
                    Partly cloudy <span>•</span> 72% humidity
                  </span>
                  <span className="trend-line">
                    <TrendingUp size={14} /> Good harvest conditions
                  </span>
                </article>
                <article className="metric-card">
                  <div className="metric-label">
                    <span className="metric-icon rupee">
                      <IndianRupee size={17} />
                    </span>
                    <span>Today's market average</span>
                  </div>
                  <strong className="metric-value">
                    ₹3,420<small> / qtl</small>
                  </strong>
                  <span className="metric-detail">
                    Ragi <span>•</span> Across 4 markets
                  </span>
                  <span className="trend-line">
                    <TrendingUp size={14} /> 2.1% since yesterday
                  </span>
                </article>
              </section>

              <div className="dashboard-grid">
                <section className="panel booking-panel">
                  <div className="panel-heading">
                    <div>
                      <p className="eyebrow">Your schedule</p>
                      <h2>Upcoming bookings</h2>
                    </div>
                    <button
                      className="small-action"
                      onClick={() => setActivePage("My bookings")}
                    >
                      See all <ArrowUpRight size={14} />
                    </button>
                  </div>
                  <div className="booking-list">
                    {activeBookings.slice(0, 2).map((booking) => (
                      <BookingItem {...booking} key={booking.token} />
                    ))}
                  </div>
                </section>
                <section className="panel price-panel">
                  <div className="panel-heading">
                    <div>
                      <p className="eyebrow">Live snapshot</p>
                      <h2>Market prices</h2>
                    </div>
                    <button
                      className="small-action"
                      onClick={() => setActivePage("Market prices")}
                    >
                      Full view <ArrowUpRight size={14} />
                    </button>
                  </div>
                  <div className="price-table">
                    {prices.map((item) => (
                      <div className="price-row" key={item.crop}>
                        <div className="crop-bullet" />
                        <div className="price-name">
                          <strong>{item.crop}</strong>
                          <span>{item.market}</span>
                        </div>
                        <strong className="price-value">{item.price}</strong>
                        <span className={`price-change ${item.trend}`}>
                          {item.change}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="price-footer">
                    <span>Updated 8 min ago</span>
                    <button
                      className="icon-button"
                      aria-label="Open market price report"
                      onClick={() => showToast("Market report is ready")}
                    >
                      <FileText size={17} />
                    </button>
                  </div>
                </section>
              </div>

              <section className="centre-section">
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow">Plan your visit</p>
                    <h2>Nearby procurement centres</h2>
                  </div>
                  <button
                    className="small-action"
                    onClick={() => setActivePage("Nearby centres")}
                  >
                    View map <MapPin size={14} />
                  </button>
                </div>
                <div className="centre-grid">
                  {centres.map((centre) => (
                    <article className="centre-card" key={centre.name}>
                      <div className="centre-top">
                        <div className={`centre-icon ${centre.tone}`}>
                          <MapPin size={18} />
                        </div>
                        <span className={`open-label ${centre.tone}`}>
                          {centre.status}
                        </span>
                      </div>
                      <h3>{centre.name}</h3>
                      <p>
                        {centre.distance} away <span>•</span> Est. wait{" "}
                        {centre.wait}
                      </p>
                      <button
                        onClick={() =>
                          showToast(`Directions to ${centre.name} opened`)
                        }
                      >
                        Get directions <ArrowUpRight size={14} />
                      </button>
                    </article>
                  ))}
                </div>
              </section>

              <section className="insight-banner">
                <div className="insight-icon">
                  <Users size={20} />
                </div>
                <div>
                  <strong>Good time to bring your produce</strong>
                  <p>
                    Demand for tomatoes is up across nearby markets. Your next
                    slot has a low queue forecast.
                  </p>
                </div>
                <button className="banner-link" onClick={openBooking}>
                  Check availability <ArrowUpRight size={15} />
                </button>
              </section>
            </>
          ) : (
            <FarmerFeaturePage
              page={activePage}
              bookings={bookings}
              onBook={openBooking}
              onCancel={(token) => {
                setBookings((currentBookings) =>
                  currentBookings.filter((booking) => booking.token !== token),
                );
                showToast(`Booking ${token} cancelled and removed`);
              }}
              onToast={showToast}
            />
          )}
        </div>
      </main>

      {bookingOpen && (
        <BookingModal
          onClose={() => setBookingOpen(false)}
          onBook={(booking) => {
            const nextBooking = {
              ...booking,
              token: `${booking.centreCode}-${205 + bookings.length}`,
              assignedDate: booking.date,
              date: formatBookingDate(booking.date).date,
              month: formatBookingDate(booking.date).month,
              title: `${booking.crop} delivery`,
              location: booking.centre,
              value: booking.estimatedValue,
              farmerId: booking.farmerId,
              status: "confirmed",
            };
            setBookings((currentBookings) => [nextBooking, ...currentBookings]);
            const assignedDate = formatBookingDate(booking.date);
            const sms = `KRISHIQ SMS: Farmer ID ${booking.farmerId}. Slot ${assignedDate.date} ${assignedDate.month}, ${booking.time} at ${booking.centre}. Token ${nextBooking.token}.`;
            setNotifications((currentNotifications) => [
              {
                id: `${nextBooking.token}-${Date.now()}`,
                title: "Procurement slot assigned",
                body: `Farmer ID ${booking.farmerId} · ${assignedDate.date} ${assignedDate.month} · ${booking.time} · ${booking.centre} · Token ${nextBooking.token}`,
                sms,
              },
              ...currentNotifications,
            ]);
            setBookingOpen(false);
            setActivePage("My bookings");
            showToast(
              `${booking.requestedDate !== booking.date ? "AI moved you to a quieter day. " : ""}Booking confirmed: ${booking.crop} at ${booking.centre} · ${booking.time} · Token ${nextBooking.token}. SMS queued.`,
            );
          }}
        />
      )}
      {toast && (
        <div className="toast">
          <span className="toast-dot" />
          {toast}
        </div>
      )}
    </div>
  );
}

function formatBookingDate(dateValue) {
  const date = new Date(`${dateValue}T00:00:00`);
  return {
    date: date.toLocaleDateString("en-IN", { day: "2-digit" }),
    month: date.toLocaleDateString("en-IN", { month: "short" }).toUpperCase(),
  };
}

function FarmerFeaturePage({ page, bookings, onBook, onCancel, onToast }) {
  const [selectedBooking, setSelectedBooking] = useState(null);
  if (page === "Market prices") {
    return (
      <section className="feature-page">
        <div className="feature-heading">
          <div>
            <p className="eyebrow">Live snapshot</p>
            <h2>Market prices</h2>
            <p>
              Compare current offers with MSP before you choose where to sell.
            </p>
          </div>
          <button className="primary-button" onClick={onBook}>
            <CalendarDays size={17} /> Book a slot <ArrowUpRight size={16} />
          </button>
        </div>
        <div className="feature-price-grid">
          {prices.map((item) => (
            <article className="feature-price-card" key={item.crop}>
              <div className="feature-price-top">
                <span className="crop-bullet" />
                <span>{item.market}</span>
                <span className={`price-change ${item.trend}`}>
                  {item.change}
                </span>
              </div>
              <h3>{item.crop}</h3>
              <strong>
                {item.price}
                <small> / quintal</small>
              </strong>
              <div className="price-bar">
                <span
                  style={{
                    width:
                      item.crop === "Beans"
                        ? "84%"
                        : item.crop === "Tomato"
                          ? "68%"
                          : "55%",
                  }}
                />
              </div>
              <p>
                Today's average <span>Updated 8 min ago</span>
              </p>
            </article>
          ))}
        </div>
        <section className="msp-panel">
          <div className="msp-heading">
            <div>
              <p className="eyebrow">Farmer protection</p>
              <h2>Minimum Support Price</h2>
              <p>
                MSP status is calculated from the current market quote where
                available.
              </p>
            </div>
            <span className="msp-season">Kharif 2026</span>
          </div>
          <div className="msp-grid">
            {mspReferences.map((item) => {
              const marketPrice = getLiveMarketPrice(item.crop);
              const difference =
                marketPrice === undefined ? 0 : marketPrice - item.msp;
              const hasLivePrice = marketPrice !== undefined;
              const above = difference >= 0;
              return (
                <article
                  className={`msp-card ${hasLivePrice ? (above ? "above" : "below") : "unquoted"}`}
                  key={item.crop}
                >
                  <div>
                    <strong>{item.crop}</strong>
                    <span>MSP ₹{item.msp.toLocaleString("en-IN")} / qtl</span>
                  </div>
                  <div className="msp-values">
                    <span>
                      Market{" "}
                      <b>
                        {hasLivePrice
                          ? `₹${marketPrice.toLocaleString("en-IN")}`
                          : "No live quote"}
                      </b>
                    </span>
                    <span className="msp-status">
                      {hasLivePrice
                        ? above
                          ? "Above MSP"
                          : "Below MSP"
                        : "Awaiting market price"}{" "}
                      {hasLivePrice && (
                        <b>
                          {above ? "+" : ""}₹
                          {difference.toLocaleString("en-IN")}
                        </b>
                      )}
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      onToast(`${item.crop} MSP alert SMS queued in demo mode`)
                    }
                  >
                    <Bell size={13} /> Alert me by SMS
                  </button>
                </article>
              );
            })}
          </div>
          <small className="msp-disclaimer">
            Reference data is demo data. Verify the latest official MSP
            notification before trading.
          </small>
        </section>
        <section className="panel feature-table">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Regional comparison</p>
              <h2>Where your produce earns more</h2>
            </div>
            <button
              className="small-action"
              onClick={() => onToast("Price report downloaded")}
            >
              Download report <FileText size={14} />
            </button>
          </div>
          <div className="price-table">
            {prices
              .concat({
                crop: "Onion",
                market: "Bengaluru East",
                price: "₹2,240",
                numericPrice: 2240,
                msp: null,
                change: "+3.8%",
                trend: "up",
              })
              .map((item) => (
                <div className="price-row" key={item.crop}>
                  <div className="crop-bullet" />
                  <div className="price-name">
                    <strong>{item.crop}</strong>
                    <span>{item.market}</span>
                  </div>
                  <strong className="price-value">{item.price}</strong>
                  <span className={`price-change ${item.trend}`}>
                    {item.change}
                  </span>
                  <button className="small-action" onClick={() => onBook()}>
                    Book <ArrowUpRight size={13} />
                  </button>
                </div>
              ))}
          </div>
        </section>
      </section>
    );
  }

  if (page === "Nearby centres") {
    const [selectedState, setSelectedState] = useState("All states");
    const [placeSearch, setPlaceSearch] = useState("");
    const filteredCentres = centres.filter(
      (centre) =>
        (selectedState === "All states" || centre.state === selectedState) &&
        `${centre.place} ${centre.district} ${centre.name}`
          .toLowerCase()
          .includes(placeSearch.toLowerCase()),
    );
    return (
      <section className="feature-page">
        <div className="feature-heading">
          <div>
            <p className="eyebrow">Plan your visit</p>
            <h2>Nearby procurement centres</h2>
            <p>
              Check queues, operating status, and book a convenient delivery
              slot.
            </p>
          </div>
          <button className="primary-button" onClick={onBook}>
            <CalendarDays size={17} /> Book a slot <ArrowUpRight size={16} />
          </button>
        </div>
        <div className="centre-filters">
          <select
            value={selectedState}
            onChange={(event) => setSelectedState(event.target.value)}
            aria-label="Filter by state"
          >
            <option>All states</option>
            <option>Karnataka</option>
          </select>
          <input
            value={placeSearch}
            onChange={(event) => setPlaceSearch(event.target.value)}
            placeholder="Search place or district"
            aria-label="Search place or district"
          />
          <span>{filteredCentres.length} centres found</span>
        </div>
        <div className="centre-grid feature-centres">
          {filteredCentres.map((centre) => (
            <article
              className="centre-card feature-centre-card"
              key={centre.name}
            >
              <div className="centre-top">
                <div className={`centre-icon ${centre.tone}`}>
                  <MapPin size={18} />
                </div>
                <span className={`open-label ${centre.tone}`}>
                  {centre.status}
                </span>
              </div>
              <h3>{centre.name}</h3>
              <p>
                {centre.place}, {centre.district}, {centre.state} <span>•</span>{" "}
                {centre.distance} away <span>•</span> Est. wait {centre.wait}
              </p>
              <div className="centre-meta">
                <span>
                  <CalendarDays size={13} /> Open today 8:00 AM - 6:00 PM
                </span>
                <span>
                  <Users size={13} /> Handles tomato, ragi & beans
                </span>
              </div>
              <div className="centre-actions">
                <button
                  onClick={() => onToast(`Directions to ${centre.name} opened`)}
                >
                  Get directions <ArrowUpRight size={14} />
                </button>
                <button onClick={onBook}>
                  Book here <CalendarDays size={14} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="feature-page">
      <div className="feature-heading">
        <div>
          <p className="eyebrow">Your schedule</p>
          <h2>My bookings</h2>
          <p>
            Keep track of confirmed delivery slots, queue tokens, and estimated
            value.
          </p>
        </div>
        <button className="primary-button" onClick={onBook}>
          <CalendarDays size={17} /> New booking <ArrowUpRight size={16} />
        </button>
      </div>
      <section className="panel bookings-feature">
        <div className="booking-list">
          {bookings.length ? (
            bookings.map((booking) => (
              <div className="booking-record" key={booking.token}>
                <BookingItem {...booking} onOpen={() => setSelectedBooking(booking)} />
                <div className="booking-record-value">
                  <span>{booking.quantity} qtl at live market price</span>
                  <strong>
                    ₹{booking.value.toLocaleString("en-IN")} estimated
                  </strong>
                </div>
                <div className="booking-record-actions">
                  <button
                    className="cancel-button"
                    onClick={() => onCancel(booking.token)}
                  >
                    Cancel booking
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-bookings">
              <CalendarDays size={22} />
              <strong>No active bookings</strong>
              <span>Book a procurement centre slot to see it here.</span>
              <button className="primary-button" onClick={onBook}>
                Book a slot <ArrowUpRight size={15} />
              </button>
            </div>
          )}
        </div>
      </section>
      <div className="booking-tip">
        <div className="insight-icon">
          <CloudSun size={19} />
        </div>
        <div>
          <strong>Arrive 15 minutes early</strong>
          <p>
            Your token will be called at the centre. Keep your farmer ID and
            produce details ready.
          </p>
        </div>
      </div>
      {selectedBooking && (
        <BookingDetailsModal booking={selectedBooking} onClose={() => setSelectedBooking(null)} onCancel={() => { onCancel(selectedBooking.token); setSelectedBooking(null); }} />
      )}
    </section>
  );
}

function LoginPage({ onLogin }) {
  const [authMode, setAuthMode] = useState("signin");
  const [selectedRole, setSelectedRole] = useState("farmer");
  const [imageIndex, setImageIndex] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [farmerCreated, setFarmerCreated] = useState("");
  const [farmerForm, setFarmerForm] = useState({
    fullName: "",
    phone: "",
    location: "",
    aadhaar: null,
    landRecord: null,
    otherDocument: null,
  });

  useEffect(() => {
    const imageTimer = window.setInterval(() => {
      setImageIndex((currentIndex) => (currentIndex + 1) % loginImages.length);
    }, 5000);
    return () => window.clearInterval(imageTimer);
  }, []);

  const roleDetails = {
    farmer: {
      title: "Sell with more certainty.",
      description:
        "Book slots, follow queues, and find the best market for your harvest.",
      name: "Farmer",
    },
    middleman: {
      title: "Keep every pickup moving.",
      description:
        "Coordinate farmers, inventory, offers, and settlements from one desk.",
      name: "Middleman",
    },
    admin: {
      title: "See the whole network.",
      description:
        "Monitor centres, people, and platform performance in one place.",
      name: "Admin",
    },
  };
  const details = roleDetails[selectedRole];

  const submitLogin = (event) => {
    event.preventDefault();
    if (authMode === "signup") {
      const farmerId = `KR-FR-${String(Date.now()).slice(-6)}`;
      window.localStorage.setItem(
        "krishiq-farmer-profile",
        JSON.stringify({ ...farmerForm, email, farmerId }),
      );
      setFarmerCreated(farmerId);
      return;
    }
    onLogin(selectedRole);
  };

  if (farmerCreated) {
    return (
      <div className="login-page">
        <div
          className="login-visual"
          style={{
            backgroundImage: `linear-gradient(90deg, rgba(18, 61, 43, .9), rgba(29, 104, 75, .42)), url(${loginImages[imageIndex]})`,
          }}
        >
          <div className="login-brand">
            <div className="brand-mark">
              <Sprout size={20} strokeWidth={2.5} />
            </div>
            <span>KRISHIQ</span>
          </div>
          <div className="login-visual-copy">
            <p className="eyebrow">Farmer registration complete</p>
            <h1>
              Your farm has
              <br />
              <em>a new identity.</em>
            </h1>
            <p>
              Use your Farmer ID for bookings, support, and procurement centre
              visits.
            </p>
          </div>
        </div>
        <main className="login-card signup-success">
          <div className="success-icon">
            <Sprout size={24} />
          </div>
          <p className="eyebrow">Your KRISHIQ Farmer ID</p>
          <h2>{farmerCreated}</h2>
          <p className="success-copy">
            Keep this ID safe. It connects your documents, bookings, and
            procurement centre records.
          </p>
          <div className="success-details">
            <span>Registered farmer</span>
            <strong>{farmerForm.fullName}</strong>
            <span>Mobile number</span>
            <strong>{farmerForm.phone}</strong>
            <span>Location</span>
            <strong>{farmerForm.location}</strong>
          </div>
          <button
            className="primary-button login-submit"
            onClick={() => {
              setFarmerCreated("");
              setAuthMode("signin");
            }}
          >
            Continue to sign in <ArrowUpRight size={16} />
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div
        className="login-visual"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(18, 61, 43, .9), rgba(29, 104, 75, .42)), url(${loginImages[imageIndex]})`,
        }}
      >
        <div className="login-brand">
          <div className="brand-mark">
            <Sprout size={20} strokeWidth={2.5} />
          </div>
          <span>KRISHIQ</span>
        </div>
        <div className="login-visual-copy">
          <p className="eyebrow">One connected procurement centre network</p>
          <h1>
            Move produce
            <br />
            <em>forward.</em>
          </h1>
          <p>
            From first booking to final settlement, make every market visit
            count.
          </p>
        </div>
        <div className="login-visual-footer">
          <span>Trusted by 2,486 farmers</span>
          <span>•</span>
          <span>18 procurement centres</span>
        </div>
        <div
          className="login-slide-dots"
          aria-label={`Background image ${imageIndex + 1} of ${loginImages.length}`}
        >
          {loginImages.map((_, index) => (
            <span
              className={index === imageIndex ? "active" : ""}
              key={index}
            />
          ))}
        </div>
      </div>
      <main className="login-card">
        <div className="login-card-top">
          <p className="eyebrow">
            {authMode === "signin" ? "Welcome back" : "Join the network"}
          </p>
          <h2>
            {authMode === "signin"
              ? "Sign in to KRISHIQ"
              : "Create your farmer account"}
          </h2>
          <p>
            {authMode === "signin"
              ? "Choose your workspace to continue."
              : "Register your farm once and use your Farmer ID everywhere."}
          </p>
        </div>
        <div className="auth-tabs">
          <button
            className={authMode === "signin" ? "active" : ""}
            onClick={() => setAuthMode("signin")}
            type="button"
          >
            Sign in
          </button>
          <button
            className={authMode === "signup" ? "active" : ""}
            onClick={() => {
              setAuthMode("signup");
              setSelectedRole("farmer");
            }}
            type="button"
          >
            Sign up
          </button>
        </div>
        <form onSubmit={submitLogin}>
          {authMode === "signin" && (
            <fieldset>
              <legend>Your role</legend>
              <div className="role-options">
                {Object.entries(roleDetails).map(([value, item]) => (
                  <label
                    className={`role-option ${selectedRole === value ? "selected" : ""}`}
                    key={value}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={value}
                      checked={selectedRole === value}
                      onChange={() => setSelectedRole(value)}
                    />
                    <span className="role-radio" />
                    <span>
                      <strong>{item.name}</strong>
                      <small>
                        {value === "farmer"
                          ? "Manage your produce"
                          : value === "middleman"
                            ? "Manage pickups and trade"
                            : "Manage the network"}
                      </small>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}
          {authMode === "signup" && (
            <>
              <label className="login-label">
                Full name
                <input
                  type="text"
                  value={farmerForm.fullName}
                  onChange={(event) =>
                    setFarmerForm({
                      ...farmerForm,
                      fullName: event.target.value,
                    })
                  }
                  placeholder="Your full name"
                  required
                />
              </label>
              <div className="form-row">
                <label className="login-label">
                  Mobile number
                  <input
                    type="tel"
                    value={farmerForm.phone}
                    onChange={(event) =>
                      setFarmerForm({
                        ...farmerForm,
                        phone: event.target.value,
                      })
                    }
                    placeholder="+91 98765 43210"
                    required
                  />
                </label>
                <label className="login-label">
                  Village / location
                  <input
                    type="text"
                    value={farmerForm.location}
                    onChange={(event) =>
                      setFarmerForm({
                        ...farmerForm,
                        location: event.target.value,
                      })
                    }
                    placeholder="Village, district"
                    required
                  />
                </label>
              </div>
            </>
          )}
          <label className="login-label">
            {authMode === "signup"
              ? "Email address"
              : "Farmer ID / ID number"}
            <input
              type={authMode === "signup" ? "email" : "text"}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={
                authMode === "signup"
                  ? "farmer@krishiq.in"
                  : "e.g. KR-FR-1024"
              }
              required
            />
          </label>
          <label className="login-label">
            Password
            <span className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </span>
          </label>
          {authMode === "signup" && (
            <fieldset className="document-fieldset">
              <legend>Upload documents</legend>
              <p className="document-help">
                Upload clear PDF, JPG, or PNG copies for verification.
              </p>
              <label className="document-upload">
                Aadhaar card
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(event) =>
                    setFarmerForm({
                      ...farmerForm,
                      aadhaar: event.target.files?.[0]?.name ?? null,
                    })
                  }
                  required
                />
                <span>{farmerForm.aadhaar ?? "Choose file"}</span>
              </label>
              <label className="document-upload">
                Land record
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(event) =>
                    setFarmerForm({
                      ...farmerForm,
                      landRecord: event.target.files?.[0]?.name ?? null,
                    })
                  }
                  required
                />
                <span>{farmerForm.landRecord ?? "Choose file"}</span>
              </label>
              <label className="document-upload">
                Other document
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(event) =>
                    setFarmerForm({
                      ...farmerForm,
                      otherDocument: event.target.files?.[0]?.name ?? null,
                    })
                  }
                />
                <span>{farmerForm.otherDocument ?? "Optional document"}</span>
              </label>
            </fieldset>
          )}
          <div className="login-meta">
            <label>
              <input type="checkbox" /> Keep me signed in
            </label>
            {authMode === "signin" && (
              <button type="button" onClick={() => setPassword("")}>
                Forgot password?
              </button>
            )}
          </div>
          <button className="primary-button login-submit" type="submit">
            {authMode === "signin"
              ? `Continue as ${details.name}`
              : "Create Farmer ID"}{" "}
            <ArrowUpRight size={16} />
          </button>
        </form>
        <p className="login-demo">
          {authMode === "signin"
            ? "Demo mode: enter any email and password to explore."
            : "Demo mode: documents are stored locally for this prototype."}
        </p>
      </main>
    </div>
  );
}

function RoleWorkspace({ role, onToast }) {
  const isAdmin = role === "admin";
  const roleName = isAdmin ? "Admin" : "Middleman";
  const [adminCentres, setAdminCentres] = useState([
    ["Kolar APMC", "Kolar, Karnataka", "1,240", "Healthy"],
    ["Malur Farmers Hub", "Malur, Karnataka", "842", "Healthy"],
    ["Chikkaballapur Yard", "Chikkaballapur, Karnataka", "404", "Attention"],
  ]);
  const [approvalCount, setApprovalCount] = useState(3);
  const [centreModalOpen, setCentreModalOpen] = useState(false);
  const stats = isAdmin
    ? [
      [
        "Active centres",
        `${15 + adminCentres.length}`,
        `${approvalCount} awaiting review`,
      ],
      ["Registered farmers", "2,486", "+12% this month"],
      ["Today's volume", "₹18.4L", "+8.2% vs yesterday"],
      ["Queue health", "92%", "Across all centres"],
    ]
    : [
      ["Today's pickups", "24", "6 ready now"],
      ["Pending offers", "08", "3 need a response"],
      ["Expected volume", "186 qtl", "+14% this week"],
      ["Avg. settlement", "₹3,860", "Per quintal"],
    ];
  const rows = isAdmin
    ? adminCentres
    : [
      ["Ramesh Kumar", "Tomato", "12 qtl", "Tomorrow, 9:30"],
      ["Lakshmi Devi", "Ragi", "18 qtl", "Today, 2:00"],
      ["Suresh Gowda", "Beans", "8 qtl", "Today, 4:30"],
    ];

  return (
    <div className="role-workspace">
      <header className="role-topbar">
        <div className="brand-row">
          <div className="brand-mark">
            <Sprout size={20} strokeWidth={2.5} />
          </div>
          <span>
            Mandi<span className="brand-accent">Flow</span>
          </span>
        </div>
        <div className="role-actions">
          <span className="role-badge">{roleName} workspace</span>
          <button
            className="icon-button"
            onClick={() => onToast("You are all caught up")}
            aria-label="Notifications"
          >
            <Bell size={19} />
          </button>
          <div className="top-avatar">{isAdmin ? "AD" : "MK"}</div>
        </div>
      </header>
      <main className="role-content">
        <div className="role-heading">
          <div>
            <p className="eyebrow">Saturday, 19 September 2026</p>
            <h1>
              {isAdmin ? "Network overview." : "Keep every pickup moving."}
            </h1>
            <p className="subheading">
              {isAdmin
                ? "Monitor centres, people, and platform performance in one place."
                : "Your daily trade desk for farmers, inventory, and settlements."}
            </p>
          </div>
          <button
            className="primary-button"
            onClick={() =>
              isAdmin
                ? setCentreModalOpen(true)
                : onToast("New pickup flow opened")
            }
          >
            <CalendarDays size={17} />{" "}
            {isAdmin ? "Add centre" : "Schedule pickup"}{" "}
            <ArrowUpRight size={16} />
          </button>
        </div>
        <section className="role-stat-grid">
          {stats.map(([label, value, detail]) => (
            <article className="role-stat" key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
              <small>{detail}</small>
            </article>
          ))}
        </section>
        <section className="role-panels">
          <article className="panel role-table-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">
                  {isAdmin ? "Centre management" : "Live operations"}
                </p>
                <h2>
                  {isAdmin ? "Procurement centres" : "Today's pickup queue"}
                </h2>
              </div>
              <button
                className="small-action"
                onClick={() =>
                  onToast(
                    isAdmin
                      ? "Centre report downloaded in demo mode"
                      : "Full report opened",
                  )
                }
              >
                View report <ArrowUpRight size={14} />
              </button>
            </div>
            <div className="role-table">
              <div className="role-table-header">
                <span>{isAdmin ? "Centre" : "Farmer"}</span>
                <span>{isAdmin ? "Place / state" : "Produce"}</span>
                <span>{isAdmin ? "Farmers" : "Quantity"}</span>
                <span>{isAdmin ? "Status" : "Slot"}</span>
              </div>
              {rows.map((row) => (
                <div className="role-table-row" key={row[0]}>
                  {row.map((cell, index) => (
                    <span
                      className={index === 0 ? "row-primary" : ""}
                      key={`${row[0]}-${cell}`}
                    >
                      {cell}
                      {index === 3 && (
                        <i
                          className={
                            cell === "Attention" ? "warning-dot" : "good-dot"
                          }
                        />
                      )}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </article>
          <article className="panel action-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Quick actions</p>
                <h2>What needs attention</h2>
              </div>
            </div>
            <button
              className="action-row"
              onClick={() =>
                isAdmin
                  ? (setApprovalCount(0),
                    onToast("All centre approvals reviewed"))
                  : onToast("Review queue opened")
              }
            >
              <span className="action-icon amber">
                <Users size={17} />
              </span>
              <span>
                <strong>
                  {isAdmin ? "3 centre approvals" : "3 farmers awaiting offers"}
                </strong>
                <small>
                  {isAdmin
                    ? "Review submitted applications"
                    : "Respond before 3:00 PM"}
                </small>
              </span>
              <ArrowUpRight size={15} />
            </button>
            <button
              className="action-row"
              onClick={() => onToast("Settlement report opened")}
            >
              <span className="action-icon mint">
                <IndianRupee size={17} />
              </span>
              <span>
                <strong>
                  {isAdmin
                    ? "Weekly settlement report"
                    : "₹4.8L to settle today"}
                </strong>
                <small>
                  {isAdmin
                    ? "Performance is up 8.2%"
                    : "Across 18 completed pickups"}
                </small>
              </span>
              <ArrowUpRight size={15} />
            </button>
            <button
              className="action-row"
              onClick={() => onToast("Market intelligence opened")}
            >
              <span className="action-icon peach">
                <TrendingUp size={17} />
              </span>
              <span>
                <strong>
                  {isAdmin ? "Market intelligence" : "Tomato demand is rising"}
                </strong>
                <small>
                  {isAdmin
                    ? "Compare regional activity"
                    : "Consider adding 2 more pickups"}
                </small>
              </span>
              <ArrowUpRight size={15} />
            </button>
          </article>
        </section>
      </main>
      {isAdmin && centreModalOpen && (
        <CentreModal
          onClose={() => setCentreModalOpen(false)}
          onCreate={(centre) => {
            setAdminCentres((current) => [
              ...current,
              [centre.name, `${centre.place}, ${centre.state}`, "0", "Healthy"],
            ]);
            setCentreModalOpen(false);
            onToast(`${centre.name} added to the centre network`);
          }}
        />
      )}
    </div>
  );
}

function BookingItem({ date, month, title, location, time, token, farmerId, onOpen }) {
  return (
    <div className="booking-item" role={onOpen ? "button" : undefined} tabIndex={onOpen ? 0 : undefined} onClick={onOpen} onKeyDown={(event) => { if (onOpen && (event.key === "Enter" || event.key === " ")) onOpen(); }}>
      <div className="date-block">
        <strong>{date}</strong>
        <span>{month}</span>
      </div>
      <div className="booking-info">
        <strong>{title}</strong>
        <span>
          <MapPin size={13} /> {location}
        </span>
        {farmerId && (
          <span className="booking-farmer-id">Farmer ID: {farmerId}</span>
        )}
      </div>
      <div className="booking-time">
        <span>{time}</span>
        <strong>{token}</strong>
      </div>
      <button className="icon-button" aria-label={`Open ${title}`} onClick={(event) => { event.stopPropagation(); onOpen?.(); }}>
        <ArrowUpRight size={17} />
      </button>
    </div>
  );
}

function BookingDetailsModal({ booking, onClose, onCancel }) {
  const sellingCrops = booking.location === "Chikkaballapur Yard" ? "Tomato, ragi, beans, maize" : "Tomato, ragi, beans";
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div className="modal booking-details-modal" role="dialog" aria-modal="true" aria-labelledby="booking-details-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-header"><div><p className="eyebrow">Confirmed procurement slot</p><h2 id="booking-details-title">{booking.title}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close booking details"><X size={19} /></button></div>
        <div className="assigned-slot-banner"><CalendarDays size={20} /><div><span>Time allotted for crop selling</span><strong>{booking.date} {booking.month} · {booking.time}</strong></div></div>
        <div className="booking-detail-grid">
          <div><span>Procurement centre</span><strong>{booking.location}</strong></div>
          <div><span>Token number</span><strong>{booking.token}</strong></div>
          <div><span>Farmer ID</span><strong>{booking.farmerId || "KR-FR-1024"}</strong></div>
          <div><span>Quantity</span><strong>{booking.quantity} quintals</strong></div>
          <div><span>Estimated value</span><strong>₹{booking.value.toLocaleString("en-IN")}</strong></div>
          <div><span>Selling window crops</span><strong>{sellingCrops}</strong></div>
        </div>
        <div className="modal-note"><MapPin size={17} /><span>Arrive 15 minutes before {booking.time}. Show your Farmer ID and token at {booking.location}; the centre will weigh the crop and complete settlement using the market rate.</span></div>
        <div className="booking-detail-actions"><button className="cancel-button" onClick={onCancel}>Cancel booking</button><button className="primary-button" onClick={onClose}>Close details</button></div>
      </div>
    </div>
  );
}

function CentreModal({ onClose, onCreate }) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [place, setPlace] = useState("");
  const [state, setState] = useState("Karnataka");

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="centre-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <p className="eyebrow">Admin action</p>
            <h2 id="centre-modal-title">Add procurement centre</h2>
          </div>
          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Close centre form"
          >
            <X size={19} />
          </button>
        </div>
        <label className="login-label">
          Centre name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Hosur Farmers Hub"
            required
          />
        </label>
        <label className="login-label">
          Address
          <input
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            placeholder="Town, district"
            required
          />
        </label>
        <div className="form-row">
          <label className="login-label">
            Place
            <input
              value={place}
              onChange={(event) => setPlace(event.target.value)}
              placeholder="Town or city"
              required
            />
          </label>
          <label className="login-label">
            State
            <select
              value={state}
              onChange={(event) => setState(event.target.value)}
            >
              <option>Karnataka</option>
              <option>Andhra Pradesh</option>
              <option>Telangana</option>
              <option>Tamil Nadu</option>
            </select>
          </label>
        </div>
        <div className="modal-note">
          <MapPin size={17} />
          <span>
            The centre will appear in the Admin network table immediately in
            demo mode.
          </span>
        </div>
        <button
          className="primary-button modal-submit"
          disabled={!name.trim() || !address.trim()}
          onClick={() => onCreate({ name, address, place, state })}
        >
          Add centre <ArrowUpRight size={16} />
        </button>
      </div>
    </div>
  );
}

function BookingModal({ onClose, onBook }) {
  const [farmerId, setFarmerId] = useState("KR-FR-1024");
  const [crop, setCrop] = useState("Tomato");
  const [quantity, setQuantity] = useState("12");
  const [state, setState] = useState("Karnataka");
  const [district, setDistrict] = useState("Kolar");
  const [place, setPlace] = useState("Kolar");
  const [centre, setCentre] = useState("Kolar APMC");
  const [date, setDate] = useState("2026-09-21");
  const availableCentres = centres.filter(
    (item) =>
      item.state === state &&
      item.district === district &&
      item.place === place,
  );
  const aiSlot = getAiSlot(centre, date);
  const selectedPrice = prices.find((item) => item.crop === crop);
  const quantityValue = Math.max(0, Number(quantity) || 0);
  const estimatedValue = quantityValue * (selectedPrice?.numericPrice ?? 0);

  const assignedDateLabel = formatBookingDate(aiSlot.assignedDate);
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <p className="eyebrow">AI-assisted appointment</p>
            <h2 id="booking-title">Book a delivery slot</h2>
          </div>
          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Close booking dialog"
          >
            <X size={19} />
          </button>
        </div>
        <div className="form-row">
          <label>
            State
            <select
              value={state}
              onChange={(event) => {
                setState(event.target.value);
                setDistrict("Kolar");
                setPlace("Kolar");
                setCentre("Kolar APMC");
              }}
            >
              <option>Karnataka</option>
            </select>
          </label>
          <label>
            District
            <select
              value={district}
              onChange={(event) => {
                const nextDistrict = event.target.value;
                const nextPlace =
                  centres.find((item) => item.district === nextDistrict)
                    ?.place ?? "";
                const nextCentre =
                  centres.find((item) => item.district === nextDistrict)
                    ?.name ?? "";
                setDistrict(nextDistrict);
                setPlace(nextPlace);
                setCentre(nextCentre);
              }}
            >
              <option>Kolar</option>
              <option>Chikkaballapur</option>
            </select>
          </label>
        </div>
        <div className="form-row">
          <label>
            Place
            <select
              value={place}
              onChange={(event) => {
                const nextPlace = event.target.value;
                const nextCentre =
                  centres.find((item) => item.place === nextPlace)?.name ?? "";
                setPlace(nextPlace);
                setCentre(nextCentre);
              }}
            >
              <option>Kolar</option>
              <option>Malur</option>
              <option>Chikkaballapur</option>
            </select>
          </label>
          <label>
            Procurement centre
            <select
              value={centre}
              onChange={(event) => setCentre(event.target.value)}
            >
              {availableCentres.map((item) => (
                <option key={item.name}>{item.name}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="form-row">
          <label>
            Farmer ID
            <input
              value={farmerId}
              onChange={(event) =>
                setFarmerId(event.target.value.toUpperCase())
              }
              placeholder="e.g. KR-FR-1024"
              required
            />
          </label>
          <label>
            Produce
            <select
              value={crop}
              onChange={(event) => setCrop(event.target.value)}
            >
              <option>Tomato</option>
              <option>Ragi</option>
              <option>Beans</option>
            </select>
          </label>
        </div>
        <div className="form-row">
          <label>
            Quantity (quintals)
            <input
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
            />
          </label>
        </div>
        <label>
          Preferred date
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </label>
        <div className="ai-slot-card">
          <div>
            <span>AI-assigned day</span>
            <strong>
              {assignedDateLabel.date} {assignedDateLabel.month}
            </strong>
          </div>
          <div>
            <span>AI-assigned time</span>
            <strong>{aiSlot.time}</strong>
          </div>
          <div>
            <span>Predicted crowd</span>
            <strong className={`crowd-${aiSlot.label.toLowerCase()}`}>
              {aiSlot.label} · {aiSlot.score}%
            </strong>
          </div>
          <small>
            {aiSlot.dateChanged
              ? `Your requested day is busy, so KRISHIQ moved this slot to ${assignedDateLabel.date} ${assignedDateLabel.month}.`
              : "This is the lowest-crowd available slot in the next five days."}{" "}
            Estimated wait: {aiSlot.wait}.
          </small>
        </div>
        <div className="booking-estimate">
          <div>
            <span>Live market price</span>
            <strong>
              ₹{(selectedPrice?.numericPrice ?? 0).toLocaleString("en-IN")} /
              qtl
            </strong>
          </div>
          <div>
            <span>Estimated value</span>
            <strong>₹{estimatedValue.toLocaleString("en-IN")}</strong>
          </div>
        </div>
        <div className="modal-note">
          <CloudSun size={17} />
          <span>
            KRISHIQ checks predicted crowd before confirming. If a day is too
            busy, it automatically assigns a quieter day and time.
          </span>
        </div>
        <button
          className="primary-button modal-submit"
          onClick={() =>
            onBook({
              crop,
              quantity: quantityValue,
              estimatedValue,
              farmerId,
              state,
              district,
              place,
              centre,
              centreCode:
                centre === "Kolar APMC"
                  ? "K"
                  : centre === "Malur Farmers Hub"
                    ? "M"
                    : "C",
              date: aiSlot.assignedDate,
              requestedDate: aiSlot.requestedDate,
              time: aiSlot.time,
            })
          }
        >
          Confirm AI-assigned slot <ArrowUpRight size={16} />
        </button>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
