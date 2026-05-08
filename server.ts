import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- SQLITE DATABASE SETUP ---
const db = new Database("riskxai.db");

// Initialize Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS business_units (
    id TEXT PRIMARY KEY,
    name TEXT,
    industry TEXT
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT
  );

  CREATE TABLE IF NOT EXISTS pillars (
    id TEXT PRIMARY KEY,
    name TEXT
  );

  CREATE TABLE IF NOT EXISTS dimensions (
    id TEXT PRIMARY KEY,
    name TEXT
  );

  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT,
    pillarId TEXT,
    dimensionId TEXT,
    maxScore INTEGER DEFAULT 5,
    weight REAL DEFAULT 0,
    FOREIGN KEY(pillarId) REFERENCES pillars(id),
    FOREIGN KEY(dimensionId) REFERENCES dimensions(id)
  );

  CREATE TABLE IF NOT EXISTS weights (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pillarId TEXT,
    dimensionId TEXT,
    weight REAL
  );

  CREATE TABLE IF NOT EXISTS assessments (
    id TEXT PRIMARY KEY,
    entityId TEXT,
    createdAt TEXT,
    status TEXT DEFAULT 'draft',
    overallScore REAL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    assessmentId TEXT,
    questionId INTEGER,
    score REAL,
    weightedScore REAL,
    note TEXT DEFAULT '',
    evidenceName TEXT DEFAULT '',
    answeredAt TEXT DEFAULT '',
    UNIQUE(assessmentId, questionId),
    FOREIGN KEY(assessmentId) REFERENCES assessments(id),
    FOREIGN KEY(questionId) REFERENCES questions(id)
  );

  CREATE TABLE IF NOT EXISTS maturity_vectors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    assessmentId TEXT,
    pillarId TEXT,
    dimensionId TEXT,
    weightedScore REAL,
    pillarScore REAL,
    UNIQUE(assessmentId, pillarId, dimensionId),
    FOREIGN KEY(assessmentId) REFERENCES assessments(id),
    FOREIGN KEY(pillarId) REFERENCES pillars(id)
  );

  CREATE TABLE IF NOT EXISTS benchmarks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT,
    pillarId TEXT,
    dimensionId TEXT,
    score REAL
  );

  CREATE TABLE IF NOT EXISTS drift_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    assessmentId TEXT,
    entityId TEXT,
    pillarId TEXT,
    deltaScore REAL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(assessmentId) REFERENCES assessments(id),
    FOREIGN KEY(entityId) REFERENCES business_units(id),
    FOREIGN KEY(pillarId) REFERENCES pillars(id)
  );

  CREATE TABLE IF NOT EXISTS roadmap_actions (
    id TEXT PRIMARY KEY,
    pillarId TEXT,
    dimensionId TEXT,
    description TEXT,
    expectedUplift REAL,
    costScore INTEGER,
    durationScore INTEGER
  );

  CREATE TABLE IF NOT EXISTS roadmap_for_assessment (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    assessmentId TEXT,
    actionId TEXT,
    priorityScore REAL,
    phase TEXT,
    FOREIGN KEY(assessmentId) REFERENCES assessments(id),
    FOREIGN KEY(actionId) REFERENCES roadmap_actions(id)
  );
