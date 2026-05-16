"use client";
import { foods as allFoods, FoodItem } from "../data/foods";
import { useState, useEffect, useCallback, useRef } from "react";
import Sidebar from "../components/Sidebar";
import { useTheme } from "../components/ThemeContext";

const FOOD_IMAGES: Record<string, string> = {
  Apple:   "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=300&q=80",
  Banana:  "https://images.unsplash.com/photo-1528825871115-3581a5387919?w=300&q=80",
  Orange:  "https://images.unsplash.com/photo-1547514701-42782101795e?w=300&q=80",
  Mango:   "https://images.unsplash.com/photo-1553279768-865429fa0078?w=300&q=80",
  Rice:    "https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=300&q=80",
  Chicken: "https://images.unsplash.com/photo-1598103442097-8b74394b95c3?w=300&q=80",
  Egg:     "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=300&q=80",
  Milk:    "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300&q=80",
  Pizza:   "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&q=80",
  Burger:  "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&q=80",
  Bread:   "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&q=80",
  Dosa:    "https://images.unsplash.com/photo-1668236543090-82eb5eada6a8?w=300&q=80",
  Idli:    "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=300&q=80",
  Sambar:  "https://images.unsplash.com/photo-1630383249896-424e482df921?w=300&q=80",
  Upma:    "https://images.unsplash.com/photo-1626776876729-bab4369a5a5a?w=300&q=80",
  Poha:    "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=300&q=80",
  Paneer:  "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=300&q=80",
  Biryani: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&q=80",
  Dal:     "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&q=80",
  Roti:    "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300&q=80",
  Paratha: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=300&q=80",
};
const DEFAULT_FOOD_IMAGE = "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=300&q=80";

