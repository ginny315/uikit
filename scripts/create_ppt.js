const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");

// ─── Icon Rendering ────────────────────────────────────────────────
const {
  FaServer, FaRobot, FaChartLine, FaShieldAlt, FaDollarSign,
  FaUserFriends, FaBuilding, FaCode, FaLayerGroup, FaExchangeAlt,
  FaSearch, FaCogs, FaClock, FaChartBar, FaCheckCircle, FaRocket,
  FaArrowRight, FaUsers, FaUser, FaPlug, FaListUl, FaChartPie,
  FaSyncAlt, FaNetworkWired, FaDatabase, FaCloud, FaLock,
  FaExclamationTriangle, FaLightbulb, FaCubes, FaTools
} = require("react-icons/fa");

function renderIconSvg(IconComponent, color = "#000000", size = 256) {
  return ReactDOMServer.renderToStaticMarkup(
    React.createElement(IconComponent, { color, size: String(size) })
  );
}

async function iconToBase64Png(IconComponent, color, size = 256) {
  const svg = renderIconSvg(IconComponent, color, size);
  const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + pngBuffer.toString("base64");
}

// ─── Color Palette ─────────────────────────────────────────────────
const C = {
  bg:       "080C1A",
  bgCard:   "0F1535",
  bgCard2:  "141C42",
  border:   "1A2555",
  cyan:     "00C8FF",
  purple:   "7B5CFF",
  green:    "00E676",
  red:      "FF5252",
  orange:   "FFAB40",
  white:    "FFFFFF",
  textMuted:"8892B0",
  textDim:  "545E7A",
  blueDark: "0D1B3E",
};

// Factory functions to avoid object reuse pitfall
const mkShadow = () => ({ type: "outer", color: "000000", blur: 12, offset: 4, angle: 135, opacity: 0.3 });
const mkShadowSm = () => ({ type: "outer", color: "000000", blur: 6, offset: 2, angle: 135, opacity: 0.2 });
const mkShadowGlow = () => ({ type: "outer", color: C.cyan, blur: 14, offset: 0, angle: 0, opacity: 0.25 });

// ─── Preset ────────────────────────────────────────────────────────
let pres = new pptxgen();
pres.layout = "LAYOUT_16x9"; // 10" x 5.625"
pres.author = "AgentSys Team";
pres.title = "AgentSys — LLM Agent Management Platform";

// ─── Reusable Helpers ──────────────────────────────────────────────
function fullBg(slide, color = C.bg) {
  slide.background = { color };
}

function addSectionTitle(slide, text, y = 0.3) {
  slide.addText(text, {
    x: 0.6, y, w: 8.8, h: 0.55,
    fontSize: 28, fontFace: "Arial", bold: true,
    color: C.white, margin: 0,
  });
  // Subtle glow bar under title
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.6, y: y + 0.58, w: 1.2, h: 0.04,
    fill: { color: C.cyan },
    shadow: { type: "outer", color: C.cyan, blur: 8, offset: 0, angle: 0, opacity: 0.6 },
  });
}

function addPageNumber(slide, num) {
  slide.addText(String(num), {
    x: 9.2, y: 5.15, w: 0.5, h: 0.3,
    fontSize: 9, color: C.textDim, align: "right", margin: 0,
  });
}

function addCard(slide, x, y, w, h, iconData, title, desc, accentColor = C.cyan) {
  // Card bg
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h,
    fill: { color: C.bgCard },
    shadow: mkShadowSm(),
  });
  // Top accent line
  slide.addShape(pres.shapes.RECTANGLE, {
    x: x + 0.15, y: y + 0.08, w: 0.06, h: h - 0.16,
    fill: { color: accentColor },
    shadow: { type: "outer", color: accentColor, blur: 5, offset: 0, angle: 0, opacity: 0.4 },
  });
  // Icon
  slide.addImage({ data: iconData, x: x + 0.35, y: y + 0.18, w: 0.38, h: 0.38 });
  // Title
  slide.addText(title, {
    x: x + 0.85, y: y + 0.18, w: w - 1.1, h: 0.32,
    fontSize: 14, fontFace: "Arial", bold: true, color: C.white, margin: 0,
  });
  // Description
  slide.addText(desc, {
    x: x + 0.85, y: y + 0.5, w: w - 1.15, h: h - 0.7,
    fontSize: 10, fontFace: "Arial", color: C.textMuted, margin: 0, valign: "top",
  });
}

// ─── Pre-render all icons ──────────────────────────────────────────
async function prerenderIcons() {
  const icons = {};
  const pairs = [
    ["robot", FaRobot, C.cyan],
    ["server", FaServer, C.purple],
    ["chartLine", FaChartLine, C.green],
    ["shield", FaShieldAlt, C.cyan],
    ["dollar", FaDollarSign, C.green],
    ["userFriends", FaUserFriends, C.cyan],
    ["building", FaBuilding, C.purple],
    ["code", FaCode, C.green],
    ["layerGroup", FaLayerGroup, C.cyan],
    ["exchange", FaExchangeAlt, C.purple],
    ["search", FaSearch, C.cyan],
    ["cogs", FaCogs, C.purple],
    ["clock", FaClock, C.orange],
    ["chartBar", FaChartBar, C.green],
    ["checkCircle", FaCheckCircle, C.green],
    ["rocket", FaRocket, C.cyan],
    ["arrowRight", FaArrowRight, C.purple],
    ["users", FaUsers, C.cyan],
    ["user", FaUser, C.purple],
    ["plug", FaPlug, C.cyan],
    ["listUl", FaListUl, C.cyan],
    ["chartPie", FaChartPie, C.purple],
    ["syncAlt", FaSyncAlt, C.cyan],
    ["networkWired", FaNetworkWired, C.cyan],
    ["database", FaDatabase, C.purple],
    ["cloud", FaCloud, C.cyan],
    ["lock", FaLock, C.green],
    ["exclamation", FaExclamationTriangle, C.orange],
    ["lightbulb", FaLightbulb, C.orange],
    ["cubes", FaCubes, C.cyan],
    ["tools", FaTools, C.purple],
    ["lightbulbCyan", FaLightbulb, C.cyan], // cyan version for slide 2
  ];

  for (const [name, component, color] of pairs) {
    const hexColor = "#" + color;
    icons[name] = await iconToBase64Png(component, hexColor, 256);
  }
  // White versions
  icons.robotWhite = await iconToBase64Png(FaRobot, "#FFFFFF", 256);
  icons.checkWhite = await iconToBase64Png(FaCheckCircle, "#FFFFFF", 256);
  icons.rocketWhite = await iconToBase64Png(FaRocket, "#FFFFFF", 256);

  return icons;
}

