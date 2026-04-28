import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Barcode, RefreshCw, Plus } from "lucide-react";
import { pressable, pressablePrimary } from "../motion/presets";
import { modalOverlay, modalPanel } from "../motion/variants";
import Skeleton from "./Skeleton";

const THROTTLE_MS = 200;

async function fetchOFF(barcode) {
  const cached = localStorage.getItem(`barcodeCache:${barcode}`);
  if (cached) return JSON.parse(cached);
  const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
  const data = await res.json();
  if (data.status === 0) return null;
  const n = data.product?.nutriments || {};
  const result = {
    name: data.product?.product_name || "Unknown product",
    image: data.product?.image_front_small_url || null,
    kcalPer100g: Math.round(n["energy-kcal_100g"] || 0),
    proteinPer100g: Math.round(n["proteins_100g"] || 0),
    carbsPer100g: Math.round(n["carbohydrates_100g"] || 0),
    fatPer100g: Math.round(n["fat_100g"] || 0),
    fibrePer100g: Math.round(n["fiber_100g"] || 0),
    servingSize: (() => {
      const s = data.product?.serving_size || "";
      const m = s.match(/(\d+\.?\d*)/);
      return m ? parseFloat(m[1]) : 100;
    })(),
  };
  localStorage.setItem(`barcodeCache:${barcode}`, JSON.stringify(result));
  return result;
}

