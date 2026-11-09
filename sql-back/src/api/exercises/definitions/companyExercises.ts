import { companySampleQuery } from "@/api/company/companyRouter";
import type { ExerciseModel } from "./models";

export const companyExercises: ExerciseModel = {
  id: "Company",
  name: "Big Company",
  sampleQuery: companySampleQuery,
  desc: "2.5 million rows: JSON, recursion and window functions. Revenue = SUM(quantity * unit_price) of the delivered orders. Queries are killed after 5 seconds! (postgres)",
  schema: true,
  exercises: [
    {
      id: 1,
      desc: "Which laptops have 64 GB of RAM?",
      points: 6,
      expected: [
        ["Lumen Laptop 667"],
        ["Apex Laptop 779"],
        ["Apex Laptop 835"],
        ["Zento Laptop 159"],
        ["Apex Laptop 439"],
        ["Nimbus Laptop 495"],
        ["Zento Laptop 719"],
      ],
      expectedOrder: false,
      solution: `SELECT name
FROM products
WHERE (attributes->>'ram_gb')::int = 64`,
      expectedColumns: ["name"],
      hints: "attributes->>'ram_gb' gets a JSON value as text",
    },
    {
      id: 2,
      desc: "Which phones are available in pink?",
      points: 6,
      expected: [
        ["Nimbus Phone 177"],
        ["Apex Phone 625"],
        ["Corvex Phone 849"],
        ["Apex Phone 905"],
        ["Corvex Phone 565"],
        ["Lumen Phone 789"],
        ["Corvex Phone 845"],
      ],
      expectedOrder: false,
      solution: `SELECT name
FROM products
WHERE category = 'Phone' AND attributes->'colors' ? 'pink'`,
      expectedColumns: ["name"],
      hints: "The ? operator checks whether a JSON array contains a string. Or look at @>",
    },
    {
      id: 3,
      desc: "What is the revenue per laptop CPU?",
      points: 12,
      expected: [
        ["Ryzen 5", 288615204.49],
        ["i5", 175691894.21],
        ["i9", 173112699.47],
        ["i7", 147532325.12],
        ["M3", 143480959.86],
        ["Ryzen 7", 15264805.67],
      ],
      expectedOrder: false,
      solution: `SELECT p.attributes->>'cpu' AS cpu, SUM(l.quantity * l.unit_price) AS revenue
FROM order_lines l
JOIN products p ON p.id = l.product_id
JOIN orders o ON o.id = l.order_id
WHERE p.category = 'Laptop' AND o.status = 'delivered'
GROUP BY 1`,
      expectedColumns: ["cpu", "revenue"],
    },
    {
      id: 4,
      desc: "How many employees work (directly or indirectly) under the Head of Engineering?",
      points: 12,
      expected: [[277]],
      expectedOrder: false,
      solution: `WITH RECURSIVE team AS (
  SELECT id FROM employees WHERE job_title = 'Head of Engineering'
  UNION ALL
  SELECT e.id FROM employees e JOIN team t ON e.manager_id = t.id
)
SELECT COUNT(*) - 1 AS count FROM team`,
      expectedColumns: ["count"],
      hints: "WITH RECURSIVE",
    },
    {
      id: 5,
      desc: "How many employees are there on each level of the org chart? The CEO is level 1.",
      points: 12,
      expected: [
        [1, 1],
        [2, 6],
        [3, 30],
        [4, 212],
        [5, 845],
        [6, 400],
        [7, 6],
      ],
      expectedOrder: true,
      solution: `WITH RECURSIVE chart AS (
  SELECT id, 1 AS level FROM employees WHERE manager_id IS NULL
  UNION ALL
  SELECT e.id, c.level + 1 FROM employees e JOIN chart c ON e.manager_id = c.id
)
SELECT level, COUNT(*) AS count
FROM chart
GROUP BY level
ORDER BY level`,
      expectedColumns: ["level", "count"],
      hints: "WITH RECURSIVE",
    },
    {
      id: 6,
      desc: "Show the revenue per month of 2024 (YYYY-MM) with a running total.",
      points: 12,
      expected: [
        ["2024-01", 27185623.5, 27185623.5],
        ["2024-02", 27901946.03, 55087569.53],
        ["2024-03", 30300357.28, 85387926.81],
        ["2024-04", 33969229.94, 119357156.75],
        ["2024-05", 40028429.89, 159385586.64],
        ["2024-06", 41928823.45, 201314410.09],
        ["2024-07", 48172051.21, 249486461.3],
        ["2024-08", 53315031.8, 302801493.1],
        ["2024-09", 56275288.82, 359076781.92],
        ["2024-10", 63242892.64, 422319674.56],
        ["2024-11", 66622401.67, 488942076.23],
        ["2024-12", 75130671.79, 564072748.02],
      ],
      expectedOrder: true,
      solution: `SELECT
  TO_CHAR(o.ordered_at, 'YYYY-MM') AS month,
  SUM(l.quantity * l.unit_price) AS revenue,
  SUM(SUM(l.quantity * l.unit_price)) OVER (ORDER BY TO_CHAR(o.ordered_at, 'YYYY-MM')) AS running_total
FROM orders o
JOIN order_lines l ON l.order_id = o.id
WHERE o.status = 'delivered' AND o.ordered_at >= '2024-01-01' AND o.ordered_at < '2025-01-01'
GROUP BY 1
ORDER BY 1`,
      expectedColumns: ["month", "revenue", "running_total"],
      hints: "SUM(...) OVER (ORDER BY ...)",
    },
    {
      id: 7,
      desc: "Which month (YYYY-MM) had the biggest revenue drop compared to the month before? Also select the difference.",
      points: 15,
      expected: [["2025-01", -4171480.37]],
      expectedOrder: false,
      solution: `SELECT month, diff
FROM (
  SELECT
    TO_CHAR(o.ordered_at, 'YYYY-MM') AS month,
    SUM(l.quantity * l.unit_price) - LAG(SUM(l.quantity * l.unit_price)) OVER (ORDER BY TO_CHAR(o.ordered_at, 'YYYY-MM')) AS diff
  FROM orders o
  JOIN order_lines l ON l.order_id = o.id
  WHERE o.status = 'delivered'
  GROUP BY 1
) m
ORDER BY diff
LIMIT 1`,
      expectedColumns: ["month", "diff"],
      hints: "LAG()",
    },
    {
      id: 8,
      desc: "What is the most ordered product (total quantity, all orders) in each category?",
      points: 15,
      expected: [
        ["Chair", "Sitwell Chair 149", 44966],
        ["Desk", "Oakline Desk 156", 42447],
        ["Headset", "Klikk Headset 128", 55032],
        ["Keyboard", "Klikk Keyboard 135", 51003],
        ["Laptop", "Nimbus Laptop 107", 125112],
        ["Monitor", "Nimbus Monitor 114", 74021],
        ["Mouse", "Sonora Mouse 142", 47442],
        ["Phone", "Zento Phone 121", 61989],
      ],
      expectedOrder: false,
      solution: `SELECT DISTINCT ON (p.category) p.category, p.name, SUM(l.quantity) AS quantity
FROM order_lines l
JOIN products p ON p.id = l.product_id
GROUP BY p.id
ORDER BY p.category, 3 DESC`,
      expectedColumns: ["category", "name", "quantity"],
      hints: "RANK() OVER (PARTITION BY ...) or DISTINCT ON",
    },
    {
      id: 9,
      desc: "The webshop was down a few times. When? Show the first and last day of each period without any orders.",
      points: 18,
      expected: [
        ["2023-08-14", "2023-08-16"],
        ["2023-12-25", "2023-12-25"],
        ["2024-03-11", "2024-03-12"],
        ["2024-12-25", "2024-12-25"],
        ["2025-01-27", "2025-01-31"],
        ["2025-12-25", "2025-12-25"],
      ],
      expectedOrder: false,
      solution: `SELECT day + 1 AS first_day, next_day - 1 AS last_day
FROM (
  SELECT day, LEAD(day) OVER (ORDER BY day) AS next_day
  FROM (SELECT DISTINCT ordered_at::date AS day FROM orders) d
) x
WHERE next_day - day > 1`,
      expectedColumns: ["first_day", "last_day"],
      hints: "Gaps & islands: LEAD()",
    },
    {
      id: 10,
      desc: "Which order pushed the 2023 revenue over 50 million? Select the order id and customer name.",
      points: 24,
      expected: [[253391, "North Logistics & Co"]],
      expectedOrder: false,
      solution: `SELECT x.id, c.name
FROM (
  SELECT o.id, o.customer_id, o.ordered_at,
    SUM(SUM(l.quantity * l.unit_price)) OVER (ORDER BY o.ordered_at) AS running_total
  FROM orders o
  JOIN order_lines l ON l.order_id = o.id
  WHERE o.status = 'delivered' AND o.ordered_at < '2024-01-01'
  GROUP BY o.id
) x
JOIN customers c ON c.id = x.customer_id
WHERE x.running_total >= 50000000
ORDER BY x.ordered_at
LIMIT 1`,
      expectedColumns: ["id", "name"],
      hints: "A subquery that sums all previous orders, for every order, will time out",
    },
  ],
};
