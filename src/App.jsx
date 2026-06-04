import { useState, useEffect, useRef } from "react";
import {
  BrowserRouter,
  NavLink,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Home from "./pages/Home";
import Shelf from "./pages/Shelf";
import Table from "./pages/Table";
import Library from "./pages/Library";
import Roll from "./pages/Roll";
import Stats from "./pages/Stats";
import { initDB } from "./db/db";
import BookDetail from "./pages/BookDetail";

function AnimatedRoutes() {
  const location = useLocation();
  const isBookDetail = location.pathname.startsWith("/book/");

  return (
    <div key={location.pathname} className={isBookDetail ? "" : "page-enter"}>
      <Routes location={location}>
        <Route path="/" element={<Home />} />
        <Route path="/shelf" element={<Shelf />} />
        <Route path="/table" element={<Table />} />
        <Route path="/library" element={<Library />} />
        <Route path="/roll" element={<Roll />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/book/:id" element={<BookDetail />} />
      </Routes>
    </div>
  );
}

const lowerIds = ["b-ll1", "b-ll2", "b-ll3", "b-ll4", "b-ll5"];
const upperIds = ["b-ul1", "b-ul2", "b-ul3", "b-ul4", "b-ul5"];

function SplashScreen({ isReady }) {
  const [visible, setVisible] = useState(true);
  const [fadingOut, setFadingOut] = useState(false);
  const animDone = useRef(false);
  const dbDone = useRef(false);
  const MIN_DURATION = 2800;
  const startTime = useRef(null);

  const maybeExit = () => {
    if (!animDone.current || !dbDone.current) return;
    const elapsed = Date.now() - startTime.current;
    const delay = Math.max(0, MIN_DURATION - elapsed);
    setTimeout(() => {
      setFadingOut(true);
      setTimeout(() => setVisible(false), 600);
    }, delay);
  };

  useEffect(() => {
    startTime.current = Date.now();
    if (!isReady) return;
    dbDone.current = true;
    maybeExit();
  }, [isReady]);

  useEffect(() => {
    const t = setTimeout(() => {
      setFadingOut(true);
      setTimeout(() => setVisible(false), 600);
    }, 8000);
    return () => clearTimeout(t);
  }, []);

  const featherRef = useRef(null);
  const revealRef = useRef(null);

  useEffect(() => {
    const el = (id) => document.getElementById(id);

    setTimeout(() => {
      if (!featherRef.current) return;
      featherRef.current.style.transition =
        "opacity 0.45s ease, transform 0.45s ease";
      featherRef.current.style.opacity = "1";
      featherRef.current.style.transform = "translateY(0)";
    }, 150);

    setTimeout(() => {
      const shaft = el("sp-shaft");
      if (!shaft) return;
      shaft.style.transition = "stroke-dashoffset 0.6s ease";
      shaft.style.strokeDashoffset = "0";
    }, 450);

    lowerIds.forEach((lid, i) => {
      setTimeout(
        () => {
          const lo = el(lid);
          const up = el(upperIds[i]);
          if (lo) {
            lo.style.transition = "stroke-dashoffset 0.28s ease";
            lo.style.strokeDashoffset = "0";
          }
          if (up) {
            up.style.transition = "stroke-dashoffset 0.28s ease";
            up.style.strokeDashoffset = "0";
          }
        },
        950 + i * 120,
      );
    });

    setTimeout(() => {
      if (!revealRef.current) return;
      revealRef.current.style.transition =
        "width 1.1s cubic-bezier(0.4,0,0.2,1)";
      revealRef.current.style.width = "100%";
      revealRef.current.addEventListener(
        "transitionend",
        () => {
          animDone.current = true;
          maybeExit();
        },
        { once: true },
      );
    }, 1850);
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "24px",
        background: "var(--bg-primary)", // ← changed
        paddingBottom: "env(safe-area-inset-bottom)",
        opacity: fadingOut ? 0 : 1,
        transition: fadingOut ? "opacity 0.6s ease" : "none",
        pointerEvents: "none",
      }}
    >
      <div
        ref={featherRef}
        style={{ opacity: 0, transform: "translateY(8px)" }}
      >
        <svg
          width="234"
          height="66"
          viewBox="0 0 78 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            opacity="0.9"
            d="M43.125 0C42.773 0.0683947 42.4291 0.14035 42.0801 0.21875C35.9307 1.64731 29.6385 4.57712 26.2627 9.8252C26.14 10.0311 26.0266 10.2424 25.9199 10.4541C29.4194 10.5761 32.9212 10.639 36.4248 10.6543C36.433 10.6249 36.4437 10.5959 36.458 10.5684C36.6468 10.2047 36.8723 9.85388 37.1123 9.5293C41.9055 4.00195 49.0092 1.8395 55.7715 0.480469C56.1524 0.413362 56.5367 0.351473 56.9189 0.294922C56.5393 0.366245 56.1579 0.442688 55.7803 0.524414C49.1062 2.10496 42.0479 4.69329 37.8086 10.0244C37.6693 10.2291 37.5395 10.4424 37.4229 10.6582C40.3022 10.6635 43.1825 10.6369 46.0635 10.5859C46.068 10.5769 46.0718 10.5673 46.0771 10.5586C46.2814 10.2266 46.5298 9.90801 46.7842 9.62598C51.8601 4.89328 58.7715 3.381 65.3271 2.59863C65.6958 2.56347 66.0664 2.53295 66.4355 2.50781C66.0674 2.54456 65.6981 2.5861 65.3311 2.63281C58.8324 3.59204 51.9144 5.43958 47.2842 10.0635C47.1482 10.2243 47.0173 10.3955 46.8975 10.5703C51.2588 10.4859 55.6213 10.3443 59.9834 10.1709C60.1134 9.95604 60.2711 9.76733 60.4434 9.59473C64.6154 6.43036 69.8842 5.86488 74.8428 5.24023C75.1222 5.21266 75.3999 5.18667 75.6807 5.16309C75.4005 5.19331 75.1234 5.22558 74.8447 5.25977C69.9258 5.98147 64.5912 6.76054 60.7139 9.86133C60.6245 9.95499 60.5406 10.0517 60.4658 10.1523C65.0481 9.96769 69.6299 9.74993 74.209 9.51953C75.473 9.48238 76.7417 9.45446 78 9.44141C76.7422 9.48112 75.4744 9.53485 74.2119 9.59863C69.6115 9.92743 65.0043 10.2434 60.3926 10.5264C60.4892 10.6854 60.6116 10.8366 60.748 10.9805C64.5886 14.0733 69.9317 14.8785 74.8457 15.6123C75.1241 15.6473 75.4008 15.6799 75.6807 15.7109C75.3999 15.6882 75.1223 15.6635 74.8428 15.6367C69.8791 15.0242 64.6182 14.4851 60.4092 11.3125C60.197 11.1011 60.003 10.8668 59.8574 10.585C59.8532 10.5768 59.8509 10.568 59.8477 10.5596C55.4736 10.8252 51.0955 11.0588 46.7148 11.2344C46.8924 11.5084 47.1107 11.7792 47.3379 12.0234C52.3765 16.5724 59.5587 18.2737 66.3125 19.2051C66.6938 19.2499 67.0767 19.2898 67.459 19.3252C67.076 19.3014 66.6922 19.2725 66.3096 19.2393C59.4989 18.4863 52.3405 17.1174 46.8574 12.4844C46.5814 12.2053 46.3086 11.8859 46.084 11.5488C46.0326 11.4718 46.0138 11.3776 46.0332 11.2871C46.0351 11.2781 46.0384 11.2695 46.041 11.2607C43.1874 11.3713 40.3328 11.4573 37.4775 11.5127C37.5881 11.7136 37.7089 11.9126 37.8389 12.1035C42.0782 17.4347 49.1364 20.022 55.8105 21.6025C56.1882 21.6843 56.5695 21.7617 56.9492 21.833C56.567 21.7765 56.1827 21.7146 55.8018 21.6475C49.0395 20.2884 41.9358 18.1259 37.1426 12.5986C36.9026 12.2741 36.677 11.9232 36.4883 11.5596C36.4835 11.5505 36.4806 11.5406 36.4766 11.5312C32.9878 11.5901 29.4983 11.6013 26.0088 11.5547C26.0895 11.7072 26.1739 11.8588 26.2627 12.0078C29.6385 17.2559 35.9307 20.1857 42.0801 21.6143C42.4291 21.6927 42.7731 21.7646 43.125 21.833C42.77 21.7827 42.4224 21.7285 42.0693 21.668C35.8361 20.5279 29.3486 18.0377 25.3799 12.5674C25.1728 12.2576 24.9789 11.9339 24.8047 11.6035C24.7932 11.5819 24.7857 11.5588 24.7773 11.5361C21.4439 11.4783 18.1107 11.3655 14.7783 11.1885C17.4376 15.2053 21.7292 18.0658 26.2871 19.8945C26.5502 19.9998 26.808 20.1002 27.0742 20.1992C26.8021 20.1175 26.5374 20.0345 26.2676 19.9463C21.4804 18.3703 16.8255 15.7197 13.7207 11.4775C13.6342 11.3573 13.5487 11.2366 13.4658 11.1143C10.9568 10.968 8.44807 10.7878 5.94043 10.5625C5.83218 10.5538 5.72418 10.5439 5.61621 10.5352C5.01961 10.7832 4.22121 10.9375 3.34277 10.9375C1.49695 10.9375 0.000567181 10.2675 0 9.44141C0 8.61505 1.4966 7.94436 3.34277 7.94434C4.92855 7.94434 6.25361 8.44041 6.59668 9.10352C8.91363 9.35567 11.2324 9.57141 13.5527 9.75586C13.5559 9.75052 13.5582 9.74451 13.5615 9.73926C13.7178 9.49487 13.8814 9.25347 14.0518 9.0166C17.1565 4.77447 21.8115 2.12379 26.5986 0.547852C26.8685 0.459627 27.1332 0.376632 27.4053 0.294922C27.139 0.394 26.8804 0.493343 26.6172 0.598633C21.949 2.47162 17.5608 5.42814 14.9189 9.59961C14.8669 9.68291 14.8158 9.76664 14.7656 9.85059C18.0903 10.0989 21.418 10.2823 24.748 10.4111C24.7563 10.3486 24.7744 10.2868 24.8047 10.2295C24.9789 9.89905 25.1728 9.5755 25.3799 9.26562C29.3486 3.79512 35.836 1.30516 42.0693 0.165039C42.4225 0.104488 42.77 0.0503415 43.125 0Z"
            fill="#E8682A"
          />
        </svg>
      </div>

      {/* ── Wordmark ── */}
      <div
        style={{ position: "relative", display: "inline-block", lineHeight: 1 }}
      >
        <span
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 200,
            fontSize: "46px",
            letterSpacing: "4px",
            color: "var(--charcoal-500)", // ← changed
            display: "block",
            userSelect: "none",
          }}
        >
          munin
        </span>
        <span
          ref={revealRef}
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 200,
            fontSize: "46px",
            letterSpacing: "4px",
            color: "#ffffff",
            position: "absolute",
            top: 0,
            left: 0,
            whiteSpace: "nowrap",
            overflow: "hidden",
            width: "0",
          }}
        >
          munin
        </span>
      </div>
    </div>
  );
}