`);

for (const statement of [
  "ALTER TABLE responses ADD COLUMN note TEXT DEFAULT ''",
  "ALTER TABLE responses ADD COLUMN evidenceName TEXT DEFAULT ''",
  "ALTER TABLE responses ADD COLUMN answeredAt TEXT DEFAULT ''",
]) {
  try {
    db.exec(statement);
  } catch {
    // Column already exists in previously initialized demo databases.
  }
}

// --- SEEDING LOGIC (RISK X AI / SOURCE-DATA ALIGNED) ---
const PILLARS_LIST = [
  { id: "lead", name: "Leadership & Governance", weight: 0.2 },
  { id: "strat", name: "Strategy & Integration", weight: 0.15 },
  { id: "scope", name: "Scope, Context & Criteria", weight: 0.1 },
  { id: "ident", name: "Risk Identification", weight: 0.1 },
  { id: "assess", name: "Risk Assessment", weight: 0.2 },
  { id: "treat", name: "Risk Treatment", weight: 0.1 },
  { id: "monitor", name: "Monitoring & Review", weight: 0.05 },
  { id: "report", name: "Recording & Reporting", weight: 0.05 },
  { id: "culture", name: "Risk Culture", weight: 0.03 },
  { id: "improve", name: "Continuous Improvement & Resilience", weight: 0.02 },
];

const DIMENSIONS_LIST = ["People", "Process", "Technology", "Governance"];

const BUSINESS_UNITS_LIST = [
  { id: "gen", name: "Generation", industry: "Power Generation" },
  { id: "tra", name: "Transmission", industry: "Grid Operations" },
  { id: "dis", name: "Distribution", industry: "Distribution Networks" },
  { id: "corp", name: "Corporate", industry: "Corporate Services" },
  { id: "sub", name: "Subsidiaries", industry: "Subsidiary Operations" },
  { id: "jv", name: "Joint Ventures", industry: "Joint Venture Portfolio" },
];

const dimensionWeights: Record<string, number> = {
  "People": 0.22,
  "Process": 0.38,
  "Technology": 0.14,
  "Governance": 0.26
};

const benchmarkProfiles: Record<string, Record<string, number>> = {
  target: {
    lead: 4.0,
    strat: 4.0,
    scope: 4.0,
    ident: 4.0,
    assess: 4.0,
    treat: 4.0,
    monitor: 4.0,
    report: 4.0,
    culture: 4.0,
    improve: 4.0,
  },
  industry: {
    lead: 3.8,
    strat: 3.7,
    scope: 3.5,
    ident: 3.5,
    assess: 3.8,
    treat: 3.6,
    monitor: 3.5,
    report: 3.4,
    culture: 3.3,
    improve: 3.4,
  },
  peer: {
    lead: 3.5,
    strat: 3.4,
    scope: 3.3,
    ident: 3.3,
    assess: 3.5,
    treat: 3.4,
    monitor: 3.2,
    report: 3.2,
    culture: 3.1,
    improve: 3.1,
  },
  external: {
    lead: 4.3,
    strat: 4.2,
    scope: 4.1,
    ident: 4.1,
    assess: 4.3,
    treat: 4.1,
    monitor: 4.0,
    report: 4.0,
    culture: 3.9,
    improve: 4.0,
  },
};

// Full 100-question source dataset aligned to the provided workbook.
const QUESTIONS_DATA = [
  // 1. Leadership & Governance (10)
  { pillarId: "lead", dimensionId: "Governance", text: "Is there a formally approved ERM policy?" },
  { pillarId: "lead", dimensionId: "Governance", text: "Are risk roles and responsibilities clearly defined and communicated?" },
  { pillarId: "lead", dimensionId: "People", text: "Does senior leadership actively champion risk management?" },
  { pillarId: "lead", dimensionId: "Governance", text: "Is risk appetite approved and periodically reviewed by governing bodies?" },
  { pillarId: "lead", dimensionId: "Process", text: "Are risk breaches escalated and addressed promptly?" },
  { pillarId: "lead", dimensionId: "People", text: "Are risk responsibilities included in performance evaluations?" },
  { pillarId: "lead", dimensionId: "Governance", text: "Are governance committees overseeing risk effectively?" },
  { pillarId: "lead", dimensionId: "People", text: "Is leadership trained on emerging risks (cyber, AI, ESG)?" },
  { pillarId: "lead", dimensionId: "Governance", text: "Are accountability mechanisms enforced for risk violations?" },
  { pillarId: "lead", dimensionId: "Process", text: "Does leadership receive timely, accurate, decision‑ready risk reports?" },
  // 2. Strategy & Integration (10)
  { pillarId: "strat", dimensionId: "Process", text: "Is ERM integrated into strategic planning cycles?" },
  { pillarId: "strat", dimensionId: "Governance", text: "Are risks considered during budgeting and resource allocation?" },
  { pillarId: "strat", dimensionId: "Process", text: "Are major initiatives required to conduct risk assessments?" },
  { pillarId: "strat", dimensionId: "Governance", text: "Are risk insights used to prioritize investments?" },
  { pillarId: "strat", dimensionId: "Technology", text: "Are risk indicators integrated into performance dashboards?" },
  { pillarId: "strat", dimensionId: "People", text: "Are cross‑functional risk reviews conducted regularly?" },
  { pillarId: "strat", dimensionId: "Process", text: "Are risk considerations embedded in procurement and vendor decisions?" },
  { pillarId: "strat", dimensionId: "Governance", text: "Are emerging risks considered in strategic reviews?" },
  { pillarId: "strat", dimensionId: "Process", text: "Are risk appetite limits operationalized across business units?" },
  { pillarId: "strat", dimensionId: "Governance", text: "Are risk insights used in project portfolio management?" },
  // 3. Scope, Context & Criteria (10)
  { pillarId: "scope", dimensionId: "Process", text: "Is internal and external context defined and reviewed periodically?" },
  { pillarId: "scope", dimensionId: "Governance", text: "Are risk criteria standardized across the organization?" },
  { pillarId: "scope", dimensionId: "Process", text: "Are assumptions and constraints documented for assessments?" },
  { pillarId: "scope", dimensionId: "Governance", text: "Are risk appetite and tolerance levels clearly defined?" },
  { pillarId: "scope", dimensionId: "Process", text: "Are criteria for velocity, contagion, and persistence defined?" },
  { pillarId: "scope", dimensionId: "Governance", text: "Are ESG, cyber, and technology criteria included?" },
  { pillarId: "scope", dimensionId: "Process", text: "Are context changes reviewed after major events?" },
  { pillarId: "scope", dimensionId: "People", text: "Are stakeholder expectations incorporated into context setting?" },
  { pillarId: "scope", dimensionId: "People", text: "Are risk boundaries and limits communicated effectively?" },
  { pillarId: "scope", dimensionId: "Governance", text: "Are criteria aligned with regulatory and industry standards?" },
  // 4. Risk Identification (10)
  { pillarId: "ident", dimensionId: "Process", text: "Is there a structured process for identifying risks?" },
  { pillarId: "ident", dimensionId: "Process", text: "Are risks identified across all business units and functions?" },
  { pillarId: "ident", dimensionId: "People", text: "Are emerging risks identified through environmental scanning?" },
  { pillarId: "ident", dimensionId: "Process", text: "Are third‑party and supply chain risks identified?" },
  { pillarId: "ident", dimensionId: "Process", text: "Are interdependencies between risks identified?" },
  { pillarId: "ident", dimensionId: "Process", text: "Are lessons from incidents used to identify new risks?" },
  { pillarId: "ident", dimensionId: "Technology", text: "Are technology, cyber, and data risks identified systematically?" },
  { pillarId: "ident", dimensionId: "Governance", text: "Are ESG and sustainability risks identified?" },
  { pillarId: "ident", dimensionId: "People", text: "Are stakeholder‑driven risks identified?" },
  { pillarId: "ident", dimensionId: "Governance", text: "Are identification processes reviewed for completeness?" },
  // 5. Risk Assessment (10)
  { pillarId: "assess", dimensionId: "Process", text: "Are likelihood and impact assessed using standardized criteria?" },
  { pillarId: "assess", dimensionId: "Process", text: "Are quantitative and qualitative methods used appropriately?" },
  { pillarId: "assess", dimensionId: "Process", text: "Are scenarios developed for critical risks?" },
  { pillarId: "assess", dimensionId: "Process", text: "Are systemic and cascading risks assessed?" },
  { pillarId: "assess", dimensionId: "Governance", text: "Are assumptions documented and validated?" },
  { pillarId: "assess", dimensionId: "Governance", text: "Are risk assessments reviewed for consistency across units?" },
  { pillarId: "assess", dimensionId: "Technology", text: "Are data sources validated for quality and reliability?" },
  { pillarId: "assess", dimensionId: "Technology", text: "Are risk models governed and periodically validated?" },
  { pillarId: "assess", dimensionId: "Process", text: "Are assessments updated after major changes?" },
  { pillarId: "assess", dimensionId: "Governance", text: "Are risk prioritization methods transparent and repeatable?" },
  // 6. Risk Treatment (10)
  { pillarId: "treat", dimensionId: "Process", text: "Are treatment plans documented for all major risks?" },
  { pillarId: "treat", dimensionId: "Governance", text: "Are treatment options evaluated for cost‑effectiveness?" },
  { pillarId: "treat", dimensionId: "Technology", text: "Are controls designed and tested for effectiveness?" },
  { pillarId: "treat", dimensionId: "Governance", text: "Are residual risks documented and approved?" },
  { pillarId: "treat", dimensionId: "Technology", text: "Are treatment actions linked to KRIs?" },
  { pillarId: "treat", dimensionId: "Governance", text: "Are risk financing options (insurance, hedging) considered?" },
  { pillarId: "treat", dimensionId: "Process", text: "Are treatments updated based on monitoring results?" },
  { pillarId: "treat", dimensionId: "People", text: "Are treatment owners accountable for implementation?" },
  { pillarId: "treat", dimensionId: "Process", text: "Are contingency plans aligned with risk treatments?" },
  { pillarId: "treat", dimensionId: "Technology", text: "Are treatment timelines tracked and reported?" },
  // 7. Monitoring & Review (10)
  { pillarId: "monitor", dimensionId: "Technology", text: "Are KRIs monitored against thresholds?" },
  { pillarId: "monitor", dimensionId: "Technology", text: "Are dashboards used to track risk exposure?" },
  { pillarId: "monitor", dimensionId: "Technology", text: "Are early‑warning indicators in place?" },
  { pillarId: "monitor", dimensionId: "Process", text: "Are risk breaches escalated promptly?" },
  { pillarId: "monitor", dimensionId: "Governance", text: "Are monitoring results reviewed by leadership?" },
  { pillarId: "monitor", dimensionId: "Process", text: "Are controls tested regularly?" },
  { pillarId: "monitor", dimensionId: "Technology", text: "Are monitoring processes automated where possible?" },
  { pillarId: "monitor", dimensionId: "Governance", text: "Are monitoring results integrated into performance reporting?" },
  { pillarId: "monitor", dimensionId: "Governance", text: "Are monitoring processes reviewed for effectiveness?" },
  { pillarId: "monitor", dimensionId: "Technology", text: "Are systemic risk indicators monitored?" },
  // 8. Recording & Reporting (10)
  { pillarId: "report", dimensionId: "Process", text: "Are risk records maintained consistently across units?" },
  { pillarId: "report", dimensionId: "Governance", text: "Are reports standardized and comparable?" },
  { pillarId: "report", dimensionId: "Governance", text: "Are reports audit‑ready and evidence‑based?" },
  { pillarId: "report", dimensionId: "Technology", text: "Are digital tools used for reporting?" },
  { pillarId: "report", dimensionId: "Process", text: "Are reporting timelines defined and followed?" },
  { pillarId: "report", dimensionId: "Technology", text: "Are dashboards accessible to relevant stakeholders?" },
  { pillarId: "report", dimensionId: "Governance", text: "Are reporting processes reviewed for quality?" },
  { pillarId: "report", dimensionId: "People", text: "Are risk insights communicated clearly and concisely?" },
  { pillarId: "report", dimensionId: "Governance", text: "Are regulatory reporting requirements met?" },
  { pillarId: "report", dimensionId: "Process", text: "Are reporting templates updated periodically?" },
  // 9. Risk Culture (10)
  { pillarId: "culture", dimensionId: "People", text: "Is risk awareness measured periodically?" },
  { pillarId: "culture", dimensionId: "People", text: "Are employees encouraged to escalate risks?" },
  { pillarId: "culture", dimensionId: "Governance", text: "Are incentives aligned with risk appetite?" },
  { pillarId: "culture", dimensionId: "People", text: "Is leadership modeling desired risk behaviors?" },
  { pillarId: "culture", dimensionId: "People", text: "Are culture surveys conducted regularly?" },
  { pillarId: "culture", dimensionId: "People", text: "Are training programs effective and role‑specific?" },
  { pillarId: "culture", dimensionId: "Governance", text: "Are risk behaviors embedded into performance management?" },
  { pillarId: "culture", dimensionId: "People", text: "Are communication channels open and trusted?" },
  { pillarId: "culture", dimensionId: "Governance", text: "Are risk violations addressed consistently?" },
  { pillarId: "culture", dimensionId: "People", text: "Is psychological safety present for risk escalation?" },
  // 10. Continuous Improvement & Resilience (10)
  { pillarId: "improve", dimensionId: "Process", text: "Are lessons learned captured and applied?" },
  { pillarId: "improve", dimensionId: "Governance", text: "Are ERM processes reviewed periodically?" },
  { pillarId: "improve", dimensionId: "Governance", text: "Are benchmarks used to compare maturity?" },
  { pillarId: "improve", dimensionId: "Technology", text: "Are improvements tracked against KPIs?" },
  { pillarId: "improve", dimensionId: "Governance", text: "Are audits used to improve ERM processes?" },
  { pillarId: "improve", dimensionId: "Process", text: "Are resilience and continuity plans tested regularly?" },
  { pillarId: "improve", dimensionId: "Process", text: "Are stress tests conducted for major risks?" },
  { pillarId: "improve", dimensionId: "Governance", text: "Are recovery capabilities aligned with risk appetite?" },
  { pillarId: "improve", dimensionId: "Technology", text: "Are improvement actions assigned and monitored?" },
  { pillarId: "improve", dimensionId: "People", text: "Are ERM enhancements incorporated into training and culture?" }
];

const QUESTIONS_WITH_IDS = QUESTIONS_DATA.map((question, index) => ({
  id: index + 1,
  ...question,
}));

function performSeed() {
  const pillarCount = (db.prepare("SELECT count(*) as count FROM pillars").get() as any).count;
  const questionCount = (db.prepare("SELECT count(*) as count FROM questions").get() as any).count;
  const weightCount = (db.prepare("SELECT count(*) as count FROM weights").get() as any).count;
  const benchmarkCount = (db.prepare("SELECT count(*) as count FROM benchmarks").get() as any).count;
  const entityCount = (db.prepare("SELECT count(*) as count FROM business_units").get() as any).count;
  const externalBenchmarkCount = (db.prepare("SELECT count(*) as count FROM benchmarks WHERE type = 'external'").get() as any).count;
  const legacyGlobalBenchmarkCount = (db.prepare("SELECT count(*) as count FROM benchmarks WHERE type = 'global'").get() as any).count;
  const sourceAlignedUserCount = (db.prepare("SELECT count(*) as count FROM users WHERE email = 'operator@riskxai.com'").get() as any).count;
  const exactQuestionText = (db.prepare("SELECT text FROM questions WHERE id = 10").get() as any)?.text;

  const expectedWeightCount = QUESTIONS_WITH_IDS.reduce((acc, question) => {
    const key = `${question.pillarId}:${question.dimensionId}`;
    return acc.add(key);
  }, new Set<string>()).size;

  const shouldReseed =
    pillarCount !== PILLARS_LIST.length ||
    questionCount !== QUESTIONS_WITH_IDS.length ||
    weightCount !== expectedWeightCount ||
    benchmarkCount !== Object.keys(benchmarkProfiles).length * PILLARS_LIST.length ||
    entityCount !== BUSINESS_UNITS_LIST.length ||
    externalBenchmarkCount !== PILLARS_LIST.length ||
    legacyGlobalBenchmarkCount > 0 ||
    sourceAlignedUserCount !== 1 ||
    exactQuestionText !== "Does leadership receive timely, accurate, decision‑ready risk reports?";

  if (!shouldReseed) {
    return;
  }

  db.exec(`
    DELETE FROM roadmap_for_assessment;
    DELETE FROM drift_records;
    DELETE FROM responses;
    DELETE FROM maturity_vectors;
    DELETE FROM assessments;
    DELETE FROM roadmap_actions;
    DELETE FROM weights;
    DELETE FROM benchmarks;
    DELETE FROM questions;
    DELETE FROM dimensions;
    DELETE FROM pillars;
    DELETE FROM business_units;
    DELETE FROM users;
    DELETE FROM sqlite_sequence WHERE name IN ('users', 'questions', 'responses', 'maturity_vectors', 'benchmarks', 'drift_records', 'roadmap_for_assessment');
  `);

  db.transaction(() => {
    // Business Units
    const insertBU = db.prepare("INSERT INTO business_units (id, name, industry) VALUES (?, ?, ?)");
    BUSINESS_UNITS_LIST.forEach((businessUnit) => insertBU.run(businessUnit.id, businessUnit.name, businessUnit.industry));

    // Pillars
    const insertPillar = db.prepare("INSERT INTO pillars (id, name) VALUES (?, ?)");
    PILLARS_LIST.forEach(p => insertPillar.run(p.id, p.name));

    // Dimensions
    const insertDim = db.prepare("INSERT INTO dimensions (id, name) VALUES (?, ?)");
    DIMENSIONS_LIST.forEach(d => insertDim.run(d, d));

    // Matrix weights: one entry per active pillar x dimension combination.
    const insertWeight = db.prepare("INSERT INTO weights (pillarId, dimensionId, weight) VALUES (?, ?, ?)");
    PILLARS_LIST.forEach((pillar) => {
      DIMENSIONS_LIST.forEach((dimensionId) => {
        const questionsInCell = QUESTIONS_WITH_IDS.filter(
          (question) => question.pillarId === pillar.id && question.dimensionId === dimensionId
        );

        if (!questionsInCell.length) {
          return;
        }

        insertWeight.run(pillar.id, dimensionId, dimensionWeights[dimensionId]);
      });
    });

    // 100 questions weighted by their pillar-dimension cell.
    const insertQ = db.prepare("INSERT INTO questions (id, text, pillarId, dimensionId, weight) VALUES (?, ?, ?, ?, ?)");
    QUESTIONS_WITH_IDS.forEach((question) => {
      const questionsInCell = QUESTIONS_WITH_IDS.filter(
        (entry) => entry.pillarId === question.pillarId && entry.dimensionId === question.dimensionId
      ).length;
      const questionWeight = dimensionWeights[question.dimensionId] / questionsInCell;
      insertQ.run(question.id, question.text, question.pillarId, question.dimensionId, questionWeight);
    });

    // Benchmarks
    const insertBench = db.prepare("INSERT INTO benchmarks (type, pillarId, dimensionId, score) VALUES (?, ?, ?, ?)");
    Object.entries(benchmarkProfiles).forEach(([type, profile]) => {
      PILLARS_LIST.forEach((pillar) => {
        insertBench.run(type, pillar.id, null, profile[pillar.id]);
      });
    });

    // Roadmap Actions
    const insertAction = db.prepare("INSERT INTO roadmap_actions (id, pillarId, dimensionId, description, expectedUplift, costScore, durationScore) VALUES (?, ?, ?, ?, ?, ?, ?)");
    PILLARS_LIST.forEach(p => {
        insertAction.run(`act_${p.id}_1`, p.id, "Process", `Standardize ${p.name.toLowerCase()} workflows`, 0.8, 3, 2);
        insertAction.run(`act_${p.id}_2`, p.id, "People", `Launch targeted capability uplift for ${p.name.toLowerCase()}`, 0.5, 1, 2);
        insertAction.run(`act_${p.id}_3`, p.id, "Technology", `Digitize ${p.name.toLowerCase()} controls and dashboards`, 0.7, 4, 3);
    });

    // Demo User
    db.prepare("INSERT INTO users (email, password) VALUES (?, ?)").run("operator@riskxai.com", "password");
  })();
}

performSeed();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // --- API ROUTES ---

  app.post("/api/auth/login", (req, res) => {
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";

    if (!/^[^@\s]+@gmail\.com$/i.test(email)) {
      return res.status(401).json({ error: "Use a Gmail address to enter this demo." });
    }

    if (!password.trim()) {
      return res.status(401).json({ error: "Enter any password to continue." });
    }

    res.json({ success: true, email });
  });

  app.get("/api/entities", (req, res) => {
    res.json(db.prepare("SELECT * FROM business_units").all());
  });

  app.get("/api/metadata", (req, res) => {
    const pillars = db.prepare("SELECT * FROM pillars").all();
    const dimensions = db.prepare("SELECT * FROM dimensions").all();
    const questions = db.prepare("SELECT * FROM questions ORDER BY id").all();
    const weights = db.prepare("SELECT * FROM weights ORDER BY pillarId, dimensionId").all();
    res.json({ pillars, dimensions, questions, weights });
  });

  app.post("/api/assessments/create", (req, res) => {
    const { entityId } = req.body;
    const id = "TX" + Math.random().toString(36).substr(2, 9).toUpperCase();
    const createdAt = new Date().toISOString();
    db.prepare("INSERT INTO assessments (id, entityId, createdAt) VALUES (?, ?, ?)").run(id, entityId, createdAt);
    res.json({ id, entityId, createdAt });
  });

  app.post("/api/responses/create", (req, res) => {
    const { assessmentId, responses } = req.body;
    
    // Strict Integrity Check: Exact question set required
    const dbQuestions = db.prepare("SELECT id FROM questions").all() as { id: number }[];
    const expectedIds = new Set(dbQuestions.map(q => q.id));

    if (!responses || !Array.isArray(responses)) {
      return res.status(400).json({ error: "Invalid Payload", message: "Responses must be an array." });
    }

    const receivedIds = new Set(responses.map(r => r.questionId));

    if (receivedIds.size !== expectedIds.size) {
       return res.status(400).json({ 
        error: "Integrity Violation", 
        message: `Unique question count mismatch. Expected ${expectedIds.size}, received ${receivedIds.size}.` 
      });
    }

    // Verify every expected ID is present
    for (const id of expectedIds) {
      if (!receivedIds.has(id)) {
        return res.status(400).json({ 
          error: "Integrity Violation", 
          message: `Missing vector for Question ID ${id}.` 
        });
      }
    }

    const insert = db.prepare(`
      INSERT OR REPLACE INTO responses (assessmentId, questionId, score, weightedScore, note, evidenceName, answeredAt) 
      SELECT ?, id, ?, ? * weight, ?, ?, ? FROM questions WHERE id = ?
    `);
    
    try {
      db.transaction(() => {
        // Clear existing responses for this assessment to ensure a clean vector state
        db.prepare("DELETE FROM responses WHERE assessmentId = ?").run(assessmentId);
        
        for (const r of responses) {
          const result = insert.run(
            assessmentId,
            r.score,
            r.score,
            r.note || "",
            r.evidenceName || "",
            r.answeredAt || new Date().toISOString(),
            r.questionId
          );
          if (result.changes === 0) {
             throw new Error(`Failed to insert/verify Question ID ${r.questionId}`);
          }
        }
      })();
      res.json({ success: true, count: responses.length, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error("Critical DB Write Failure:", error);
      res.status(500).json({ error: "Storage Failure", details: String(error) });
    }
  });

  app.post("/api/compute-maturity-vector", (req, res) => {
    const { assessmentId } = req.body;

    db.transaction(() => {
      // Clear existing vectors for this assessment
      db.prepare("DELETE FROM maturity_vectors WHERE assessmentId = ?").run(assessmentId);

      // 1. Calculate overall dimension scores.
      const dimScores = db.prepare(`
        SELECT q.dimensionId, AVG(r.score) as score
        FROM responses r
        JOIN questions q ON r.questionId = q.id
        WHERE r.assessmentId = ?
        GROUP BY q.dimensionId
      `).all(assessmentId) as any[];

      // 2. Calculate weighted pillar-dimension cells using the workbook matrix.
      const pillarDimensionVectors = db.prepare(`
        SELECT
          q.pillarId,
          q.dimensionId,
          AVG(r.score) as avgScore,
          SUM(r.weightedScore) as weightedScore,
          MAX(w.weight) as matrixWeight
        FROM responses r
        JOIN questions q ON r.questionId = q.id
        LEFT JOIN weights w ON w.pillarId = q.pillarId AND w.dimensionId = q.dimensionId
        WHERE r.assessmentId = ?
        GROUP BY q.pillarId, q.dimensionId
      `).all(assessmentId) as any[];

      const insertVector = db.prepare(`
        INSERT INTO maturity_vectors (assessmentId, pillarId, dimensionId, weightedScore, pillarScore)
        VALUES (?, ?, ?, ?, ?)
      `);

      dimScores.forEach((dimensionScore) => {
        insertVector.run(assessmentId, null, dimensionScore.dimensionId, dimensionScore.score, dimensionScore.score);
      });

      const vectorsByPillar = new Map<string, any[]>();
      pillarDimensionVectors.forEach((vector) => {
        const existing = vectorsByPillar.get(vector.pillarId) || [];
        existing.push(vector);
        vectorsByPillar.set(vector.pillarId, existing);
      });

      const pillarScoreMap = new Map<string, number>();

      PILLARS_LIST.forEach((pillar) => {
        const vectors = vectorsByPillar.get(pillar.id) || [];
        const totalMatrixWeight = vectors.reduce((sum, vector) => sum + (vector.matrixWeight || 0), 0);
        const pillarWeightedSum = vectors.reduce((sum, vector) => sum + (vector.weightedScore || 0), 0);
        const pillarScore = totalMatrixWeight > 0 ? pillarWeightedSum / totalMatrixWeight : 0;

        pillarScoreMap.set(pillar.id, pillarScore);

        vectors.forEach((vector) => {
          insertVector.run(
            assessmentId,
            vector.pillarId,
            vector.dimensionId,
            vector.weightedScore,
            pillarScore
          );
        });

        insertVector.run(assessmentId, pillar.id, "AGGREGATE", pillarWeightedSum, pillarScore);
      });

      // 3. Calculate Overall Score using workbook pillar weights.
      const overall = PILLARS_LIST.reduce(
        (sum, pillar) => sum + (pillarScoreMap.get(pillar.id) || 0) * pillar.weight,
        0
      );
      db.prepare("UPDATE assessments SET overallScore = ?, status = 'completed' WHERE id = ?").run(overall, assessmentId);
    })();

    const final = db.prepare("SELECT * FROM assessments WHERE id = ?").get(assessmentId) as any;
    res.json({ overallScore: final.overallScore });
  });

  app.post("/api/compute-drift", (req, res) => {
    const { assessmentId } = req.body;
    const current = db.prepare("SELECT * FROM assessments WHERE id = ?").get(assessmentId) as any;
    if (!current) return res.status(404).json({ error: "Not found" });

    // Find the most recent COMPLETED assessment for this entity PRIOR to the current one
    const previous = db.prepare(`
      SELECT id, createdAt FROM assessments 
      WHERE entityId = ? AND status = 'completed' AND id != ? AND createdAt < ?
      ORDER BY createdAt DESC LIMIT 1
    `).get(current.entityId, assessmentId, current.createdAt) as any;

    if (!previous) {
      return res.json({ drifts: [], message: "No prior baseline detected." });
    }

    const currScores = db.prepare("SELECT pillarId, pillarScore FROM maturity_vectors WHERE assessmentId = ? AND dimensionId = 'AGGREGATE'").all(assessmentId) as any[];
    const prevScores = db.prepare("SELECT pillarId, pillarScore FROM maturity_vectors WHERE assessmentId = ? AND dimensionId = 'AGGREGATE'").all(previous.id) as any[];

    const currMap = new Map(currScores.map(s => [s.pillarId, s.pillarScore]));
    const prevMap = new Map(prevScores.map(s => [s.pillarId, s.pillarScore]));
    const drifts: any[] = [];
    
    db.transaction(() => {
        // Clear existing drift for this specific assessment run
        db.prepare("DELETE FROM drift_records WHERE assessmentId = ?").run(assessmentId);
        
        const insertDrift = db.prepare("INSERT INTO drift_records (assessmentId, entityId, pillarId, deltaScore) VALUES (?, ?, ?, ?)");

        PILLARS_LIST.forEach(p => {
            const currentPillarScore = currMap.get(p.id) || 0;
            const previousPillarScore = prevMap.get(p.id) || 0;
            const delta = currentPillarScore - previousPillarScore;
            
            insertDrift.run(assessmentId, current.entityId, p.id, delta);
            drifts.push({ pillarId: p.id, deltaScore: delta });
        });
    })();

    res.json({ drifts });
  });

  app.post("/api/generate-roadmap", (req, res) => {
    const { assessmentId } = req.body;
    
    // Get current maturity vectors
    const scores = db.prepare("SELECT pillarId, pillarScore FROM maturity_vectors WHERE assessmentId = ? AND dimensionId = 'AGGREGATE'").all(assessmentId) as any[];
    
    // Get target benchmarks
    const benchmarks = db.prepare("SELECT pillarId, score FROM benchmarks WHERE type = 'target'").all() as any[];
    const bMap = new Map(benchmarks.map(b => [b.pillarId, b.score]));

    // Gap Detection: pillarScore < target benchmark (default to 4.0 if not found)
    const gaps = scores.filter(s => {
      const target = bMap.get(s.pillarId) || 4.0;
      return s.pillarScore < target;
    }).map(s => s.pillarId);

    if (!gaps.length) {
      db.prepare("DELETE FROM roadmap_for_assessment WHERE assessmentId = ?").run(assessmentId);
      return res.json({ assigned: [] });
    }

    // Fetch relevant actions for pillars with gaps
    const placeholders = gaps.map(() => '?').join(',');
    const actions = db.prepare(`SELECT * FROM roadmap_actions WHERE pillarId IN (${placeholders})`).all(...gaps) as any[];

    // Engine calculation: priorityScore = expectedUplift / (costScore * durationScore)
    const scoredActions = actions.map(a => {
      const priorityScore = a.expectedUplift / (a.costScore * a.durationScore);
      return { ...a, priorityScore };
    });

    // Stable Sorting: Descending by priorityScore
    scoredActions.sort((a, b) => b.priorityScore - a.priorityScore);

    let assigned: any[] = [];
    db.transaction(() => {
        db.prepare("DELETE FROM roadmap_for_assessment WHERE assessmentId = ?").run(assessmentId);
        
        const insertRoadmap = db.prepare(`
          INSERT INTO roadmap_for_assessment (assessmentId, actionId, priorityScore, phase) 
          VALUES (?, ?, ?, ?)
        `);

        assigned = scoredActions.map((a, idx) => {
            // Phased Assignment: Phase 1 (Top 3), Phase 2 (Next 3), Phase 3 (Remaining)
            let phase = "Phase 3";
            if (idx < 3) phase = "Phase 1";
            else if (idx < 6) phase = "Phase 2";
            
            insertRoadmap.run(assessmentId, a.id, a.priorityScore, phase);
            return { ...a, phase };
        });
    })();

    res.json({ assigned });
  });

  app.get("/api/benchmarks", (req, res) => {
    const type = typeof req.query.type === "string" ? req.query.type : null;
    if (type) {
      return res.json(db.prepare("SELECT * FROM benchmarks WHERE type = ?").all(type));
    }

    res.json(db.prepare("SELECT * FROM benchmarks ORDER BY type, pillarId").all());
  });

  app.get("/api/assessments/:id/analysis", (req, res) => {
    const { id } = req.params;
    const benchmarkType = typeof req.query.benchmarkType === "string" ? req.query.benchmarkType : "target";
    const assessment = db.prepare("SELECT * FROM assessments WHERE id = ?").get(id) as any;
    if (!assessment) return res.status(404).json({ error: "Assessment not found" });

    // 1. Scores
    const pillars = db.prepare("SELECT * FROM pillars").all() as any[];
    const vectors = db.prepare("SELECT pillarId, pillarScore FROM maturity_vectors WHERE assessmentId = ? AND dimensionId = 'AGGREGATE'").all(id) as any[];
    const dimensions = db.prepare("SELECT dimensionId, pillarScore as score FROM maturity_vectors WHERE assessmentId = ? AND pillarId IS NULL").all(id) as any[];

    // 2. Benchmarks
    const benchmarks = db.prepare("SELECT * FROM benchmarks WHERE type = ?").all(benchmarkType) as any[];
    const bMap = new Map(benchmarks.map(b => [b.pillarId, b.score]));

    // 3. Drift
    const driftRecords = db.prepare(`
      SELECT dr.pillarId, dr.deltaScore, p.name as pillarName
      FROM drift_records dr
      LEFT JOIN pillars p ON dr.pillarId = p.id
      WHERE dr.assessmentId = ?
    `).all(id) as any[];

    // 4. Response coverage
    const responseSummary = db.prepare(`
      SELECT
        COUNT(*) as totalResponses,
        SUM(CASE WHEN evidenceName IS NOT NULL AND evidenceName != '' THEN 1 ELSE 0 END) as evidenceCount,
        SUM(CASE WHEN note IS NOT NULL AND note != '' THEN 1 ELSE 0 END) as noteCount,
        MAX(answeredAt) as lastAnsweredAt
      FROM responses
      WHERE assessmentId = ?
    `).get(id) as any;
    
    // 5. Roadmap
    const roadmap = db.prepare(`
      SELECT ra.*, rfa.priorityScore, rfa.phase 
      FROM roadmap_for_assessment rfa
      JOIN roadmap_actions ra ON rfa.actionId = ra.id
      WHERE rfa.assessmentId = ?
      ORDER BY rfa.priorityScore DESC
    `).all(id) as any[];

    // 6. Enriched Analytics (Source of Truth derivations)
    const analytics = pillars.map(p => {
      const v = vectors.find(v => v.pillarId === p.id);
      const score = v ? v.pillarScore : 0;
      const target = bMap.get(p.id) || 4.0;
      const gap = Number(Math.max(0, target - score).toFixed(2));

      return {
        pillarId: p.id,
        pillarName: p.name,
        score: Number(score.toFixed(2)),
        target: target,
        gap: gap,
        status: score >= target ? "OPTIMIZED" : (score >= target * 0.8 ? "ALIGNED" : "DEFICIENT"),
        percentOfTarget: Number(((score / target) * 100).toFixed(1))
      };
    });

    const regressions = driftRecords.filter(d => d.deltaScore < 0).map(r => ({
      pillarId: r.pillarId,
      pillarName: r.pillarName || r.pillarId,
      delta: Number(r.deltaScore.toFixed(3)),
      severity: Math.abs(r.deltaScore) > 0.5 ? "CRITICAL" : "NOTICE"
    }));

    const totalAchieved = analytics.reduce((acc, curr) => acc + (curr.score >= curr.target ? 1 : 0), 0);
    const systemIntegrity = Number(((totalAchieved / pillars.length) * 100).toFixed(0));
    const benchmarkAverage = Number(
      (benchmarks.reduce((sum, benchmark) => sum + benchmark.score, 0) / Math.max(1, benchmarks.length)).toFixed(2)
    );
    const averageGap = Number(
      (analytics.reduce((sum, item) => sum + item.gap, 0) / Math.max(1, analytics.length)).toFixed(2)
    );
    
    // Status Logic (Engine Driven)
    const criticalRegressionsCount = regressions.filter(r => r.severity === "CRITICAL").length;
    const maturityScore = Number(assessment.overallScore.toFixed(2));
    const targetBaseline = benchmarkAverage;
    const isSynced = systemIntegrity >= 80 && criticalRegressionsCount === 0;
    
    let missionStatus = "NOMINAL_SYNC";
    if (criticalRegressionsCount > 0) missionStatus = "CRITICAL_GAP";
    else if (maturityScore < targetBaseline * 0.75) missionStatus = "STRUCTURAL_WEAKNESS";
    else if (regressions.length > 0) missionStatus = "VECTOR_DRIFT";

    res.json({
      assessmentId: id,
      entityId: assessment.entityId,
      entityName: (db.prepare("SELECT name FROM business_units WHERE id = ?").get(assessment.entityId) as any)?.name,
      overallScore: maturityScore,
      systemIntegrity,
      status: assessment.status,
      benchmarkType,
      benchmarkAverage,
      averageGap,
      timestamp: assessment.createdAt,
      criticalRegressionsCount,
      activeRoadmapCount: roadmap.length,
      targetBaseline,
      missionStatus,
      isSynced,
      responseSummary: {
        totalResponses: responseSummary?.totalResponses || 0,
        evidenceCount: responseSummary?.evidenceCount || 0,
        noteCount: responseSummary?.noteCount || 0,
        lastAnsweredAt: responseSummary?.lastAnsweredAt || assessment.createdAt,
      },
      benchmarkProfile: benchmarks.map((benchmark) => ({
        pillarId: benchmark.pillarId,
        score: Number(benchmark.score.toFixed(2)),
      })),
      analytics, 
      dimensions: dimensions.map(d => ({ 
        id: d.dimensionId, 
        name: d.dimensionId, 
        score: Number(d.score.toFixed(2)) 
      })),
      driftProfile: driftRecords.map(d => ({ pillar: d.pillarName || d.pillarId, delta: d.deltaScore })),
      regressions,
      roadmap
    });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`RISK X AI server running on http://localhost:${PORT}`);
  });
}
startServer();