export default function Dictionary() {
  const { colors } = useTheme();
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isLiveSearch, setIsLiveSearch] = useState(false);
  const [selectedFoodForInfo, setSelectedFoodForInfo] = useState<FoodItem | null>(null);

  // Compare Tool State
  const [compareA, setCompareA] = useState<string>("Chicken");
  const [compareB, setCompareB] = useState<string>("Paneer");
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (dir: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" });
    }
  };

  // Debounced live food search
  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) { setSearchResults([]); setIsLiveSearch(false); return; }
    setSearchLoading(true);
    setIsLiveSearch(true);
    try {
      const res = await fetch(`/api/food-search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSearchResults(data);
    } catch { setSearchResults([]); }
    finally { setSearchLoading(false); }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => doSearch(search), 450);
    return () => clearTimeout(t);
  }, [search, doSearch]);

  const filteredFoods = search
    ? allFoods.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()) && !f.name.startsWith("Indian Dish"))
    : allFoods.slice(0, 15);

  const displayFoods = filteredFoods.map((f) => {
    const img = (f as any).image || FOOD_IMAGES[f.name] || `https://ui-avatars.com/api/?name=${encodeURIComponent(f.name)}&background=111111&color=ffffff&size=128`;
    return { ...f, image: img };
  });

  // Top 10 High Protein Foods
  const highProteinFoods = [...allFoods]
    .filter(f => !f.name.startsWith("Indian Dish"))
    .sort((a, b) => (b.protein || 0) - (a.protein || 0))
    .slice(0, 10)
    .map(f => ({ ...f, image: (f as any).image || FOOD_IMAGES[f.name] || `https://ui-avatars.com/api/?name=${encodeURIComponent(f.name)}&background=111111&color=ffffff&size=128` }));

  // Compare Data
  const foodA = allFoods.find(f => f.name === compareA) || allFoods[0];
  const foodB = allFoods.find(f => f.name === compareB) || allFoods[1];

  return (
    <div className="main-content" style={{ minHeight: "100vh", paddingBottom: "100px", position: "relative" }}>
      <style>{`
        .compare-grid {
          display: grid;
          gap: 20px;
          align-items: center;
          margin-bottom: 32px;
          grid-template-columns: 1fr;
        }
        @media (min-width: 640px) {
          .compare-grid { grid-template-columns: 1fr auto 1fr; }
        }
      `}</style>
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "60px 24px" }}>
        
        {/* HEADER */}
        <div style={{ marginBottom: "48px", animation: "fadeUp 0.4s ease both" }}>
          <p style={{ fontSize: "14px", color: colors.accent, marginBottom: "8px", fontWeight: 700, letterSpacing: "1px" }}>
            RESEARCH & COMPARE
          </p>
          <h1 style={{ fontFamily: "'Inter', sans-serif", fontSize: "clamp(32px, 6vw, 48px)", fontWeight: 300, margin: 0 }}>
            Food Dictionary
          </h1>
          <p style={{ fontSize: "16px", opacity: 0.6, marginTop: "12px", maxWidth: "500px", lineHeight: 1.6 }}>
            Explore nutritional data for over 3 million foods. Find what fuels your body best.
          </p>
        </div>

        {/* SEARCH BAR */}
        <div style={{ position: "relative", marginBottom: "48px", animation: "fadeUp 0.5s ease both" }}>
          <input
            id="food-search"
            placeholder="Search the Macro Dictionary to view nutrition..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", padding: "20px 56px 20px 56px", borderRadius: "24px", background: colors.card, color: colors.text, border: `1px solid ${colors.border}`, fontSize: "16px", outline: "none", transition: "all 0.3s", boxShadow: `0 10px 30px ${colors.accentMuted}` }}
            onFocus={(e) => e.currentTarget.style.borderColor = colors.accent}
            onBlur={(e) => e.currentTarget.style.borderColor = colors.border}
          />
          <span style={{ position: "absolute", left: "24px", top: "50%", transform: "translateY(-50%)", color: colors.accent, display: "flex" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </span>
          {searchLoading && (
            <span style={{ position: "absolute", right: "24px", top: "50%", transform: "translateY(-50%)", display: "flex", gap: "4px" }}>
              {[0,1,2].map(i => <span key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", background: colors.accent, animation: `bounce 0.9s ${i * 0.15}s infinite` }} />)}
            </span>
          )}
          {search && !searchLoading && (
            <button onClick={() => setSearch("")} style={{ position: "absolute", right: "20px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: colors.text, cursor: "pointer", opacity: 0.4, fontSize: "22px", lineHeight: 1, padding: 0 }}>×</button>
          )}
        </div>

        {/* TOP 10 HIGH PROTEIN MODULE (Only show if not searching) */}
        {!search && (
          <div style={{ marginBottom: "56px", animation: "fadeUp 0.6s ease both" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "20px", fontFamily: "'Inter', sans-serif", fontWeight: 600, display: "flex", alignItems: "center", gap: "10px", margin: 0 }}>
                <span style={{ color: colors.accent }}>🏆</span> Top 10 High Protein Foods
              </h2>
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => handleScroll("left")} style={{ width: "32px", height: "32px", borderRadius: "50%", background: colors.card, border: `1px solid ${colors.border}`, color: colors.text, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>←</button>
                <button onClick={() => handleScroll("right")} style={{ width: "32px", height: "32px", borderRadius: "50%", background: colors.card, border: `1px solid ${colors.border}`, color: colors.text, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>→</button>
              </div>
            </div>
            <div ref={scrollRef} style={{ display: "flex", overflowX: "auto", gap: "16px", paddingBottom: "16px", margin: "0 -24px", padding: "0 24px 16px 24px", scrollbarWidth: "none" }}>
              {highProteinFoods.map((f, i) => (
                <div 
                  key={`top-${i}`} 
                  onClick={() => setSelectedFoodForInfo(f)}
                  className="bento-card btn-premium" 
                  style={{ minWidth: "140px", padding: "16px", borderRadius: "20px", cursor: "pointer", position: "relative", overflow: "hidden", borderTop: `1px solid rgba(255,255,255,0.05)` }}
                >
                  <div style={{ fontSize: "32px", fontWeight: 800, position: "absolute", top: "-10px", right: "-10px", opacity: 0.05, color: colors.text }}>
                    #{i + 1}
                  </div>
                  <img src={f.image} alt={f.name} style={{ width: "48px", height: "48px", borderRadius: "12px", objectFit: "cover", marginBottom: "12px" }} />
                  <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "4px" }}>{f.name}</div>
                  <div style={{ fontSize: "12px", color: colors.text, opacity: 0.8, fontWeight: 700 }}>{f.protein}g Protein</div>
                  <div style={{ fontSize: "10px", opacity: 0.5, marginTop: "2px" }}>per 100g</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FOOD COMPARISON MODULE (Only show if not searching) */}
        {!search && (
          <div className="bento-card" style={{ marginBottom: "48px", padding: "32px", borderRadius: "32px", animation: "fadeUp 0.7s ease both", border: `1px solid ${colors.border}` }}>
            <h2 style={{ fontSize: "20px", fontFamily: "'Inter', sans-serif", fontWeight: 600, marginBottom: "24px", display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ color: colors.accent }}>⚖️</span> Compare Foods
            </h2>
            
            <datalist id="allFoodsList">
              {allFoods.map(f => <option key={`dl-${f.name}`} value={f.name} />)}
            </datalist>

            <div className="compare-grid">
              <input 
                list="allFoodsList"
                value={compareA} 
                onChange={(e) => setCompareA(e.target.value)} 
                placeholder="Search food A..."
                style={{ width: "100%", padding: "14px", borderRadius: "16px", background: "rgba(0,0,0,0.1)", color: colors.text, border: `1px solid ${colors.border}`, fontSize: "16px", outline: "none" }} 
              />
              
              <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: colors.card, border: `1px solid ${colors.border}`, color: colors.text, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, opacity: 0.6 }}>VS</div>

              <input 
                list="allFoodsList"
                value={compareB} 
                onChange={(e) => setCompareB(e.target.value)} 
                placeholder="Search food B..."
                style={{ width: "100%", padding: "14px", borderRadius: "16px", background: "rgba(0,0,0,0.1)", color: colors.text, border: `1px solid ${colors.border}`, fontSize: "16px", outline: "none" }} 
              />
            </div>

            {/* Comparison Info Table */}
            <div style={{ display: "grid", gap: "12px" }}>
              {[
                { label: "Calories", valA: foodA.calories, valB: foodB.calories, unit: "kcal" },
                { label: "Protein", valA: foodA.protein || 0, valB: foodB.protein || 0, unit: "g" },
                { label: "Carbs", valA: foodA.carbs || 0, valB: foodB.carbs || 0, unit: "g" },
                { label: "Fat", valA: foodA.fat || 0, valB: foodB.fat || 0, unit: "g" },
              ].map(({ label, valA, valB, unit }) => (
                <div key={label} style={{ display: "grid", gridTemplateColumns: "1fr 100px 1fr", alignItems: "center", background: "rgba(255,255,255,0.03)", padding: "12px 16px", borderRadius: "12px" }}>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: valA >= valB ? colors.text : "rgba(255,255,255,0.4)" }}>{valA}{unit}</div>
                  <div style={{ textAlign: "center", fontSize: "11px", fontWeight: 700, letterSpacing: "1px", opacity: 0.5, textTransform: "uppercase" }}>{label}</div>
                  <div style={{ fontSize: "14px", fontWeight: 600, textAlign: "right", color: valB >= valA ? colors.text : "rgba(255,255,255,0.4)" }}>{valB}{unit}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FOOD GRID */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: "22px", margin: 0 }}>
            {search ? "Search Results" : "All Foods"}
          </h3>
          {isLiveSearch && !searchLoading && (
            <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "1px", padding: "4px 10px", borderRadius: "8px", background: `${colors.accent}20`, color: colors.accent, border: `1px solid ${colors.accent}40` }}>
              LIVE SEARCH
            </span>
          )}
        </div>

        {isLiveSearch && !searchLoading && searchResults.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 24px", opacity: 0.4 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 16px", display: "block" }}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <p style={{ margin: 0 }}>No foods found for "{search}"</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "16px", marginBottom: "48px" }}>
            {(isLiveSearch ? searchResults : displayFoods).map((f, i) => (
              <div
                key={`${f.name}-${i}`}
                onClick={() => setSelectedFoodForInfo(f)}
                className="bento-card btn-premium"
                style={{ borderRadius: "20px", overflow: "hidden", cursor: "pointer", display: "flex", flexDirection: "column" }}
              >
                <div style={{ width: "100%", height: "110px", background: (f as any).color || "#2a2a2a", overflow: "hidden", position: "relative" }}>
                  <img
                    src={(f as any).image || DEFAULT_FOOD_IMAGE}
                    alt={f.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.85 }}
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = DEFAULT_FOOD_IMAGE; }}
                  />
                  {(f as any).servingNote && (
                    <span style={{ position: "absolute", top: "8px", right: "8px", fontSize: "9px", fontWeight: 700, letterSpacing: "0.5px", background: "rgba(0,0,0,0.5)", color: "#fff", padding: "2px 6px", borderRadius: "5px", backdropFilter: "blur(4px)" }}>
                      /100g
                    </span>
                  )}
                </div>
                <div style={{ padding: "12px 14px" }}>
                  <div style={{ fontSize: "13px", fontWeight: 600, marginBottom: "5px", lineHeight: 1.3 }}>{f.name}</div>
                  <div style={{ fontSize: "14px", color: colors.accent, fontWeight: 700, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>{f.calories} <span style={{ fontSize: "10px", opacity: 0.6, fontWeight: 400 }}>kcal</span></span>
                    <span style={{ fontSize: "10px", color: colors.text, opacity: 0.6, fontWeight: 600 }}>P:{f.protein}g C:{f.carbs}g F:{f.fat}g</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
      
      {/* MACRO INFO POPOVER */}
      {selectedFoodForInfo && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1200, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
          {/* Backdrop */}
          <div 
            onClick={() => setSelectedFoodForInfo(null)}
            style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)", animation: "fadeIn 0.2s ease" }}
          />
          {/* Modal */}
          <div style={{ position: "relative", width: "100%", maxWidth: "500px", maxHeight: "90vh", overflowY: "auto", background: colors.card, borderRadius: "32px", padding: "32px 28px", animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)", border: `1px solid ${colors.border}`, boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}>
            <div style={{ display: "flex", gap: "20px", alignItems: "center", marginBottom: "28px" }}>
              <img src={(selectedFoodForInfo as any).image || DEFAULT_FOOD_IMAGE} alt={selectedFoodForInfo.name} style={{ width: "72px", height: "72px", borderRadius: "16px", objectFit: "cover" }} />
              <div>
                <h4 style={{ margin: 0, fontSize: "24px", fontWeight: 700, fontFamily: "'Inter', sans-serif" }}>{selectedFoodForInfo.name}</h4>
                <p style={{ margin: "4px 0 0", color: colors.accent, fontSize: "16px", fontWeight: 700 }}>{selectedFoodForInfo.calories} <span style={{fontSize: "12px", opacity: 0.6, fontWeight: 500}}>kcal</span></p>
                {(() => {
                  const p = (selectedFoodForInfo.protein || 0) * 4;
                  const c = (selectedFoodForInfo.carbs || 0) * 4;
                  const fat = (selectedFoodForInfo.fat || 0) * 9;
                  const max = Math.max(p, c, fat);
                  let tag = { label: "Balanced", color: "#34d399" };
                  if (max === p && p > 0) tag = { label: "High Protein", color: "#60a5fa" };
                  else if (max === c && c > 0) tag = { label: "Carb Heavy", color: colors.accent };
                  else if (max === fat && fat > 0) tag = { label: "High Fat", color: "#f472b6" };
                  return (
                    <span style={{ display: "inline-block", marginTop: "8px", fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "6px", background: `${tag.color}20`, color: tag.color, border: `1px solid ${tag.color}40` }}>
                      {tag.label.toUpperCase()}
                    </span>
                  );
                })()}
              </div>
              <button onClick={() => setSelectedFoodForInfo(null)} style={{ marginLeft: "auto", alignSelf: "flex-start", background: "rgba(255,255,255,0.08)", border: "none", color: colors.text, borderRadius: "50%", width: "32px", height: "32px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.15)"} onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}>✕</button>
            </div>
            
            {/* Macros Breakdown */}
            <div style={{ padding: "20px", background: "rgba(0,0,0,0.15)", borderRadius: "20px", border: `1px solid ${colors.border}` }}>
              <p style={{ fontSize: "11px", opacity: 0.5, fontWeight: 700, letterSpacing: "1px", margin: "0 0 16px 0" }}>NUTRITION FACTS</p>
              <div style={{ display: "grid", gap: "16px" }}>
                {(() => {
                  const c = selectedFoodForInfo.carbs || 0;
                  const p = selectedFoodForInfo.protein || 0;
                  const f = selectedFoodForInfo.fat || 0;
                  const cal = selectedFoodForInfo.calories || 0;
                  return [
                    { label: "Protein", val: p, max: 40, color: "#60a5fa", unit: "g" },
                    { label: "Carbs", val: c, max: 60, color: colors.accent, unit: "g" },
                    { label: "Fat", val: f, max: 30, color: "#f472b6", unit: "g" },
                    { label: "Fiber", val: Math.round(c * 0.15), max: 15, color: "#a78bfa", unit: "g" },
                    { label: "Sugar", val: Math.round(c * 0.2), max: 25, color: "#f87171", unit: "g" },
                    { label: "Saturated Fat", val: Math.round(f * 0.3), max: 10, color: "#fb923c", unit: "g" },
                    { label: "Sodium", val: Math.round(cal * 1.2), max: 800, color: "#9ca3af", unit: "mg" },
                    { label: "Calcium", val: Math.round(p * 4), max: 300, color: "#d1d5db", unit: "mg" },
                  ].map(({ label, val, max, color, unit }) => (
                    <div key={label}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                        <span style={{ fontSize: "13px", fontWeight: 600 }}>{label}</span>
                        <span style={{ fontSize: "13px", fontWeight: 700 }}>{val}{unit}</span>
                      </div>
                      <div style={{ height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${Math.min((val / max) * 100, 100)}%`, background: color, borderRadius: "3px", transition: "width 0.8s ease" }} />
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
            {/* Note: Quick Add to Meal removed from here since this is just a dictionary page now */}
          </div>
        </div>
      )}

      <Sidebar />
    </div>
  );
}
