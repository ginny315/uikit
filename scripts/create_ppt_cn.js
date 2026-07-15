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
pres.author = "AgentSys 团队";
pres.title = "AgentSys — LLM Agent 管理平台";

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
    slide.addText("LLM Agent 的\nKubernetes", {
      x: 1.0, y: 1.7, w: 8.0, h: 1.6,
      fontSize: 40, fontFace: "Arial", bold: true,
      color: C.white, align: "center", valign: "middle", margin: 0,
    });

    // Subtitle
    slide.addText("统一平台，编排、监控、治理您的 AI Agent 集群。", {
      x: 1.5, y: 3.3, w: 7.0, h: 0.6,
      fontSize: 14, fontFace: "Arial", color: C.textMuted,
      align: "center", margin: 0,
    });

    // Bottom meta line
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 3.0, y: 4.15, w: 4.0, h: 0.01,
      fill: { color: C.border },
    });
    slide.addText("开源项目  ·  预发布  ·  2026 年 7 月", {
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
    addSectionTitle(slide, "Agent 管理的四大危机");
    addPageNumber(slide, 2);

    const cards = [
      { icon: I.cubes, title: "Agent 无序蔓延", desc: "数十个 Agent 散落在代码库和服务器中，无法集中查看运行状态、版本或配置信息。", color: C.cyan },
      { icon: I.dollar, title: "成本黑洞", desc: "LLM 调用成本完全不可见，直到月底账单到手才知道哪个 Agent 或用户消耗了最多 Token。", color: C.green },
      { icon: I.exchange, title: "协作断裂", desc: "Agent 之间需要协作，但数据传递靠手动复制粘贴，一个环节失败就会导致整条链路崩溃。", color: C.purple },
      { icon: I.search, title: "调试黑盒", desc: "日志分散、缺少执行追踪、Token 用量不可见——排查问题全靠猜。", color: C.orange },
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
    addSectionTitle(slide, "为什么是现在？市场窗口期");
    addPageNumber(slide, 3);

    // Left side: 4 trend items
    const trends = [
      { icon: I.chartLine, title: "LLM 采用率爆发式增长", desc: "全球团队正以前所未有的速度构建 AI 驱动的应用程序。" },
      { icon: I.robot, title: "单 Agent → 多 Agent 协同", desc: "范式正从单次 LLM 调用转向多 Agent 协同工作。" },
      { icon: I.dollar, title: "成本压力攀升", desc: "Token 成本需要精细化追踪——团队必须对每一分开支负责。" },
      { icon: I.cogs, title: "工程化断层", desc: "Agent 项目从实验走向生产，却缺乏成熟的 DevOps 工具链。" },
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
    slide.addText("市面上不存在成熟的开源\nAgent 管理方案", {
      x: 5.9, y: 2.35, w: 3.3, h: 0.7,
      fontSize: 12, fontFace: "Arial", color: C.textMuted,
      align: "center", margin: 0,
    });

    slide.addShape(pres.shapes.RECTANGLE, {
      x: 6.5, y: 3.2, w: 2.0, h: 0.01,
      fill: { color: C.border },
    });

    slide.addText("缺口真实存在", {
      x: 5.6, y: 3.35, w: 3.9, h: 0.4,
      fontSize: 18, fontFace: "Arial", bold: true,
      color: C.white, align: "center", margin: 0,
    });
    slide.addText("目前没有任何平台能将 Agent 编排、\n成本管理和生产级可观测性\n整合到一个开源解决方案中。", {
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
    addSectionTitle(slide, "产品愿景");
    addPageNumber(slide, 4);

    // Center quote
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 1.0, y: 1.2, w: 8.0, h: 1.4,
      fill: { color: C.bgCard },
      shadow: mkShadowSm(),
    });
    slide.addText("\"让 LLM Agent 的开发、部署\n和管理变得简单、可靠、可扩展。\"", {
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
      { icon: I.server, title: "统一\n管理", desc: "一站式管理\n所有 Agent", color: C.cyan },
      { icon: I.networkWired, title: "工作流\n编排", desc: "像搭积木一样\n组合 Agent", color: C.purple },
      { icon: I.chartBar, title: "全栈\n可观测", desc: "实时监控\n结构化日志", color: C.green },
      { icon: I.dollar, title: "成本\n管控", desc: "追踪每个 Token\n配额与告警", color: C.orange },
      { icon: I.lock, title: "团队\n治理", desc: "RBAC、审计日志\nAPI Key 管理", color: C.cyan },
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
    addSectionTitle(slide, "目标用户");
    addPageNumber(slide, 5);

    const personas = [
      {
        icon: I.user, emoji: "👤",
        title: "个人开发者\n& 小团队",
        desc: "需要低成本、快速上手方案的独立开发者和创业公司，希望几分钟内就能让 Agent 跑起来。",
        priority: "第一阶段目标",
        color: C.cyan,
      },
      {
        icon: I.users, emoji: "👥",
        title: "开发团队\n(5–50 人)",
        desc: "需要标准化管理的内部软件团队，要求多人协作、版本控制、审计追踪和共享看板。",
        priority: "第二阶段目标",
        color: C.purple,
      },
      {
        icon: I.building, emoji: "🏢",
        title: "企业级\n组织",
        desc: "有合规要求的大型企业，需要私有化部署、SSO 集成、SLA 保障、细粒度 RBAC 和多租户。",
        priority: "第三阶段目标",
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
    addSectionTitle(slide, "核心功能 — MVP (P0)");
    addPageNumber(slide, 6);

    const features = [
      {
        icon: I.cubes, title: "Agent 管理",
        items: ["表单或 YAML 创建/编辑/删除", "启动、停止、暂停 Agent 实例", "版本控制与回滚", "能力标签便于发现"],
        color: C.cyan,
      },
      {
        icon: I.listUl, title: "任务调度",
        items: ["API 或 Web UI 提交任务", "优先级队列（紧急→低）", "公平调度，防止饥饿", "指数退避重试"],
        color: C.purple,
      },
      {
        icon: I.chartPie, title: "监控看板",
        items: ["Agent 与任务实时状态", "Token 消耗追踪", "按优先级展示队列长度", "成功率与延迟指标"],
        color: C.green,
      },
      {
        icon: I.search, title: "日志与链路追踪",
        items: ["结构化任务执行日志", "执行时间线可视化", "每步 Token 用量明细", "可搜索、可过滤的日志查看器"],
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
    addSectionTitle(slide, "核心功能 — 团队规模 (P1)");
    addPageNumber(slide, 7);

    const features = [
      {
        icon: I.exchange, title: "工作流编排",
        desc: "可视化拖拽编辑器，将多个 Agent 串联为管道。支持并行执行、条件分支和步骤间数据传递。",
        color: C.cyan,
      },
      {
        icon: I.dollar, title: "成本管理",
        desc: "按 Agent、用户、时间段追踪 Token 用量。设置配额和预算告警，生成成本报告并基于历史数据预测未来支出。",
        color: C.green,
      },
      {
        icon: I.lock, title: "权限与 RBAC",
        desc: "基于角色的访问控制，支持管理员、操作员、用户和查看者角色。API Key 管理、敏感操作审计日志、会话管理。",
        color: C.purple,
      },
      {
        icon: I.plug, title: "Webhook 与集成",
        desc: "任务完成时触发外部系统，订阅系统事件。原生集成 Slack、钉钉和 GitHub，支持 PR 触发 Agent 运行。",
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
    addSectionTitle(slide, "用户旅程：创建与部署 Agent");
    addPageNumber(slide, 8);

    const steps = [
      { num: "01", title: "定义 Agent", desc: "命名、选择 LLM\n(Claude/GPT)、配置\n工具与资源限制" },
      { num: "02", title: "设置配额", desc: "每日 Token 上限、\n最大并发数、\n超时设置" },
      { num: "03", title: "部署与测试", desc: "一键启动、\n提交测试任务、\n查看实时状态" },
      { num: "04", title: "监控", desc: "在看板上追踪\nToken 用量、成功率\n和延迟" },
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
      { val: "< 5 min", label: "首次部署\n耗时" },
      { val: "3 clicks", label: "提交测试\n任务" },
      { val: "Real-time", label: "状态与 Token\n消耗" },
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
    addSectionTitle(slide, "用户旅程：多 Agent 工作流");
    addPageNumber(slide, 9);

    // Flow diagram at the top
    const flowSteps = [
      { label: "Pull Request\n已创建", color: C.green },
      { label: "拉取\n变更", color: C.cyan },
      { label: "安全\n扫描", color: C.purple },
      { label: "代码风格\n检查", color: C.orange },
      { label: "生成\n报告", color: C.cyan },
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
      { icon: I.code, title: "可视化编辑器", desc: "拖拽式界面构建 Agent\n管道——无需编写代码。", color: C.cyan },
      { icon: I.syncAlt, title: "并行执行", desc: "独立步骤并发执行，\n基于 DAG 的拓扑排序调度。", color: C.purple },
      { icon: I.plug, title: "自动触发", desc: "Webhook、定时或事件驱动，\nPR 创建 → 工作流自动启动。", color: C.green },
      { icon: I.clock, title: "故障恢复", desc: "每步重试策略、死信队列、\n支持工作流部分恢复。", color: C.orange },
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
    addSectionTitle(slide, "系统架构");
    addPageNumber(slide, 10);

    // Three layers
    const layers = [
      {
        title: "接入层",
        y: 1.2,
        services: ["API 网关\n(Nginx/Kong)", "Web UI\n(React)", "CLI\n(Go)", "WebSocket\n(Push)"],
        color: C.green,
      },
      {
        title: "服务层 — Go 微服务 (gRPC)",
        y: 2.55,
        services: ["Control\nService", "Scheduler\nService", "AgentRun\nService", "Coordinator\nService", "Auth\nService", "Metrics\nService", "Log\nService", "Webhook\nService"],
        color: C.cyan,
      },
      {
        title: "存储层",
        y: 3.9,
        services: ["PostgreSQL 16\n(配置 / 用户)", "Redis\n(队列 / 状态)", "ClickHouse\n(日志 / 分析)"],
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
    addSectionTitle(slide, "技术栈");
    addPageNumber(slide, 11);

    const stacks = [
      { category: "后端", items: [
          { name: "Go", desc: "高性能，出色的并发能力" },
          { name: "gRPC", desc: "内部服务通信" },
          { name: "Gin", desc: "REST API 框架" },
        ], color: C.cyan },
      { category: "前端", items: [
          { name: "React", desc: "组件化 UI" },
          { name: "TypeScript", desc: "类型安全开发" },
          { name: "Tailwind + shadcn/ui", desc: "实用优先的样式方案" },
        ], color: C.purple },
      { category: "数据与基础设施", items: [
          { name: "PostgreSQL 16", desc: "配置与用户数据" },
          { name: "Redis", desc: "任务队列与缓存" },
          { name: "ClickHouse", desc: "时序数据分析" },
        ], color: C.green },
      { category: "可观测性", items: [
          { name: "Prometheus", desc: "指标采集" },
          { name: "Grafana", desc: "看板与告警" },
          { name: "OpenTelemetry", desc: "分布式追踪 → Jaeger" },
        ], color: C.orange },
      { category: "部署", items: [
          { name: "Docker Compose", desc: "MVP 单节点" },
          { name: "Kubernetes", desc: "生产级编排" },
          { name: "Nginx/Kong", desc: "API 网关与负载均衡" },
        ], color: C.cyan },
      { category: "LLM 提供商", items: [
          { name: "Anthropic Claude", desc: "Opus / Sonnet 模型" },
          { name: "OpenAI GPT", desc: "GPT-4o / o 系列" },
          { name: "Ollama / vLLM", desc: "本地模型 (第二阶段)" },
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
    addSectionTitle(slide, "开发路线图");
    addPageNumber(slide, 12);

    const phases = [
      {
        phase: "第一阶段", title: "MVP", weeks: "4–6 周",
        items: ["Agent CRUD 与生命周期", "任务提交与调度", "基础监控看板", "任务日志查看器", "单节点 Docker 部署"],
        color: C.cyan,
      },
      {
        phase: "第二阶段", title: "核心增强", weeks: "4–6 周",
        items: ["工作流编排", "成本管理与配额", "RBAC 与多用户", "Webhook 集成", "优先级队列系统"],
        color: C.purple,
      },
      {
        phase: "第三阶段", title: "生产就绪", weeks: "4–6 周",
        items: ["高可用部署", "完整审计日志", "性能优化", "更多 LLM 提供商", "CLI 工具发布"],
        color: C.green,
      },
      {
        phase: "第四阶段", title: "企业级", weeks: "按需",
        items: ["多租户", "私有化部署", "SSO 集成", "高级分析", "SLA 保障"],
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
    addSectionTitle(slide, "成功指标");
    addPageNumber(slide, 13);

    // Product metrics - big stat callouts
    const productMetrics = [
      { val: "> 95%", target: "→ 99%", label: "任务成功率", color: C.cyan },
      { val: "> 50%", target: "", label: "周活跃用户", color: C.purple },
      { val: "> 80%", target: "", label: "核心功能采用率", color: C.green },
      { val: "> 60%", target: "", label: "30 日留存率", color: C.orange },
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
      { val: "99% → 99.9%", label: "系统可用性" },
      { val: "< 100ms P95", label: "API 响应时间" },
      { val: "< 500ms P95", label: "任务分发延迟" },
      { val: "100+", label: "并发任务数" },
      { val: "< 1%", label: "错误率" },
    ];

    const tmY = 3.35;
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0.5, y: tmY, w: 9.0, h: 1.8,
      fill: { color: C.bgCard },
      shadow: mkShadowSm(),
    });
    slide.addText("技术 KPI", {
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
    addSectionTitle(slide, "竞争优势");
    addPageNumber(slide, 14);

    // Table-style comparison
    const headers = ["竞品", "优势", "劣势", "我们的优势"];
    const rows = [
      ["LangSmith", "LangChain 生态，\n调试工具丰富", "面向开发调试，\n非生产级管理", "生产级编排\n与监控"],
      ["E2B", "安全沙箱\n执行", "功能单一，\n无全生命周期管理", "端到端 Agent\n生命周期管理"],
      ["Dust", "企业就绪，\nUX 精美", "闭源商业产品，\n不开放", "开源，\n社区驱动"],
      ["PocketFlow", "中文友好，\n入门简单", "功能简单，\n扩展性有限", "高级编排能力，\n高并发"],
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
    slide.addText("策略：开源优先 → 开发者信任 → 社区增长 → 企业采用", {
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

    slide.addText("感谢聆听", {
      x: 1.0, y: 1.2, w: 8.0, h: 1.0,
      fontSize: 48, fontFace: "Arial", bold: true,
      color: C.white, align: "center", valign: "middle", margin: 0,
    });

    slide.addShape(pres.shapes.RECTANGLE, {
      x: 3.5, y: 2.2, w: 3.0, h: 0.01,
      fill: { color: C.cyan },
      shadow: { type: "outer", color: C.cyan, blur: 8, offset: 0, angle: 0, opacity: 0.5 },
    });

    slide.addText("让我们一起构建 Agent 基础设施的未来。", {
      x: 1.5, y: 2.5, w: 7.0, h: 0.5,
      fontSize: 15, fontFace: "Arial", color: C.textMuted,
      align: "center", margin: 0,
    });

    // Next steps cards
    const nextSteps = [
      { text: "GitHub 关注我们", color: C.cyan },
      { text: "加入等待列表", color: C.purple },
      { text: "参与 RFC 贡献", color: C.green },
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
    slide.addText("AgentSys  ·  开源项目  ·  agent-sys.dev  ·  hello@agent-sys.dev", {
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
    return pres.writeFile({ fileName: "/Users/guoningyan/Desktop/agentSys/AgentSys_PRD_CN.pptx" });
  })
  .then(() => {
    console.log("✅ PPT created: AgentSys_PRD_CN.pptx");
  })
  .catch(err => {
    console.error("❌ Error:", err);
    process.exit(1);
  });
