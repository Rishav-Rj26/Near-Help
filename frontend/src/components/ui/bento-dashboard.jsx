import React, { useState } from "react";
import { cn } from "../../lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// =========================================
// 1. BRUTALIST BAR CHART
// =========================================
const BAR_DATA = [
  { label: "MON", value: 40, color: "bg-red-400" },
  { label: "TUE", value: 60, color: "bg-blue-400" },
  { label: "WED", value: 25, color: "bg-green-400" },
  { label: "THU", value: 80, color: "bg-yellow-400" },
  { label: "FRI", value: 65, color: "bg-purple-400" },
];

export const BrutalistBarChart = () => {
  const [hovered, setHovered] = useState(null);

  return (
    <div className="w-full h-full bg-zinc-900 border-[3px] border-white shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] relative flex flex-col p-6 transition-colors duration-200">
      <h3 className="font-black uppercase text-xl mb-6 border-b-[3px] border-white pb-2 text-white">
        Weekly Traffic
      </h3>
      <div className="flex justify-between items-end flex-1 gap-2 sm:gap-4 min-h-[150px]">
        {BAR_DATA.map((item, i) => (
          <div key={i} className="relative flex-1 h-full flex items-end group">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${item.value}%` }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 20,
                delay: i * 0.1,
              }}
              onHoverStart={() => setHovered(i)}
              onHoverEnd={() => setHovered(null)}
              className={cn(
                "w-full border-[3px] border-white relative z-10 cursor-pointer origin-bottom flex items-center justify-center overflow-hidden",
                item.color
              )}
              whileHover={{ scaleY: 1.1, scaleX: 1.05 }}
              whileTap={{ scaleY: 0.95 }}
            >
              <div
                className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:4px_4px]"
              />
              <span className="relative z-20 font-bold text-xs font-mono text-black/80 group-hover:text-black transition-colors">
                {item.label}
              </span>
            </motion.div>
            <AnimatePresence>
              {hovered === i && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute bottom-full -mb-2 left-1/2 -translate-x-1/2 bg-white text-black px-3 py-1 text-sm font-black whitespace-nowrap border-[3px] border-white z-30 pointer-events-none"
                >
                  {item.value}%
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// 2. BRUTALIST RADAR CHART
// ==========================================
const RADAR_DATA = [
  { label: "SPEED", value: 85, color: "#f87171" },
  { label: "UPTIME", value: 95, color: "#4ade80" },
  { label: "SECURE", value: 75, color: "#60a5fa" },
  { label: "UX", value: 65, color: "#fbbf24" },
  { label: "SEO", value: 80, color: "#a78bfa" },
];

const NUM_AXES = RADAR_DATA.length;
const RADAR_SIZE = 200;
const CENTER = RADAR_SIZE / 2;
const RADIUS = 80;

const angleToRad = (angle) => (Math.PI / 180) * angle;
const getCoords = (value, index) => {
  const angle = angleToRad((360 / NUM_AXES) * index - 90);
  const r = (value / 100) * RADIUS;
  return {
    x: CENTER + r * Math.cos(angle),
    y: CENTER + r * Math.sin(angle),
  };
};

export const BrutalistRadarChart = () => {
  const [hoveredMetric, setHoveredMetric] = useState(null);

  const pathData =
    RADAR_DATA.map((d, i) => {
      const coords = getCoords(d.value, i);
      return `${i === 0 ? "M" : "L"} ${coords.x} ${coords.y}`;
    }).join(" ") + " Z";

  const gridLevels = [100, 75, 50, 25];

  return (
    <div className="w-full h-full bg-zinc-900 border-[3px] border-white shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] p-6 flex flex-col sm:flex-row gap-6 relative overflow-hidden transition-colors duration-200">
      {/* LEFT: CHART AREA */}
      <div className="flex-1 flex items-center justify-center relative min-h-[250px]">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
          <span className="text-8xl font-black uppercase text-white">
            STATS
          </span>
        </div>

        <svg
          viewBox={`0 0 ${RADAR_SIZE} ${RADAR_SIZE}`}
          className="w-full h-full max-w-[200px] overflow-visible"
        >
          {gridLevels.map((level, lvlIdx) => (
            <path
              key={lvlIdx}
              d={
                RADAR_DATA.map((_, i) => {
                  const c = getCoords(level, i);
                  return `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`;
                }).join(" ") + " Z"
              }
              fill="none"
              className="stroke-white/10"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
          ))}

          {RADAR_DATA.map((_, i) => {
            const outer = getCoords(100, i);
            return (
              <line
                key={i}
                x1={CENTER}
                y1={CENTER}
                x2={outer.x}
                y2={outer.y}
                className="stroke-white/10"
                strokeWidth="2"
              />
            );
          })}

          <motion.path
            d={pathData}
            fill="rgba(167, 139, 250, 0.5)"
            className="stroke-white"
            strokeWidth="4"
            strokeLinejoin="round"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 20,
              delay: 0.2,
            }}
            style={{ originX: "50%", originY: "50%" }}
          />

          {RADAR_DATA.map((d, i) => {
            const coords = getCoords(d.value, i);
            const isHovered = hoveredMetric === d.label;

            return (
              <g
                key={i}
                onMouseEnter={() => setHoveredMetric(d.label)}
                onMouseLeave={() => setHoveredMetric(null)}
                className="cursor-pointer"
              >
                <circle cx={coords.x} cy={coords.y} r="20" fill="transparent" />
                <motion.circle
                  cx={coords.x}
                  cy={coords.y}
                  r="6"
                  className="fill-zinc-900 stroke-white"
                  strokeWidth="3"
                  animate={{
                    scale: isHovered ? 2 : 1,
                    strokeWidth: isHovered ? 4 : 3,
                    fill: isHovered ? d.color : "var(--dot-bg, white)",
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* RIGHT: STATS LIST */}
      <div className="w-full sm:w-40 flex flex-col justify-center gap-2 z-10">
        <h3 className="font-black uppercase text-xl mb-2 border-b-[3px] border-white pb-2 text-white">
          System Health
        </h3>
        {RADAR_DATA.map((item, i) => (
          <motion.div
            key={i}
            onMouseEnter={() => setHoveredMetric(item.label)}
            onMouseLeave={() => setHoveredMetric(null)}
            className="flex items-center justify-between p-2 border-2 border-transparent hover:border-white hover:bg-zinc-800 cursor-pointer transition-colors"
            animate={{
              x: hoveredMetric === item.label ? 10 : 0,
            }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 border-2 border-white"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs font-bold font-mono text-zinc-200">
                {item.label}
              </span>
            </div>
            <span className="font-black text-sm text-white">
              {item.value}%
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