// ─── Build Slides ──────────────────────────────────────────────────
async function buildAllSlides() {
  const I = await prerenderIcons();

  // ════════════════════════════════════════════════════════════════
  // SLIDE 1: TITLE
  // ════════════════════════════════════════════════════════════════
  {
    const slide = pres.addSlide();
    fullBg(slide, "060A18");

    // Decorative grid pattern - thin lines
    for (let i = 0; i < 11; i++) {
      slide.addShape(pres.shapes.LINE, {
        x: i * 1.0, y: 0, w: 0, h: 5.625,
        line: { color: "0F1530", width: 0.5 },
      });
    }
    for (let j = 0; j < 7; j++) {
      slide.addShape(pres.shapes.LINE, {
        x: 0, y: j * 1.0, w: 10, h: 0,
        line: { color: "0F1530", width: 0.5 },
      });
    }

    // Glow orbs
    [
      { x: 1.5, y: 1.2, c: C.purple, s: 0.5 },
      { x: 8.0, y: 3.8, c: C.cyan, s: 0.6 },
      { x: 3.0, y: 4.5, c: C.cyan, s: 0.3 },
    ].forEach(o => {
      slide.addShape(pres.shapes.OVAL, {
        x: o.x, y: o.y, w: o.s, h: o.s,
        fill: { color: o.c, transparency: 80 },
        shadow: { type: "outer", color: o.c, blur: 30, offset: 0, angle: 0, opacity: 0.5 },
      });
    });

    // Logo area
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 3.2, y: 0.8, w: 3.6, h: 0.65,
      fill: { color: "0D1B3E", transparency: 30 },
    });
    slide.addText("⚡  AGENTSYS", {
      x: 3.2, y: 0.8, w: 3.6, h: 0.65,
      fontSize: 24, fontFace: "Arial", bold: true,
      color: C.cyan, align: "center", valign: "middle", margin: 0,
    });

    // Main title
    slide.addText("Kubernetes for\nLLM Agents", {
      x: 1.0, y: 1.7, w: 8.0, h: 1.6,
      fontSize: 40, fontFace: "Arial", bold: true,
      color: C.white, align: "center", valign: "middle", margin: 0,
    });

    // Subtitle
    slide.addText("Orchestrate, monitor, and govern fleets of AI agents — all in one platform.", {
      x: 1.5, y: 3.3, w: 7.0, h: 0.6,
      fontSize: 14, fontFace: "Arial", color: C.textMuted,
      align: "center", margin: 0,
    });

    // Bottom meta line
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 3.0, y: 4.15, w: 4.0, h: 0.01,
      fill: { color: C.border },
    });
    slide.addText("Open Source  ·  Pre-Release  ·  July 2026", {
      x: 1.5, y: 4.3, w: 7.0, h: 0.4,
      fontSize: 11, fontFace: "Arial", color: C.textDim,
      align: "center", margin: 0,
    });
  }

  // ════════════════════════════════════════════════════════════════
  // SLIDE 2: THE PROBLEM
  // ════════════════════════════════════════════════════════════════
  {
    const slide = pres.addSlide();
    fullBg(slide);
    addSectionTitle(slide, "The Agent Management Crisis");
    addPageNumber(slide, 2);

    const cards = [
      { icon: I.cubes, title: "Agent Sprawl", desc: "Dozens of agents scattered across codebases and servers. No central visibility into what's running, versions, or configurations.", color: C.cyan },
      { icon: I.dollar, title: "Cost Black Hole", desc: "LLM call costs are invisible. You don't know which agent or user is burning the most tokens until the monthly bill arrives.", color: C.green },
      { icon: I.exchange, title: "Collaboration Gap", desc: "Agents must work together, but data handoffs are manual copy-paste. One failure breaks the entire chain.", color: C.purple },
      { icon: I.search, title: "Debugging Blind", desc: "Scattered logs, missing execution traces, and no visibility into token usage — troubleshooting is guesswork.", color: C.orange },
    ];

    cards.forEach((c, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 0.5 + col * 4.65;
      const y = 1.3 + row * 2.0;
      addCard(slide, x, y, 4.35, 1.75, c.icon, c.title, c.desc, c.color);
    });
  }

  // ════════════════════════════════════════════════════════════════
  // SLIDE 3: MARKET OPPORTUNITY
  // ════════════════════════════════════════════════════════════════
  {
    const slide = pres.addSlide();
    fullBg(slide);
    addSectionTitle(slide, "Why Now? The Market Window");
    addPageNumber(slide, 3);

    // Left side: 4 trend items
    const trends = [
      { icon: I.chartLine, title: "LLM Adoption Exploding", desc: "Teams worldwide are building AI-powered applications at unprecedented speed." },
      { icon: I.robot, title: "Single Agent → Multi-Agent", desc: "The paradigm is shifting from single LLM calls to coordinated agent swarms." },
      { icon: I.dollar, title: "Cost Pressure Rising", desc: "Token costs demand fine-grained tracking — teams need to justify every dollar." },
      { icon: I.cogs, title: "Engineering Gap", desc: "Agent projects move from experiment to production with no proper DevOps tooling." },
    ];

    trends.forEach((t, i) => {
      const y = 1.3 + i * 1.05;
      // Icon circle
      slide.addShape(pres.shapes.OVAL, {
        x: 0.6, y: y + 0.05, w: 0.42, h: 0.42,
        fill: { color: C.bgCard2 },
      });
      slide.addImage({ data: t.icon, x: 0.68, y: y + 0.12, w: 0.26, h: 0.26 });
      slide.addText(t.title, {
        x: 1.2, y, w: 4.2, h: 0.3,
        fontSize: 13, fontFace: "Arial", bold: true, color: C.white, margin: 0,
      });
      slide.addText(t.desc, {
        x: 1.2, y: y + 0.32, w: 4.2, h: 0.55,
        fontSize: 10, fontFace: "Arial", color: C.textMuted, margin: 0,
      });
      // Connector line
      if (i < 3) {
        slide.addShape(pres.shapes.RECTANGLE, {
          x: 0.8, y: y + 0.52, w: 0.01, h: 0.48,
          fill: { color: C.border },
        });
      }
    });

    // Right side: big stat + conclusion
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 5.6, y: 1.3, w: 3.9, h: 3.85,
      fill: { color: C.bgCard },
      shadow: mkShadowSm(),
    });
    // Big stat
    slide.addText("0", {
      x: 5.6, y: 1.6, w: 3.9, h: 0.8,
      fontSize: 54, fontFace: "Arial", bold: true,
      color: C.cyan, align: "center", valign: "middle", margin: 0,
    });
    slide.addText("mature open-source solutions\nexist for Agent management", {
      x: 5.9, y: 2.35, w: 3.3, h: 0.7,
      fontSize: 12, fontFace: "Arial", color: C.textMuted,
      align: "center", margin: 0,
    });

    slide.addShape(pres.shapes.RECTANGLE, {
      x: 6.5, y: 3.2, w: 2.0, h: 0.01,
      fill: { color: C.border },
    });

    slide.addText("The Gap Is Real", {
      x: 5.6, y: 3.35, w: 3.9, h: 0.4,
      fontSize: 18, fontFace: "Arial", bold: true,
      color: C.white, align: "center", margin: 0,
    });
    slide.addText("No existing platform combines agent orchestration,\ncost management, and production observability\ninto a single open-source solution.", {
      x: 5.9, y: 3.8, w: 3.3, h: 0.9,
      fontSize: 10.5, fontFace: "Arial", color: C.textMuted,
      align: "center", margin: 0,
    });
  }

  // ════════════════════════════════════════════════════════════════
  // SLIDE 4: PRODUCT VISION
  // ════════════════════════════════════════════════════════════════
  {
    const slide = pres.addSlide();
    fullBg(slide);
    addSectionTitle(slide, "Product Vision");
    addPageNumber(slide, 4);

    // Center quote
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 1.0, y: 1.2, w: 8.0, h: 1.4,
      fill: { color: C.bgCard },
      shadow: mkShadowSm(),
    });
    slide.addText("\"Make LLM Agent development, deployment,\nand management simple, reliable, and scalable.\"", {
      x: 1.5, y: 1.3, w: 7.0, h: 1.0,
      fontSize: 20, fontFace: "Arial", bold: true,
      color: C.white, align: "center", valign: "middle", margin: 0,
    });
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 1.3, y: 1.65, w: 0.05, h: 0.5,
      fill: { color: C.cyan },
      shadow: { type: "outer", color: C.cyan, blur: 6, offset: 0, angle: 0, opacity: 0.4 },
    });

    // 5 value props columns
    const values = [
      { icon: I.server, title: "Unified\nManagement", desc: "One place for\nall your agents", color: C.cyan },
      { icon: I.networkWired, title: "Workflow\nOrchestration", desc: "Compose agents\nlike building blocks", color: C.purple },
      { icon: I.chartBar, title: "Full\nObservability", desc: "Real-time monitoring\n& structured logs", color: C.green },
      { icon: I.dollar, title: "Cost\nControl", desc: "Track every token,\nset quotas & alerts", color: C.orange },
      { icon: I.lock, title: "Team\nGovernance", desc: "RBAC, audit logs,\nAPI key management", color: C.cyan },
    ];

    const cardW = 1.58;
    const gap = 0.18;
    const startX = 0.5;
    values.forEach((v, i) => {
      const x = startX + i * (cardW + gap);
      const y = 3.0;
      // Card
      slide.addShape(pres.shapes.RECTANGLE, {
        x, y, w: cardW, h: 2.15,
        fill: { color: C.bgCard },
        shadow: mkShadowSm(),
      });
      // Top accent
      slide.addShape(pres.shapes.RECTANGLE, {
        x, y, w: cardW, h: 0.04,
        fill: { color: v.color },
      });
      // Icon in circle
      slide.addShape(pres.shapes.OVAL, {
        x: x + (cardW - 0.5) / 2, y: y + 0.25, w: 0.5, h: 0.5,
        fill: { color: C.bgCard2 },
      });
      slide.addImage({
        data: v.icon,
        x: x + (cardW - 0.28) / 2, y: y + 0.36, w: 0.28, h: 0.28,
      });
      // Title
      slide.addText(v.title, {
        x: x + 0.1, y: y + 0.9, w: cardW - 0.2, h: 0.6,
        fontSize: 11.5, fontFace: "Arial", bold: true,
        color: C.white, align: "center", valign: "middle", margin: 0,
      });
      // Desc
      slide.addText(v.desc, {
        x: x + 0.1, y: y + 1.5, w: cardW - 0.2, h: 0.5,
        fontSize: 9, fontFace: "Arial", color: C.textMuted,
        align: "center", margin: 0,
      });
    });
  }

  // ════════════════════════════════════════════════════════════════
  // SLIDE 5: TARGET USERS
  // ════════════════════════════════════════════════════════════════
  {
    const slide = pres.addSlide();
    fullBg(slide);
    addSectionTitle(slide, "Target Users");
    addPageNumber(slide, 5);

    const personas = [
      {
        icon: I.user, emoji: "👤",
        title: "Individual Devs\n& Small Teams",
        desc: "Independent developers and startups who need a low-cost, quick-start solution. They want to go from zero to running agent in minutes.",
        priority: "Phase 1 Target",
        color: C.cyan,
      },
      {
        icon: I.users, emoji: "👥",
        title: "Dev Teams\n(5–50 people)",
        desc: "Internal software teams needing standardized management. Multi-user collaboration, version control, audit trails, and shared dashboards.",
        priority: "Phase 2 Target",
        color: C.purple,
      },
      {
        icon: I.building, emoji: "🏢",
        title: "Enterprise\nOrganizations",
        desc: "Large enterprises with compliance requirements. Private deployment, SSO integration, SLA guarantees, fine-grained RBAC, and multi-tenancy.",
        priority: "Phase 3 Target",
        color: C.green,
      },
    ];

    personas.forEach((p, i) => {
      const x = 0.5 + i * 3.1;
      const y = 1.3;
      const w = 2.85;
      // Card
      slide.addShape(pres.shapes.RECTANGLE, {
        x, y, w, h: 3.85,
        fill: { color: C.bgCard },
        shadow: mkShadowSm(),
      });
      // Icon area
      slide.addShape(pres.shapes.OVAL, {
        x: x + (w - 0.6) / 2, y: y + 0.2, w: 0.6, h: 0.6,
        fill: { color: C.bgCard2 },
      });
      slide.addImage({
        data: p.icon,
        x: x + (w - 0.32) / 2, y: y + 0.34, w: 0.32, h: 0.32,
      });
      // Title
      slide.addText(p.title, {
        x: x + 0.2, y: y + 0.95, w: w - 0.4, h: 0.65,
        fontSize: 13, fontFace: "Arial", bold: true,
        color: C.white, align: "center", valign: "middle", margin: 0,
      });
      // Desc
      slide.addText(p.desc, {
        x: x + 0.2, y: y + 1.7, w: w - 0.4, h: 1.3,
        fontSize: 10, fontFace: "Arial", color: C.textMuted,
        align: "center", valign: "top", margin: 0,
      });
      // Priority badge
      slide.addShape(pres.shapes.RECTANGLE, {
        x: x + 0.5, y: y + 3.25, w: w - 1.0, h: 0.35,
        fill: { color: "1A2555" },
      });
      slide.addText(p.priority, {
        x: x + 0.5, y: y + 3.25, w: w - 1.0, h: 0.35,
        fontSize: 10, fontFace: "Arial", bold: true,
        color: p.color, align: "center", valign: "middle", margin: 0,
      });
    });
  }

  // ════════════════════════════════════════════════════════════════
  // SLIDE 6: CORE FEATURES (P0)
  // ════════════════════════════════════════════════════════════════
  {
    const slide = pres.addSlide();
    fullBg(slide);
    addSectionTitle(slide, "Core Features — MVP (P0)");
    addPageNumber(slide, 6);

    const features = [
      {
        icon: I.cubes, title: "Agent Management",
        items: ["Create/edit/delete via form or YAML", "Start, stop, pause agent instances", "Version control with rollback", "Capability tagging for discovery"],
        color: C.cyan,
      },
      {
        icon: I.listUl, title: "Task Scheduling",
        items: ["Submit tasks via API or Web UI", "Priority queues (urgent→low)", "Fair scheduling with starvation prevention", "Retry with exponential backoff"],
        color: C.purple,
      },
      {
        icon: I.chartPie, title: "Monitoring Dashboard",
        items: ["Real-time agent & task status", "Token consumption tracking", "Queue length by priority", "Success rate & latency metrics"],
        color: C.green,
      },
      {
        icon: I.search, title: "Logging & Tracing",
        items: ["Structured task execution logs", "Execution timeline visualization", "Per-step token usage breakdown", "Searchable, filterable log viewer"],
        color: C.orange,
      },
    ];

    features.forEach((f, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 0.5 + col * 4.65;
      const y = 1.2 + row * 2.1;
      const w = 4.35;
      const h = 1.9;

      // Card
      slide.addShape(pres.shapes.RECTANGLE, {
        x, y, w, h,
        fill: { color: C.bgCard },
        shadow: mkShadowSm(),
      });
      // Left accent bar
      slide.addShape(pres.shapes.RECTANGLE, {
        x, y, w: 0.06, h,
        fill: { color: f.color },
      });
      // Icon + title
      slide.addImage({ data: f.icon, x: x + 0.25, y: y + 0.15, w: 0.32, h: 0.32 });
      slide.addText(f.title, {
        x: x + 0.68, y: y + 0.13, w: w - 0.9, h: 0.35,
        fontSize: 16, fontFace: "Arial", bold: true, color: C.white, margin: 0,
      });
      // Feature list
      slide.addText(
        f.items.map((item, idx) => ({
          text: item,
          options: { bullet: true, breakLine: idx < f.items.length - 1, color: C.textMuted, fontSize: 10.5 },
        })),
        { x: x + 0.3, y: y + 0.55, w: w - 0.6, h: 1.2, valign: "top", margin: 0, fontFace: "Arial" }
      );
    });
  }

  // ════════════════════════════════════════════════════════════════
  // SLIDE 7: KEY FEATURES (P1)
  // ════════════════════════════════════════════════════════════════
  {
    const slide = pres.addSlide();
    fullBg(slide);
    addSectionTitle(slide, "Key Features — Team Scale (P1)");
    addPageNumber(slide, 7);

    const features = [
      {
        icon: I.exchange, title: "Workflow Orchestration",
        desc: "Visual drag-and-drop editor to chain multiple agents into pipelines. Support for parallel execution, conditional branching, and data passing between steps.",
        color: C.cyan,
      },
      {
        icon: I.dollar, title: "Cost Management",
        desc: "Track token usage by agent, user, and time period. Set quotas and budget alerts. Generate cost reports and forecast future spending based on historical data.",
        color: C.green,
      },
      {
        icon: I.lock, title: "Permissions & RBAC",
        desc: "Role-based access control with Admin, Operator, User, and Viewer roles. API key management, audit logging of all sensitive operations, and session management.",
        color: C.purple,
      },
      {
        icon: I.plug, title: "Webhooks & Integrations",
        desc: "Trigger external systems on task completion. Subscribe to system events. Native integrations with Slack, DingTalk, and GitHub for PR-triggered agent runs.",
        color: C.orange,
      },
    ];

    features.forEach((f, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 0.5 + col * 4.65;
      const y = 1.2 + row * 2.1;
      const w = 4.35;
      const h = 1.9;

      slide.addShape(pres.shapes.RECTANGLE, {
        x, y, w, h,
        fill: { color: C.bgCard },
        shadow: mkShadowSm(),
      });
      // Top accent
      slide.addShape(pres.shapes.RECTANGLE, {
        x, y, w, h: 0.035,
        fill: { color: f.color },
      });
      // Icon circle
      slide.addShape(pres.shapes.OVAL, {
        x: x + 0.25, y: y + 0.2, w: 0.4, h: 0.4,
        fill: { color: C.bgCard2 },
      });
      slide.addImage({ data: f.icon, x: x + 0.33, y: y + 0.27, w: 0.24, h: 0.24 });
      // Title
      slide.addText(f.title, {
        x: x + 0.78, y: y + 0.2, w: w - 1.0, h: 0.35,
        fontSize: 15, fontFace: "Arial", bold: true, color: C.white, margin: 0,
      });
      // Description
      slide.addText(f.desc, {
        x: x + 0.25, y: y + 0.7, w: w - 0.5, h: 1.05,
        fontSize: 10.5, fontFace: "Arial", color: C.textMuted, margin: 0, valign: "top",
      });
    });
  }

  // ════════════════════════════════════════════════════════════════
  // SLIDE 8: USER JOURNEY — AGENT CREATION
  // ════════════════════════════════════════════════════════════════
  {
    const slide = pres.addSlide();
    fullBg(slide);
    addSectionTitle(slide, "User Journey: Create & Deploy an Agent");
    addPageNumber(slide, 8);

    const steps = [
      { num: "01", title: "Define Agent", desc: "Name it, choose LLM\n(Claude/GPT), configure\ntools & resource limits" },
      { num: "02", title: "Set Quota", desc: "Daily token cap,\nmax concurrency,\ntimeout settings" },
      { num: "03", title: "Deploy & Test", desc: "One-click start,\nsubmit a test task,\nsee real-time status" },
      { num: "04", title: "Monitor", desc: "Track token usage,\nsuccess rate, and\nlatency on dashboard" },
    ];

    steps.forEach((s, i) => {
      const x = 0.5 + i * 2.35;
      const y = 1.3;
      // Card
      slide.addShape(pres.shapes.RECTANGLE, {
        x, y, w: 2.1, h: 2.5,
        fill: { color: C.bgCard },
        shadow: mkShadowSm(),
      });
      // Number
      slide.addText(s.num, {
        x: x + 0.15, y: y + 0.12, w: 1.0, h: 0.5,
        fontSize: 28, fontFace: "Arial", bold: true,
        color: C.cyan, margin: 0,
      });
      // Title
      slide.addText(s.title, {
        x: x + 0.15, y: y + 0.65, w: 1.8, h: 0.35,
        fontSize: 14, fontFace: "Arial", bold: true,
        color: C.white, margin: 0,
      });
      // Separator
      slide.addShape(pres.shapes.RECTANGLE, {
        x: x + 0.15, y: y + 1.05, w: 0.4, h: 0.02,
        fill: { color: C.purple },
      });
      // Desc
      slide.addText(s.desc, {
        x: x + 0.15, y: y + 1.2, w: 1.8, h: 1.1,
        fontSize: 11, fontFace: "Arial", color: C.textMuted, margin: 0, valign: "top",
      });
      // Arrow between cards
      if (i < 3) {
        slide.addImage({
          data: I.arrowRight,
          x: x + 2.1 + 0.02, y: y + 1.0, w: 0.22, h: 0.22,
        });
      }
    });

    // Key metric at bottom
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0.5, y: 4.1, w: 9.0, h: 1.0,
      fill: { color: C.bgCard },
      shadow: mkShadowSm(),
    });
    const metrics = [
      { val: "< 5 min", label: "Time to first\ndeployment" },
      { val: "3 clicks", label: "To submit\na test task" },
      { val: "Real-time", label: "Status & token\nconsumption" },
    ];
    metrics.forEach((m, i) => {
      const mx = 0.8 + i * 3.1;
      slide.addText(m.val, {
        x: mx, y: 4.18, w: 2.6, h: 0.38,
        fontSize: 20, fontFace: "Arial", bold: true,
        color: C.cyan, align: "center", valign: "middle", margin: 0,
      });
      slide.addText(m.label, {
        x: mx, y: 4.55, w: 2.6, h: 0.45,
        fontSize: 10, fontFace: "Arial", color: C.textMuted,
        align: "center", valign: "top", margin: 0,
      });
    });
  }

  // ════════════════════════════════════════════════════════════════
  // SLIDE 9: USER JOURNEY — WORKFLOW ORCHESTRATION
  // ════════════════════════════════════════════════════════════════
  {
    const slide = pres.addSlide();
    fullBg(slide);
    addSectionTitle(slide, "User Journey: Multi-Agent Workflow");
    addPageNumber(slide, 9);

    // Flow diagram at the top
    const flowSteps = [
      { label: "Pull Request\nOpened", color: C.green },
      { label: "Fetch\nChanges", color: C.cyan },
      { label: "Security\nScan", color: C.purple },
      { label: "Code Style\nCheck", color: C.orange },
      { label: "Generate\nReport", color: C.cyan },
    ];

    const flowY = 1.3;
    const flowH = 1.3;
    const boxW = 1.45;
    const totalFlowW = flowSteps.length * boxW + (flowSteps.length - 1) * 0.3;
    const flowStartX = (10 - totalFlowW) / 2;

    flowSteps.forEach((s, i) => {
      const fx = flowStartX + i * (boxW + 0.3);
      // Box
      slide.addShape(pres.shapes.RECTANGLE, {
        x: fx, y: flowY, w: boxW, h: flowH,
        fill: { color: C.bgCard },
        shadow: mkShadowSm(),
      });
      // Top accent
      slide.addShape(pres.shapes.RECTANGLE, {
        x: fx, y: flowY, w: boxW, h: 0.04,
        fill: { color: s.color },
      });
      slide.addText(s.label, {
        x: fx + 0.1, y: flowY + 0.15, w: boxW - 0.2, h: flowH - 0.3,
        fontSize: 11, fontFace: "Arial", bold: true,
        color: C.white, align: "center", valign: "middle", margin: 0,
      });
      // Arrow
      if (i < flowSteps.length - 1) {
        slide.addImage({
          data: I.arrowRight,
          x: fx + boxW + 0.02, y: flowY + (flowH - 0.2) / 2, w: 0.26, h: 0.2,
        });
      }
    });

    // Feature cards below
    const cards2 = [
      { icon: I.code, title: "Visual Editor", desc: "Drag-and-drop interface to build\nagent pipelines — no code required.", color: C.cyan },
      { icon: I.syncAlt, title: "Parallel Execution", desc: "Run independent steps concurrently.\nDAG-based scheduling with topological sort.", color: C.purple },
      { icon: I.plug, title: "Auto Triggers", desc: "Webhook, schedule, or event-driven.\nPR opened → workflow auto-starts.", color: C.green },
      { icon: I.clock, title: "Failure Recovery", desc: "Per-step retry policies, dead-letter\nqueues, and partial workflow resume.", color: C.orange },
    ];

    cards2.forEach((c, i) => {
      const x = 0.5 + i * 2.35;
      const y = 2.95;
      const w = 2.1;
      const h = 2.25;

      slide.addShape(pres.shapes.RECTANGLE, {
        x, y, w, h,
        fill: { color: C.bgCard },
        shadow: mkShadowSm(),
      });
      slide.addShape(pres.shapes.RECTANGLE, {
        x, y, w, h: 0.035,
        fill: { color: c.color },
      });
      slide.addShape(pres.shapes.OVAL, {
        x: x + (w - 0.45) / 2, y: y + 0.2, w: 0.45, h: 0.45,
        fill: { color: C.bgCard2 },
      });
      slide.addImage({ data: c.icon, x: x + (w - 0.26) / 2, y: y + 0.3, w: 0.26, h: 0.26 });
      slide.addText(c.title, {
        x: x + 0.15, y: y + 0.8, w: w - 0.3, h: 0.3,
        fontSize: 13, fontFace: "Arial", bold: true,
        color: C.white, align: "center", margin: 0,
      });
      slide.addText(c.desc, {
        x: x + 0.15, y: y + 1.2, w: w - 0.3, h: 0.9,
        fontSize: 10, fontFace: "Arial", color: C.textMuted,
        align: "center", valign: "top", margin: 0,
      });
    });
  }

  // ════════════════════════════════════════════════════════════════
  // SLIDE 10: ARCHITECTURE OVERVIEW
  // ════════════════════════════════════════════════════════════════
  {
    const slide = pres.addSlide();
    fullBg(slide);
    addSectionTitle(slide, "System Architecture");
    addPageNumber(slide, 10);

    // Three layers
    const layers = [
      {
        title: "Access Layer",
        y: 1.2,
        services: ["API Gateway\n(Nginx/Kong)", "Web UI\n(React)", "CLI\n(Go)", "WebSocket\n(Push)"],
        color: C.green,
      },
      {
        title: "Service Layer — Go Microservices (gRPC)",
        y: 2.55,
        services: ["Control\nService", "Scheduler\nService", "AgentRun\nService", "Coordinator\nService", "Auth\nService", "Metrics\nService", "Log\nService", "Webhook\nService"],
        color: C.cyan,
      },
      {
        title: "Storage Layer",
        y: 3.9,
        services: ["PostgreSQL 16\n(Config / Users)", "Redis\n(Queue / State)", "ClickHouse\n(Logs / Analytics)"],
        color: C.purple,
      },
    ];

    layers.forEach((layer) => {
      const ly = layer.y;
      const lh = 1.15;
      // Layer background
      slide.addShape(pres.shapes.RECTANGLE, {
        x: 0.5, y: ly, w: 9.0, h: lh,
        fill: { color: C.bgCard },
        shadow: mkShadowSm(),
      });
      // Left accent
      slide.addShape(pres.shapes.RECTANGLE, {
        x: 0.5, y: ly, w: 0.06, h: lh,
        fill: { color: layer.color },
      });
      // Layer title
      slide.addText(layer.title, {
        x: 0.75, y: ly + 0.05, w: 2.2, h: 0.25,
        fontSize: 9, fontFace: "Arial", bold: true,
        color: layer.color, margin: 0,
      });
      // Service boxes
      const svcW = 1.85;
      const svcH = 0.55;
      const svcGap = 0.12;
      const svcStartX = 0.75;
      layer.services.forEach((svc, si) => {
        const sx = svcStartX + si * (svcW + svcGap);
        slide.addShape(pres.shapes.RECTANGLE, {
          x: sx, y: ly + 0.38, w: svcW, h: svcH,
          fill: { color: C.bgCard2 },
        });
        slide.addText(svc, {
          x: sx + 0.08, y: ly + 0.38, w: svcW - 0.16, h: svcH,
          fontSize: 9.5, fontFace: "Arial", bold: true,
          color: C.white, align: "center", valign: "middle", margin: 0,
        });
      });
      // Down arrows between layers
      if (layer !== layers[layers.length - 1]) {
        slide.addText("▼", {
          x: 4.5, y: ly + 1.15, w: 1.0, h: 0.2,
          fontSize: 12, color: C.textDim, align: "center", margin: 0,
        });
      }
    });
  }

  // ════════════════════════════════════════════════════════════════
  // SLIDE 11: TECH STACK
  // ════════════════════════════════════════════════════════════════
  {
    const slide = pres.addSlide();
    fullBg(slide);
    addSectionTitle(slide, "Technology Stack");
    addPageNumber(slide, 11);

    const stacks = [
      { category: "Backend", items: [
          { name: "Go", desc: "High-performance, great concurrency" },
          { name: "gRPC", desc: "Internal service communication" },
          { name: "Gin", desc: "REST API framework" },
        ], color: C.cyan },
      { category: "Frontend", items: [
          { name: "React", desc: "Component-based UI" },
          { name: "TypeScript", desc: "Type-safe development" },
          { name: "Tailwind + shadcn/ui", desc: "Utility-first styling" },
        ], color: C.purple },
      { category: "Data & Infra", items: [
          { name: "PostgreSQL 16", desc: "Config & user data" },
          { name: "Redis", desc: "Task queues & caching" },
          { name: "ClickHouse", desc: "Time-series analytics" },
        ], color: C.green },
      { category: "Observability", items: [
          { name: "Prometheus", desc: "Metrics collection" },
          { name: "Grafana", desc: "Dashboards & alerts" },
          { name: "OpenTelemetry", desc: "Distributed tracing → Jaeger" },
        ], color: C.orange },
      { category: "Deployment", items: [
          { name: "Docker Compose", desc: "MVP single-node" },
          { name: "Kubernetes", desc: "Production orchestration" },
          { name: "Nginx/Kong", desc: "API gateway & LB" },
        ], color: C.cyan },
      { category: "LLM Providers", items: [
          { name: "Anthropic Claude", desc: "Opus / Sonnet models" },
          { name: "OpenAI GPT", desc: "GPT-4o / o-series" },
          { name: "Ollama / vLLM", desc: "Local models (Phase 2)" },
        ], color: C.purple },
    ];

    stacks.forEach((stack, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = 0.5 + col * 3.1;
      const y = 1.2 + row * 2.15;
      const w = 2.85;
      const h = 1.95;

      // Card
      slide.addShape(pres.shapes.RECTANGLE, {
        x, y, w, h,
        fill: { color: C.bgCard },
        shadow: mkShadowSm(),
      });
      // Header
      slide.addShape(pres.shapes.RECTANGLE, {
        x, y, w, h: 0.36,
        fill: { color: stack.color, transparency: 60 },
      });
      slide.addText(stack.category, {
        x: x + 0.15, y, w: w - 0.3, h: 0.36,
        fontSize: 11, fontFace: "Arial", bold: true,
        color: C.white, valign: "middle", margin: 0,
      });
      // Tech items
      stack.items.forEach((item, si) => {
        const iy = y + 0.5 + si * 0.45;
        slide.addText(item.name, {
          x: x + 0.15, y: iy, w: w - 0.3, h: 0.2,
          fontSize: 11, fontFace: "Arial", bold: true,
          color: stack.color, margin: 0,
        });
        slide.addText(item.desc, {
          x: x + 0.15, y: iy + 0.18, w: w - 0.3, h: 0.2,
          fontSize: 8.5, fontFace: "Arial", color: C.textMuted, margin: 0,
        });
      });
    });
  }

  // ════════════════════════════════════════════════════════════════
  // SLIDE 12: ROADMAP
  // ════════════════════════════════════════════════════════════════
  {
    const slide = pres.addSlide();
    fullBg(slide);
    addSectionTitle(slide, "Development Roadmap");
    addPageNumber(slide, 12);

    const phases = [
      {
        phase: "Phase 1", title: "MVP", weeks: "4–6 weeks",
        items: ["Agent CRUD & lifecycle", "Task submission & scheduling", "Basic monitoring dashboard", "Task log viewer", "Single-node Docker deploy"],
        color: C.cyan,
      },
      {
        phase: "Phase 2", title: "Core Enhance", weeks: "4–6 weeks",
        items: ["Workflow orchestration", "Cost management & quotas", "RBAC & multi-user", "Webhook integrations", "Priority queue system"],
        color: C.purple,
      },
      {
        phase: "Phase 3", title: "Production", weeks: "4–6 weeks",
        items: ["High-availability deploy", "Full audit logging", "Performance optimization", "More LLM providers", "CLI tool release"],
        color: C.green,
      },
      {
        phase: "Phase 4", title: "Enterprise", weeks: "On Demand",
        items: ["Multi-tenancy", "Private deployment", "SSO integration", "Advanced analytics", "SLA guarantees"],
        color: C.orange,
      },
    ];

    // Timeline line
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0.8, y: 1.55, w: 8.4, h: 0.025,
      fill: { color: C.border },
    });

    phases.forEach((p, i) => {
      const x = 0.5 + i * 2.35;
      const w = 2.1;

      // Dot on timeline
      slide.addShape(pres.shapes.OVAL, {
        x: x + w / 2 - 0.1, y: 1.42, w: 0.2, h: 0.2,
        fill: { color: p.color },
        shadow: { type: "outer", color: p.color, blur: 8, offset: 0, angle: 0, opacity: 0.5 },
      });

      // Phase label
      slide.addText(p.phase, {
        x, y: 1.05, w, h: 0.25,
        fontSize: 9, fontFace: "Arial", bold: true,
        color: p.color, align: "center", margin: 0,
      });
      slide.addText(p.title, {
        x, y: 1.7, w, h: 0.28,
        fontSize: 16, fontFace: "Arial", bold: true,
        color: C.white, align: "center", margin: 0,
      });
      slide.addText(p.weeks, {
        x, y: 1.98, w, h: 0.22,
        fontSize: 9, fontFace: "Arial", color: C.textDim, align: "center", margin: 0,
      });

      // Card below
      const cardY = 2.35;
      const cardH = 2.9;
      slide.addShape(pres.shapes.RECTANGLE, {
        x, y: cardY, w, h: cardH,
        fill: { color: C.bgCard },
        shadow: mkShadowSm(),
      });
      slide.addShape(pres.shapes.RECTANGLE, {
        x, y: cardY, w, h: 0.035,
        fill: { color: p.color },
      });

      // Items
      slide.addText(
        p.items.map((item, idx) => ({
          text: item,
          options: { bullet: true, breakLine: idx < p.items.length - 1, color: C.textMuted, fontSize: 10 },
        })),
        { x: x + 0.15, y: cardY + 0.2, w: w - 0.3, h: cardH - 0.4, valign: "top", margin: 0, fontFace: "Arial" }
      );
    });
  }

  // ════════════════════════════════════════════════════════════════
  // SLIDE 13: SUCCESS METRICS
  // ════════════════════════════════════════════════════════════════
  {
    const slide = pres.addSlide();
    fullBg(slide);
    addSectionTitle(slide, "Success Metrics");
    addPageNumber(slide, 13);

    // Product metrics - big stat callouts
    const productMetrics = [
      { val: "> 95%", target: "→ 99%", label: "Task Success Rate", color: C.cyan },
      { val: "> 50%", target: "", label: "Weekly Active Users", color: C.purple },
      { val: "> 80%", target: "", label: "Core Feature Adoption", color: C.green },
      { val: "> 60%", target: "", label: "30-Day Retention", color: C.orange },
    ];

    productMetrics.forEach((m, i) => {
      const x = 0.5 + i * 2.35;
      const y = 1.2;
      const w = 2.1;
      const h = 1.8;

      slide.addShape(pres.shapes.RECTANGLE, {
        x, y, w, h,
        fill: { color: C.bgCard },
        shadow: mkShadowSm(),
      });
      // Top accent
      slide.addShape(pres.shapes.RECTANGLE, {
        x, y, w, h: 0.035,
        fill: { color: m.color },
      });
      // Big number
      slide.addText(m.val, {
        x, y: y + 0.15, w, h: 0.6,
        fontSize: 32, fontFace: "Arial", bold: true,
        color: m.color, align: "center", valign: "middle", margin: 0,
      });
      if (m.target) {
        slide.addText(m.target, {
          x, y: y + 0.65, w, h: 0.25,
          fontSize: 12, fontFace: "Arial", color: C.textMuted,
          align: "center", margin: 0,
        });
      }
      // Label
      slide.addText(m.label, {
        x, y: y + 1.05, w, h: 0.5,
        fontSize: 11, fontFace: "Arial", color: C.textMuted,
        align: "center", margin: 0,
      });
    });

    // Bottom: technical metrics
    const techMetrics = [
      { val: "99% → 99.9%", label: "System Availability" },
      { val: "< 100ms P95", label: "API Response Time" },
      { val: "< 500ms P95", label: "Task Dispatch Latency" },
      { val: "100+", label: "Concurrent Tasks" },
      { val: "< 1%", label: "Error Rate" },
    ];

    const tmY = 3.35;
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0.5, y: tmY, w: 9.0, h: 1.8,
      fill: { color: C.bgCard },
      shadow: mkShadowSm(),
    });
    slide.addText("Technical KPIs", {
      x: 0.75, y: tmY + 0.1, w: 3.0, h: 0.3,
      fontSize: 13, fontFace: "Arial", bold: true,
      color: C.white, margin: 0,
    });

    techMetrics.forEach((m, i) => {
      const tx = 0.75 + i * 1.75;
      slide.addText(m.val, {
        x: tx, y: tmY + 0.55, w: 1.55, h: 0.4,
        fontSize: 20, fontFace: "Arial", bold: true,
        color: C.cyan, align: "center", valign: "middle", margin: 0,
      });
      slide.addText(m.label, {
        x: tx, y: tmY + 1.0, w: 1.55, h: 0.6,
        fontSize: 9, fontFace: "Arial", color: C.textMuted,
        align: "center", valign: "top", margin: 0,
      });
    });
  }

  // ════════════════════════════════════════════════════════════════
  // SLIDE 14: COMPETITIVE LANDSCAPE
  // ════════════════════════════════════════════════════════════════
  {
    const slide = pres.addSlide();
    fullBg(slide);
    addSectionTitle(slide, "Competitive Advantage");
    addPageNumber(slide, 14);

    // Table-style comparison
    const headers = ["Competitor", "Strengths", "Weaknesses", "Our Edge"];
    const rows = [
      ["LangSmith", "LangChain ecosystem,\nrich debugging tools", "Dev-focused debugging,\nnot production management", "Production-grade\norchestration & monitoring"],
      ["E2B", "Secure sandbox\nexecution", "Single-function focus,\nno full lifecycle", "End-to-end agent\nlifecycle management"],
      ["Dust", "Enterprise-ready,\npolished UX", "Closed-source,\ncommercial only", "Open-source,\ncommunity-driven"],
      ["PocketFlow", "Chinese-language,\nbeginner-friendly", "Simple feature set,\nlimited scale", "Advanced orchestration,\nhigh concurrency"],
    ];

    const tableY = 1.15;
    const colW = [1.7, 2.4, 2.4, 2.4];
    const colX = [0.5];
    for (let i = 1; i < colW.length; i++) colX.push(colX[i - 1] + colW[i - 1] + 0.08);

    // Header row
    headers.forEach((h, i) => {
      slide.addShape(pres.shapes.RECTANGLE, {
        x: colX[i], y: tableY, w: colW[i], h: 0.4,
        fill: { color: C.cyan, transparency: 70 },
      });
      slide.addText(h, {
        x: colX[i], y: tableY, w: colW[i], h: 0.4,
        fontSize: 11, fontFace: "Arial", bold: true,
        color: C.white, align: "center", valign: "middle", margin: 0,
      });
    });

    // Data rows
    rows.forEach((row, ri) => {
      const ry = tableY + 0.48 + ri * 1.05;
      row.forEach((cell, ci) => {
        slide.addShape(pres.shapes.RECTANGLE, {
          x: colX[ci], y: ry, w: colW[ci], h: 0.95,
          fill: { color: ri % 2 === 0 ? C.bgCard : C.bgCard2 },
          shadow: mkShadowSm(),
        });
        slide.addText(cell, {
          x: colX[ci] + 0.1, y: ry + 0.05, w: colW[ci] - 0.2, h: 0.85,
          fontSize: 9.5, fontFace: "Arial",
          color: ci === 3 ? C.green : ci === 2 ? C.textMuted : C.textMuted,
          bold: ci === 3,
          align: "center", valign: "middle", margin: 0,
        });
      });
    });

    // Strategy callout
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0.5, y: 4.6, w: 9.0, h: 0.55,
      fill: { color: C.bgCard },
      shadow: mkShadowSm(),
    });
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0.5, y: 4.6, w: 0.06, h: 0.55,
      fill: { color: C.cyan },
    });
    slide.addText("Strategy:  Open Source First  →  Developer Trust  →  Community Growth  →  Enterprise Adoption", {
      x: 0.85, y: 4.6, w: 8.4, h: 0.55,
      fontSize: 12, fontFace: "Arial", bold: true,
      color: C.white, valign: "middle", margin: 0,
    });
  }

  // ════════════════════════════════════════════════════════════════
  // SLIDE 15: THANK YOU / NEXT STEPS
  // ════════════════════════════════════════════════════════════════
  {
    const slide = pres.addSlide();
    fullBg(slide, "060A18");

    // Same grid decoration as title
    for (let i = 0; i < 11; i++) {
      slide.addShape(pres.shapes.LINE, {
        x: i * 1.0, y: 0, w: 0, h: 5.625,
        line: { color: "0F1530", width: 0.5 },
      });
    }
    for (let j = 0; j < 7; j++) {
      slide.addShape(pres.shapes.LINE, {
        x: 0, y: j * 1.0, w: 10, h: 0,
        line: { color: "0F1530", width: 0.5 },
      });
    }

    // Glow orbs
    [
      { x: 7.5, y: 1.0, c: C.purple, s: 0.5 },
      { x: 2.0, y: 4.0, c: C.cyan, s: 0.6 },
    ].forEach(o => {
      slide.addShape(pres.shapes.OVAL, {
        x: o.x, y: o.y, w: o.s, h: o.s,
        fill: { color: o.c, transparency: 80 },
        shadow: { type: "outer", color: o.c, blur: 30, offset: 0, angle: 0, opacity: 0.5 },
      });
    });

    slide.addText("Thank You", {
      x: 1.0, y: 1.2, w: 8.0, h: 1.0,
      fontSize: 48, fontFace: "Arial", bold: true,
      color: C.white, align: "center", valign: "middle", margin: 0,
    });

    slide.addShape(pres.shapes.RECTANGLE, {
      x: 3.5, y: 2.2, w: 3.0, h: 0.01,
      fill: { color: C.cyan },
      shadow: { type: "outer", color: C.cyan, blur: 8, offset: 0, angle: 0, opacity: 0.5 },
    });

    slide.addText("Let's build the future of Agent infrastructure — together.", {
      x: 1.5, y: 2.5, w: 7.0, h: 0.5,
      fontSize: 15, fontFace: "Arial", color: C.textMuted,
      align: "center", margin: 0,
    });

    // Next steps cards
    const nextSteps = [
      { text: "Star us on GitHub", color: C.cyan },
      { text: "Join the waitlist", color: C.purple },
      { text: "Contribute to the RFC", color: C.green },
    ];

    nextSteps.forEach((ns, i) => {
      const nx = 1.5 + i * 2.7;
      slide.addShape(pres.shapes.RECTANGLE, {
        x: nx, y: 3.3, w: 2.3, h: 0.55,
        fill: { color: C.bgCard },
        shadow: mkShadowSm(),
      });
      slide.addText(ns.text, {
        x: nx, y: 3.3, w: 2.3, h: 0.55,
        fontSize: 12, fontFace: "Arial", bold: true,
        color: ns.color, align: "center", valign: "middle", margin: 0,
      });
    });

    // Bottom
    slide.addText("AgentSys  ·  Open Source  ·  agent-sys.dev  ·  hello@agent-sys.dev", {
      x: 1.0, y: 4.6, w: 8.0, h: 0.4,
      fontSize: 11, fontFace: "Arial", color: C.textDim,
      align: "center", margin: 0,
    });
    slide.addText("⚡ AGENTSYS", {
      x: 1.0, y: 5.0, w: 8.0, h: 0.3,
      fontSize: 14, fontFace: "Arial", bold: true,
      color: C.cyan, align: "center", margin: 0,
    });
  }
}

// ─── Main ──────────────────────────────────────────────────────────
buildAllSlides()
  .then(() => {
    return pres.writeFile({ fileName: "/Users/guoningyan/Desktop/agentSys/AgentSys_PRD.pptx" });
  })
  .then(() => {
    console.log("✅ PPT created: AgentSys_PRD.pptx");
  })
  .catch(err => {
    console.error("❌ Error:", err);
    process.exit(1);
  });
