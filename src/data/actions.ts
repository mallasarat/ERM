import { ImprovementAction } from "../types";

export const ALL_ACTIONS: ImprovementAction[] = [
  // Governance
  { id: "g1", name: "Formalize Board Risk Committee", dimension: "Governance", pillar: "Leadership & Governance", impact: 0.8, effort: "High", timeline: "6 Months", category: "Foundational" },
  { id: "g2", name: "Implement Risk Appetite Statement", dimension: "Governance", pillar: "Scope, Context & Criteria", impact: 0.6, effort: "Medium", timeline: "3 Months", category: "Foundational" },
  { id: "g3", name: "Quarterly External Governance Review", dimension: "Governance", pillar: "Monitoring & Review", impact: 0.4, effort: "Medium", timeline: "Ongoing", category: "Advanced" },
  { id: "g4", name: "ESG Integration in Risk Framework", dimension: "Governance", pillar: "Strategy & Integration", impact: 0.5, effort: "High", timeline: "12 Months", category: "Advanced" },

  // Process
  { id: "p1", name: "Centralize Risk Incident Log", dimension: "Process", pillar: "Recording & Reporting", impact: 0.7, effort: "Medium", timeline: "2 Months", category: "Foundational" },
  { id: "p2", name: "Automate Key Risk Indicators (KRIs)", dimension: "Process", pillar: "Monitoring & Review", impact: 0.9, effort: "High", timeline: "6 Months", category: "Advanced" },
  { id: "p3", name: "Establish Root Cause Analysis Workflow", dimension: "Process", pillar: "Risk Assessment", impact: 0.5, effort: "Low", timeline: "1 Month", category: "Foundational" },
  { id: "p4", name: "Bi-annual Scenario Stress Testing", dimension: "Process", pillar: "Risk Assessment", impact: 0.8, effort: "Medium", timeline: "4 Months", category: "Advanced" },

  // Technology
  { id: "t1", name: "Deploy Enterprise GRC Platform", dimension: "Technology", pillar: "Cross-cutting" as any, impact: 1.2, effort: "High", timeline: "9 Months", category: "Foundational" },
  { id: "t2", name: "Implement Multi-Factor Authentication (MFA)", dimension: "Technology", pillar: "Risk Treatment", impact: 0.9, effort: "Low", timeline: "1 Month", category: "Foundational" },
  { id: "t3", name: "Security-by-Design in SDLC", dimension: "Technology", pillar: "Strategy & Integration", impact: 0.7, effort: "High", timeline: "Ongoing", category: "Advanced" },
  { id: "t4", name: "AI/LLM Governance Framework", dimension: "Technology", pillar: "Leadership & Governance", impact: 0.6, effort: "Medium", timeline: "3 Months", category: "Advanced" },

  // People
  { id: "pe1", name: "Mandatory Risk Awareness Training", dimension: "People", pillar: "Continuous Improvement & Resilience", impact: 0.5, effort: "Low", timeline: "2 Months", category: "Foundational" },
  { id: "pe2", name: "Risk Accountability in HR Performance", dimension: "People", pillar: "Leadership & Governance", impact: 0.7, effort: "Medium", timeline: "6 Months", category: "Foundational" },
  { id: "pe3", name: "Biannual Cross-dept Risk Workshops", dimension: "People", pillar: "Risk Culture", impact: 0.4, effort: "Low", timeline: "Ongoing", category: "Advanced" },
  { id: "pe4", name: "Establish Whistleblower Protection Program", dimension: "People", pillar: "Leadership & Governance", impact: 0.6, effort: "Medium", timeline: "3 Months", category: "Foundational" },
];