function App() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    initDB().then(() => setDbReady(true));
  }, []);

  return (
    <>
      <SplashScreen isReady={dbReady} />
      <BrowserRouter>
        <div
          className="min-h-screen"
          style={{ paddingBottom: "calc(100px + env(safe-area-inset-bottom))" }}
        >
          <main className="max-w-lg mx-auto px-4 py-6 relative overflow-hidden">
            <AnimatedRoutes />
          </main>

          <nav
            className="fixed bottom-0 left-0 right-0 flex justify-center pointer-events-none"
            style={{
              paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)",
            }}
          >
            <div
              className="pointer-events-auto flex items-center gap-1 px-2 py-2"
              style={{
                background: "rgba(28, 26, 24, 0.96)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                borderRadius: "999px",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              }}
            >
              <NavLink to="/" end>
                {({ isActive }) => (
                  <div
                    className="flex flex-col items-center justify-center gap-0.5 transition-all"
                    style={{
                      padding: "8px 16px",
                      borderRadius: "999px",
                      background: isActive
                        ? "rgba(255,255,255,0.08)"
                        : "transparent",
                      minWidth: "60px",
                    }}
                  >
                    <span
                      style={{
                        color: isActive ? "#E8682A" : "rgba(255,255,255,0.5)",
                        fontSize: "18px",
                      }}
                    >
                      ⌂
                    </span>
                    <span
                      style={{
                        color: isActive ? "#ffffff" : "rgba(255,255,255,0.4)",
                        fontSize: "10px",
                        fontWeight: isActive ? 500 : 400,
                      }}
                    >
                      Home
                    </span>
                  </div>
                )}
              </NavLink>

              <NavLink to="/shelf">
                {({ isActive }) => (
                  <div
                    className="flex flex-col items-center justify-center gap-0.5 transition-all"
                    style={{
                      padding: "8px 16px",
                      borderRadius: "999px",
                      background: isActive
                        ? "rgba(255,255,255,0.08)"
                        : "transparent",
                      minWidth: "60px",
                    }}
                  >
                    <span
                      style={{
                        color: isActive ? "#E8682A" : "rgba(255,255,255,0.5)",
                        fontSize: "18px",
                      }}
                    >
                      ▤
                    </span>
                    <span
                      style={{
                        color: isActive ? "#ffffff" : "rgba(255,255,255,0.4)",
                        fontSize: "10px",
                        fontWeight: isActive ? 500 : 400,
                      }}
                    >
                      Shelf
                    </span>
                  </div>
                )}
              </NavLink>

              <NavLink to="/roll">
                {({ isActive }) => (
                  <div
                    className="flex flex-col items-center justify-center transition-all"
                    style={{ padding: "4px 8px" }}
                  >
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "999px",
                        background: isActive
                          ? "#E8682A"
                          : "rgba(232,104,42,0.25)",
                        border: "1px solid rgba(232,104,42,0.5)",
                        boxShadow: isActive
                          ? "0 0 20px rgba(232,104,42,0.5)"
                          : "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "20px",
                      }}
                    >
                      🎲
                    </div>
                  </div>
                )}
              </NavLink>

              <NavLink to="/library">
                {({ isActive }) => (
                  <div
                    className="flex flex-col items-center justify-center gap-0.5 transition-all"
                    style={{
                      padding: "8px 16px",
                      borderRadius: "999px",
                      background: isActive
                        ? "rgba(255,255,255,0.08)"
                        : "transparent",
                      minWidth: "60px",
                    }}
                  >
                    <span
                      style={{
                        color: isActive ? "#E8682A" : "rgba(255,255,255,0.5)",
                        fontSize: "18px",
                      }}
                    >
                      ⊞
                    </span>
                    <span
                      style={{
                        color: isActive ? "#ffffff" : "rgba(255,255,255,0.4)",
                        fontSize: "10px",
                        fontWeight: isActive ? 500 : 400,
                      }}
                    >
                      Library
                    </span>
                  </div>
                )}
              </NavLink>

              <NavLink to="/stats">
                {({ isActive }) => (
                  <div
                    className="flex flex-col items-center justify-center gap-0.5 transition-all"
                    style={{
                      padding: "8px 16px",
                      borderRadius: "999px",
                      background: isActive
                        ? "rgba(255,255,255,0.08)"
                        : "transparent",
                      minWidth: "60px",
                    }}
                  >
                    <span
                      style={{
                        color: isActive ? "#E8682A" : "rgba(255,255,255,0.5)",
                        fontSize: "18px",
                      }}
                    >
                      ◎
                    </span>
                    <span
                      style={{
                        color: isActive ? "#ffffff" : "rgba(255,255,255,0.4)",
                        fontSize: "10px",
                        fontWeight: isActive ? 500 : 400,
                      }}
                    >
                      Stats
                    </span>
                  </div>
                )}
              </NavLink>
            </div>
          </nav>
        </div>
      </BrowserRouter>
    </>
  );
}

export default App;
