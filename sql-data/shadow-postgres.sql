-- Shadow data for World, Teachers and Company (database world_shadow), applied on top of the real seeds.
-- A submission only counts when it is also correct on this data, so every exercise must give a
-- different, non-empty result here (bun run verify-solutions checks that). Never shown to players.


-- WORLD

INSERT INTO countries (name, continent, area, population, gdp, capital, tld)
VALUES
-- W1: right on the 200M boundary, and just under it
('Brobdingnag', 'Asia', 1250000, 200000000, 610000000000, 'Lorbrulgrud', '.bg'),
('Lilliput', 'Asia', 980000, 199999999, 420000000000, 'Mildendo', '.lp'),
-- W2: all vowels; and decoys that miss one vowel (no 'e', no 'a')
('Montequiaru', 'Africa', 245810, 7215033, 9120000000, 'Quiaru', '.mq'),
('Kouagadiuma', 'Africa', 112622, 4410829, 5310000000, 'Diuma', '.og'),
('Tenuikoro', 'Oceania', 18274, 911372, 4140000000, 'Koro', '.tk');

-- W5: the Dominican Republic overtakes Cuba
UPDATE countries SET area = 120000 WHERE name = 'Dominican Republic';
-- W3: Argentina overtakes Brazil
UPDATE countries SET gdp = 2412000000000 WHERE name = 'Argentina';
-- W4: Germany overtakes Japan; W7: and the 50% threshold moves
UPDATE countries SET gdp = 6000000000000, population = 90000000 WHERE name = 'Germany';
-- W8: '.au' keeps only one match
DELETE FROM countries WHERE name = 'Palau';


-- TEACHERS

-- T3: a department that is neither Sci nor Art
INSERT INTO departments (name, phone) VALUES ('Administration', 'EXT 4100');

INSERT INTO teachers (dept, name, phone, mobile, employed_at, birth_date, salary)
VALUES
-- T4: no phone at all: falls back to the department; T5: starts with S; T6: born on 3/10
(4, 'Snape', NULL, NULL, '2010-09-01', '1975-10-03', 2500),
-- T5: an s but not at the start; T6: born on 10/3
(4, 'Moss', 'EXT 4101', NULL, '2018-01-15', '1985-03-10', 1800),
-- T7: a third Administration teacher who is not in the top 2
(4, 'Gaskell', NULL, '0485 12 34 56', '2020-05-04', '1992-07-21', 1200),
-- T3: Engineering is Sci too
(3, 'Gearwick', 'EXT 3001', NULL, '2016-04-11', '1983-06-27', 2200);


-- COMPANY

-- C1: one laptop loses 64 GB, another gains it
UPDATE products SET attributes = jsonb_set(attributes, '{ram_gb}', '16')
WHERE id = (SELECT MIN(id) FROM products WHERE category = 'Laptop' AND attributes->>'ram_gb' = '64');
UPDATE products SET attributes = jsonb_set(attributes, '{ram_gb}', '64')
WHERE id = (SELECT MIN(id) FROM products WHERE category = 'Laptop' AND attributes->>'ram_gb' = '8');

-- C2: one phone turns pink, another loses it
UPDATE products SET attributes = jsonb_set(attributes, '{colors}', (attributes->'colors') || '"pink"'::jsonb)
WHERE id = (SELECT MIN(id) FROM products WHERE category = 'Phone' AND NOT attributes->'colors' ? 'pink');
UPDATE products SET attributes = jsonb_set(attributes, '{colors}', (attributes->'colors') - 'pink')
WHERE id = (SELECT MAX(id) FROM products WHERE category = 'Phone' AND attributes->'colors' ? 'pink');

-- C3
UPDATE products SET attributes = jsonb_set(attributes, '{cpu}', '"i9"')
WHERE id = (SELECT MIN(id) FROM products WHERE category = 'Laptop' AND attributes->>'cpu' = 'i5');

-- C4/C5: a Sales manager and their team move under Engineering, but keep department 'Sales'
UPDATE employees SET manager_id = 3
WHERE id = (SELECT MIN(e.id) FROM employees e WHERE e.department = 'Sales' AND e.job_title = 'Sales Manager' AND e.manager_id <> 2);

-- C6/C7/C8/C10: June 2024 triples, so July has the biggest drop
UPDATE order_lines l SET quantity = l.quantity * 3
FROM orders o
WHERE o.id = l.order_id AND o.ordered_at >= '2024-06-01' AND o.ordered_at < '2024-07-01';

-- C6/C10: a day of cancelled orders
UPDATE orders SET status = 'cancelled' WHERE ordered_at >= '2024-03-15' AND ordered_at < '2024-03-16';

-- C9/C10: an extra outage
DELETE FROM order_lines WHERE order_id IN (SELECT id FROM orders WHERE ordered_at >= '2023-05-10' AND ordered_at < '2023-05-13');
DELETE FROM orders WHERE ordered_at >= '2023-05-10' AND ordered_at < '2023-05-13';
