import { Question } from "../types";

export const ALL_QUESTIONS: Question[] = [
  // 1. Leadership & Governance (10 questions)
  { id: 1, pillar: "Leadership & Governance", dimension: "Governance", text: "Is there a formally approved ERM policy?", weight: 1.0 },
  { id: 2, pillar: "Leadership & Governance", dimension: "Governance", text: "Are risk roles and responsibilities clearly defined and communicated?", weight: 1.0 },
  { id: 3, pillar: "Leadership & Governance", dimension: "People", text: "Does senior leadership actively champion risk management?", weight: 1.0 },
  { id: 4, pillar: "Leadership & Governance", dimension: "Governance", text: "Is risk appetite approved and periodically reviewed by governing bodies?", weight: 1.0 },
  { id: 5, pillar: "Leadership & Governance", dimension: "Process", text: "Are risk breaches escalated and addressed promptly?", weight: 1.0 },
  { id: 6, pillar: "Leadership & Governance", dimension: "People", text: "Are risk responsibilities included in performance evaluations?", weight: 1.0 },
  { id: 7, pillar: "Leadership & Governance", dimension: "Governance", text: "Are governance committees overseeing risk effectively?", weight: 1.0 },
  { id: 8, pillar: "Leadership & Governance", dimension: "People", text: "Is leadership trained on emerging risks (cyber, AI, ESG)?", weight: 1.0 },
  { id: 9, pillar: "Leadership & Governance", dimension: "Governance", text: "Are accountability mechanisms enforced for risk violations?", weight: 1.0 },
  { id: 10, pillar: "Leadership & Governance", dimension: "Process", text: "Does leadership receive timely, accurate, decision-ready risk reports?", weight: 1.0 },

  // 2. Strategy & Integration (10 questions)
  { id: 11, pillar: "Strategy & Integration", dimension: "Process", text: "Is ERM integrated into strategic planning cycles?", weight: 1.0 },
  { id: 12, pillar: "Strategy & Integration", dimension: "Governance", text: "Are risks considered during budgeting and resource allocation?", weight: 1.0 },
  { id: 13, pillar: "Strategy & Integration", dimension: "Process", text: "Are major initiatives required to conduct risk assessments?", weight: 1.0 },
  { id: 14, pillar: "Strategy & Integration", dimension: "Governance", text: "Are risk insights used to prioritize investments?", weight: 1.0 },
  { id: 15, pillar: "Strategy & Integration", dimension: "Technology", text: "Are risk indicators integrated into performance dashboards?", weight: 1.0 },
  { id: 16, pillar: "Strategy & Integration", dimension: "People", text: "Are cross-functional risk reviews conducted regularly?", weight: 1.0 },
  { id: 17, pillar: "Strategy & Integration", dimension: "Process", text: "Are risk considerations embedded in procurement and vendor decisions?", weight: 1.0 },
  { id: 18, pillar: "Strategy & Integration", dimension: "Governance", text: "Are emerging risks considered in strategic reviews?", weight: 1.0 },
  { id: 19, pillar: "Strategy & Integration", dimension: "Process", text: "Are risk appetite limits operationalized across business units?", weight: 1.0 },
  { id: 20, pillar: "Strategy & Integration", dimension: "Governance", text: "Are risk insights used in project portfolio management?", weight: 1.0 },

  // 3. Scope, Context & Criteria (10 questions)
  { id: 21, pillar: "Scope, Context & Criteria", dimension: "Process", text: "Is internal and external context defined and reviewed periodically?", weight: 1.0 },
  { id: 22, pillar: "Scope, Context & Criteria", dimension: "Governance", text: "Are risk criteria standardized across the organization?", weight: 1.0 },
  { id: 23, pillar: "Scope, Context & Criteria", dimension: "Process", text: "Are assumptions and constraints documented for assessments?", weight: 1.0 },
  { id: 24, pillar: "Scope, Context & Criteria", dimension: "Governance", text: "Are risk appetite and tolerance levels clearly defined?", weight: 1.0 },
  { id: 25, pillar: "Scope, Context & Criteria", dimension: "Process", text: "Are criteria for velocity, contagion, and persistence defined?", weight: 1.0 },
  { id: 26, pillar: "Scope, Context & Criteria", dimension: "Governance", text: "Are ESG, cyber, and technology criteria included?", weight: 1.0 },
  { id: 27, pillar: "Scope, Context & Criteria", dimension: "Process", text: "Are context changes reviewed after major events?", weight: 1.0 },
  { id: 28, pillar: "Scope, Context & Criteria", dimension: "People", text: "Are stakeholder expectations incorporated into context setting?", weight: 1.0 },
  { id: 29, pillar: "Scope, Context & Criteria", dimension: "People", text: "Are risk boundaries and limits communicated effectively?", weight: 1.0 },
  { id: 30, pillar: "Scope, Context & Criteria", dimension: "Governance", text: "Are criteria aligned with regulatory and industry standards?", weight: 1.0 },

  // 4. Risk Identification (10 questions)
  { id: 31, pillar: "Risk Identification", dimension: "Process", text: "Is there a structured process for identifying risks?", weight: 1.0 },
  { id: 32, pillar: "Risk Identification", dimension: "Process", text: "Are risks identified across all business units and functions?", weight: 1.0 },
  { id: 33, pillar: "Risk Identification", dimension: "People", text: "Are emerging risks identified through environmental scanning?", weight: 1.0 },
  { id: 34, pillar: "Risk Identification", dimension: "Process", text: "Are third-party and supply chain risks identified?", weight: 1.0 },
  { id: 35, pillar: "Risk Identification", dimension: "Process", text: "Are interdependencies between risks identified?", weight: 1.0 },
  { id: 36, pillar: "Risk Identification", dimension: "Process", text: "Are lessons from incidents used to identify new risks?", weight: 1.0 },
  { id: 37, pillar: "Risk Identification", dimension: "Technology", text: "Are technology, cyber, and data risks identified systematically?", weight: 1.0 },
  { id: 38, pillar: "Risk Identification", dimension: "Governance", text: "Are ESG and sustainability risks identified?", weight: 1.0 },
  { id: 39, pillar: "Risk Identification", dimension: "People", text: "Are stakeholder-driven risks identified?", weight: 1.0 },
  { id: 40, pillar: "Risk Identification", dimension: "Governance", text: "Are identification processes reviewed for completeness?", weight: 1.0 },

  // 5. Risk Assessment (10 questions)
  { id: 41, pillar: "Risk Assessment", dimension: "Process", text: "Are likelihood and impact assessed using standardized criteria?", weight: 1.0 },
  { id: 42, pillar: "Risk Assessment", dimension: "Process", text: "Are quantitative and qualitative methods used appropriately?", weight: 1.0 },
  { id: 43, pillar: "Risk Assessment", dimension: "Process", text: "Are scenarios developed for critical risks?", weight: 1.0 },
  { id: 44, pillar: "Risk Assessment", dimension: "Process", text: "Are systemic and cascading risks assessed?", weight: 1.0 },
  { id: 45, pillar: "Risk Assessment", dimension: "Governance", text: "Are assumptions documented and validated?", weight: 1.0 },
  { id: 46, pillar: "Risk Assessment", dimension: "Governance", text: "Are risk assessments reviewed for consistency across units?", weight: 1.0 },
  { id: 47, pillar: "Risk Assessment", dimension: "Technology", text: "Are data sources validated for quality and reliability?", weight: 1.0 },
  { id: 48, pillar: "Risk Assessment", dimension: "Technology", text: "Are risk models governed and periodically validated?", weight: 1.0 },
  { id: 49, pillar: "Risk Assessment", dimension: "Process", text: "Are assessments updated after major changes?", weight: 1.0 },
  { id: 50, pillar: "Risk Assessment", dimension: "Governance", text: "Are risk prioritization methods transparent and repeatable?", weight: 1.0 },

  // 6. Risk Treatment (10 questions)
  { id: 51, pillar: "Risk Treatment", dimension: "Process", text: "Are treatment plans documented for all major risks?", weight: 1.0 },
  { id: 52, pillar: "Risk Treatment", dimension: "Governance", text: "Are treatment options evaluated for cost-effectiveness?", weight: 1.0 },
  { id: 53, pillar: "Risk Treatment", dimension: "Technology", text: "Are controls designed and tested for effectiveness?", weight: 1.0 },
  { id: 54, pillar: "Risk Treatment", dimension: "Governance", text: "Are residual risks documented and approved?", weight: 1.0 },
  { id: 55, pillar: "Risk Treatment", dimension: "Technology", text: "Are treatment actions linked to KRIs?", weight: 1.0 },
  { id: 56, pillar: "Risk Treatment", dimension: "Governance", text: "Are risk financing options (insurance, hedging) considered?", weight: 1.0 },
  { id: 57, pillar: "Risk Treatment", dimension: "Process", text: "Are treatments updated based on monitoring results?", weight: 1.0 },
  { id: 58, pillar: "Risk Treatment", dimension: "People", text: "Are treatment owners accountable for implementation?", weight: 1.0 },
  { id: 59, pillar: "Risk Treatment", dimension: "Process", text: "Are contingency plans aligned with risk treatments?", weight: 1.0 },
  { id: 60, pillar: "Risk Treatment", dimension: "Technology", text: "Are treatment timelines tracked and reported?", weight: 1.0 },

  // 7. Monitoring & Review (10 questions)
  { id: 61, pillar: "Monitoring & Review", dimension: "Technology", text: "Are KRIs monitored against thresholds?", weight: 1.0 },
  { id: 62, pillar: "Monitoring & Review", dimension: "Technology", text: "Are dashboards used to track risk exposure?", weight: 1.0 },
  { id: 63, pillar: "Monitoring & Review", dimension: "Technology", text: "Are early-warning indicators in place?", weight: 1.0 },
  { id: 64, pillar: "Monitoring & Review", dimension: "Process", text: "Are risk breaches escalated promptly?", weight: 1.0 },
  { id: 65, pillar: "Monitoring & Review", dimension: "Governance", text: "Are monitoring results reviewed by leadership?", weight: 1.0 },
  { id: 66, pillar: "Monitoring & Review", dimension: "Process", text: "Are controls tested regularly?", weight: 1.0 },
  { id: 67, pillar: "Monitoring & Review", dimension: "Technology", text: "Are monitoring processes automated where possible?", weight: 1.0 },
  { id: 68, pillar: "Monitoring & Review", dimension: "Governance", text: "Are monitoring results integrated into performance reporting?", weight: 1.0 },
  { id: 69, pillar: "Monitoring & Review", dimension: "Governance", text: "Are monitoring processes reviewed for effectiveness?", weight: 1.0 },
  { id: 70, pillar: "Monitoring & Review", dimension: "Technology", text: "Are systemic risk indicators monitored?", weight: 1.0 },

  // 8. Recording & Reporting (10 questions)
  { id: 71, pillar: "Recording & Reporting", dimension: "Process", text: "Are risk records maintained consistently across units?", weight: 1.0 },
  { id: 72, pillar: "Recording & Reporting", dimension: "Governance", text: "Are reports standardized and comparable?", weight: 1.0 },
  { id: 73, pillar: "Recording & Reporting", dimension: "Governance", text: "Are reports audit-ready and evidence-based?", weight: 1.0 },
  { id: 74, pillar: "Recording & Reporting", dimension: "Technology", text: "Are digital tools used for reporting?", weight: 1.0 },
  { id: 75, pillar: "Recording & Reporting", dimension: "Process", text: "Are reporting timelines defined and followed?", weight: 1.0 },
  { id: 76, pillar: "Recording & Reporting", dimension: "Technology", text: "Are dashboards accessible to relevant stakeholders?", weight: 1.0 },
  { id: 77, pillar: "Recording & Reporting", dimension: "Governance", text: "Are reporting processes reviewed for quality?", weight: 1.0 },
  { id: 78, pillar: "Recording & Reporting", dimension: "People", text: "Are risk insights communicated clearly and concisely?", weight: 1.0 },
  { id: 79, pillar: "Recording & Reporting", dimension: "Governance", text: "Are regulatory reporting requirements met?", weight: 1.0 },
  { id: 80, pillar: "Recording & Reporting", dimension: "Process", text: "Are reporting templates updated periodically?", weight: 1.0 },

  // 9. Risk Culture (10 questions)
  { id: 81, pillar: "Risk Culture", dimension: "People", text: "Is risk awareness measured periodically?", weight: 1.0 },
  { id: 82, pillar: "Risk Culture", dimension: "People", text: "Are employees encouraged to escalate risks?", weight: 1.0 },
  { id: 83, pillar: "Risk Culture", dimension: "Governance", text: "Are incentives aligned with risk appetite?", weight: 1.0 },
  { id: 84, pillar: "Risk Culture", dimension: "People", text: "Is leadership modeling desired risk behaviors?", weight: 1.0 },
  { id: 85, pillar: "Risk Culture", dimension: "People", text: "Are culture surveys conducted regularly?", weight: 1.0 },
  { id: 86, pillar: "Risk Culture", dimension: "People", text: "Are training programs effective and role-specific?", weight: 1.0 },
  { id: 87, pillar: "Risk Culture", dimension: "Governance", text: "Are risk behaviors embedded into performance management?", weight: 1.0 },
  { id: 88, pillar: "Risk Culture", dimension: "People", text: "Are communication channels open and trusted?", weight: 1.0 },
  { id: 89, pillar: "Risk Culture", dimension: "Governance", text: "Are risk violations addressed consistently?", weight: 1.0 },
  { id: 90, pillar: "Risk Culture", dimension: "People", text: "Is psychological safety present for risk escalation?", weight: 1.0 },

  // 10. Continuous Improvement & Resilience (10 questions)
  { id: 91, pillar: "Continuous Improvement & Resilience", dimension: "Process", text: "Are lessons learned captured and applied?", weight: 1.0 },
  { id: 92, pillar: "Continuous Improvement & Resilience", dimension: "Governance", text: "Are ERM processes reviewed periodically?", weight: 1.0 },
  { id: 93, pillar: "Continuous Improvement & Resilience", dimension: "Governance", text: "Are benchmarks used to compare maturity?", weight: 1.0 },
  { id: 94, pillar: "Continuous Improvement & Resilience", dimension: "Technology", text: "Are improvements tracked against KPIs?", weight: 1.0 },
  { id: 95, pillar: "Continuous Improvement & Resilience", dimension: "Governance", text: "Are audits used to improve ERM processes?", weight: 1.0 },
  { id: 96, pillar: "Continuous Improvement & Resilience", dimension: "Process", text: "Are resilience and continuity plans tested regularly?", weight: 1.0 },
  { id: 97, pillar: "Continuous Improvement & Resilience", dimension: "Process", text: "Are stress tests conducted for major risks?", weight: 1.0 },
  { id: 98, pillar: "Continuous Improvement & Resilience", dimension: "Governance", text: "Are recovery capabilities aligned with risk appetite?", weight: 1.0 },
  { id: 99, pillar: "Continuous Improvement & Resilience", dimension: "Technology", text: "Are improvement actions assigned and monitored?", weight: 1.0 },
  { id: 100, pillar: "Continuous Improvement & Resilience", dimension: "People", text: "Are ERM enhancements incorporated into training and culture?", weight: 1.0 },

  // Add more as needed...
];
