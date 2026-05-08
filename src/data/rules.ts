import { Pillar, OperatingDimension } from "../types";

export interface ConsistencyRule {
  id: number;
  desc: string;
  condition: (responses: Record<number, number>) => "Pass" | "Fail" | "Idle";
  rationale: string;
}

export const CONSISTENCY_RULES: ConsistencyRule[] = [
  {
    id: 1,
    desc: "Appetite vs Applied",
    condition: (r) => (r[12] && r[35] ? (r[12] >= r[35] ? "Pass" : "Fail") : "Idle"),
    rationale: "Enterprise Risk Appetite (Q12) must be equal to or higher than applied Risk Criteria (Q35) to ensure alignment."
  },
  {
    id: 2,
    desc: "KRI Logic Flow",
    condition: (r) => (r[25] && r[60] ? (r[25] >= r[60] ? "Pass" : "Fail") : "Idle"),
    rationale: "KRI embedding into dashboards (Q25) should precede or match automated KRI monitoring (Q60)."
  },
  {
    id: 3,
    desc: "Cyber Hierarchy",
    condition: (r) => (r[84] && r[92] ? (r[84] >= r[92] ? "Pass" : "Fail") : "Idle"),
    rationale: "Cyber criteria definition (Q84) must underpin cyber control monitoring (Q92)."
  },
  {
    id: 4,
    desc: "Scenario vs Stress",
    condition: (r) => (r[45] && r[51] ? (r[45] >= r[51] ? "Pass" : "Fail") : "Idle"),
    rationale: "Scenario analysis capabilities (Q45) must be equivalent or superior to stress testing execution (Q51)."
  },
  {
    id: 5,
    desc: "Gov vs Escalation",
    condition: (r) => (r[1] && r[7] ? (r[1] >= r[7] ? "Pass" : "Fail") : "Idle"),
    rationale: "General risk roles (Q1) must be defined before specific escalation mechanisms (Q7) are considered mature."
  },
  {
    id: 6,
    desc: "Treatment Logic",
    condition: (r) => (r[53] && r[60] ? (r[53] >= r[60] ? "Pass" : "Fail") : "Idle"),
    rationale: "Treatment documentation (Q53) must be as mature as the automated monitoring of those same risks (Q60)."
  },
];