export default function BarcodeScanner({ onLog, onClose }) {
  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const lastScanRef = useRef(0);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [serving, setServing] = useState(100);
  const [permDenied, setPermDenied] = useState(false);
  const [manualBarcode, setManualBarcode] = useState("");
  const [started, setStarted] = useState(false);

  async function startScanner() {
    setStarted(true);
    setError("");
    try {
      const { BrowserMultiFormatReader } = await import("@zxing/browser");
      const reader = new BrowserMultiFormatReader();
      readerRef.current = reader;
      const devices = await BrowserMultiFormatReader.listVideoInputDevices();
      const deviceId = devices[devices.length - 1]?.deviceId;
      reader.decodeFromVideoDevice(deviceId, videoRef.current, async (result, err) => {
        if (!result) return;
        const now = Date.now();
        if (now - lastScanRef.current < THROTTLE_MS) return;
        lastScanRef.current = now;
        reader.reset();
        await handleBarcode(result.getText());
      });
    } catch (e) {
      if (e.name === "NotAllowedError") setPermDenied(true);
      else setError("Camera unavailable. Try entering barcode manually.");
      setStarted(false);
    }
  }

  async function handleBarcode(barcode) {
    setLoading(true);
    setError("");
    try {
      const p = await fetchOFF(barcode);
      if (!p) { setError("Product not found. Try entering manually."); setLoading(false); return; }
      setProduct(p);
      setServing(p.servingSize);
    } catch {
      setError("Couldn't look up product. Check connection.");
    }
    setLoading(false);
  }

  function handleLog() {
    if (!product) return;
    const factor = serving / 100;
    onLog({
      name: `${product.name} (${serving}g)`,
      calories: Math.round(product.kcalPer100g * factor),
      protein: Math.round(product.proteinPer100g * factor),
      carbs: Math.round(product.carbsPer100g * factor),
      fat: Math.round(product.fatPer100g * factor),
    });
    onClose();
  }

  useEffect(() => {
    return () => { readerRef.current?.reset(); };
  }, []);

  const factor = serving / 100;

  return (
    <motion.div variants={modalOverlay} initial="hidden" animate="show" exit="exit"
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 200, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
      onClick={onClose}
    >
      <motion.div variants={modalPanel} initial="hidden" animate="show" exit="exit"
        style={{ background: "var(--c-card)", borderRadius: 20, width: "100%", maxWidth: 400, margin: 16, overflow: "hidden" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 16px 12px", borderBottom: "1px solid var(--c-border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Barcode size={18} style={{ color: "var(--c-accent)" }} />
            <span style={{ fontWeight: 700, fontSize: 15, color: "var(--c-text)" }}>Barcode Scanner</span>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--c-sub)" }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: 16 }}>
          {!product && !loading && (
            <>
              {permDenied ? (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <p style={{ fontSize: 13, color: "var(--c-sub)", marginBottom: 16 }}>Camera permission denied. Enter barcode manually:</p>
                </div>
              ) : !started ? (
                <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
                  <motion.button {...pressablePrimary} onClick={startScanner}
                    style={{ padding: "12px 24px", borderRadius: 14, background: "var(--c-accent)", color: "#fff", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer", width: "100%" }}>
                    Start Camera Scanner
                  </motion.button>
                </div>
              ) : (
                <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", marginBottom: 16, background: "#000", aspectRatio: "4/3" }}>
                  <video ref={videoRef} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                    <div style={{ width: 220, height: 100, border: "2px solid var(--c-accent)", borderRadius: 8, boxShadow: "0 0 0 2000px rgba(0,0,0,0.4)" }} />
                  </div>
                  <p style={{ position: "absolute", bottom: 12, left: 0, right: 0, textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.8)" }}>Point camera at barcode</p>
                </div>
              )}

              {error && <p style={{ fontSize: 12, color: "#F87171", textAlign: "center", marginBottom: 12 }}>{error}</p>}

              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input value={manualBarcode} onChange={e => setManualBarcode(e.target.value)}
                  placeholder="Enter barcode manually…"
                  style={{ flex: 1, padding: "10px 12px", borderRadius: 12, background: "var(--c-input, var(--c-card))", border: "1px solid var(--c-border)", color: "var(--c-text)", fontSize: 13, outline: "none" }}
                  onKeyDown={e => e.key === "Enter" && manualBarcode && handleBarcode(manualBarcode)}
                />
                <motion.button {...pressable} onClick={() => manualBarcode && handleBarcode(manualBarcode)}
                  style={{ padding: "10px 14px", borderRadius: 12, background: "var(--c-accent)", color: "#fff", fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer" }}>
                  Go
                </motion.button>
              </div>
            </>
          )}

          {loading && (
            <div style={{ padding: "16px 0" }}>
              <Skeleton variant="card" width="100%" height={120} />
              <p style={{ textAlign: "center", fontSize: 12, color: "var(--c-sub)", marginTop: 12 }}>Looking up product…</p>
            </div>
          )}

          {product && !loading && (
            <div>
              <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
                {product.image && <img src={product.image} alt="" style={{ width: 60, height: 60, borderRadius: 8, objectFit: "contain", background: "#fff" }} />}
                <div>
                  <p style={{ fontWeight: 700, fontSize: 14, color: "var(--c-text)", marginBottom: 4 }}>{product.name}</p>
                  <p style={{ fontSize: 12, color: "var(--c-sub)" }}>per 100g: {product.kcalPer100g} kcal</p>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 11, color: "var(--c-sub)", marginBottom: 6 }}>Serving size (g)</p>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input type="number" value={serving} onChange={e => setServing(Math.max(1, +e.target.value))} min="1"
                    style={{ width: 80, padding: "8px 12px", borderRadius: 12, background: "var(--c-input, var(--c-card))", border: "1px solid var(--c-border-bright)", color: "var(--c-text)", fontSize: 14, textAlign: "center", outline: "none" }}
                  />
                  <span style={{ fontSize: 12, color: "var(--c-sub)" }}>g = {Math.round(product.kcalPer100g * factor)} kcal</span>
                </div>
              </div>

              <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                {[["P", product.proteinPer100g], ["C", product.carbsPer100g], ["F", product.fatPer100g]].map(([l, v]) => (
                  <div key={l} style={{ textAlign: "center" }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "var(--c-text)" }}>{Math.round(v * factor)}g</p>
                    <p style={{ fontSize: 10, color: "var(--c-sub)" }}>{l === "P" ? "Protein" : l === "C" ? "Carbs" : "Fat"}</p>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <motion.button {...pressable} onClick={() => { setProduct(null); setStarted(false); }}
                  style={{ flex: 1, padding: "10px 0", borderRadius: 14, border: "1px solid var(--c-border)", background: "transparent", color: "var(--c-text)", fontWeight: 500, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <RefreshCw size={13} /> Scan again
                </motion.button>
                <motion.button {...pressablePrimary} onClick={handleLog}
                  style={{ flex: 2, padding: "10px 0", borderRadius: 14, background: "var(--c-accent)", color: "#fff", fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <Plus size={14} /> Log this
                </motion.button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
