-- Postgres DB
-- Exercises: Company
-- ~2.5M generated rows, deterministic (md5 based) so the expected results never change

CREATE FUNCTION pg_temp.rnd(k text) RETURNS double precision
LANGUAGE sql IMMUTABLE AS $$
  SELECT ((('x' || substr(md5(k), 1, 8))::bit(32)::int)::bigint + 2147483648) / 4294967296.0
$$;

CREATE FUNCTION pg_temp.pick(k text, arr text[]) RETURNS text
LANGUAGE sql IMMUTABLE AS $$
  SELECT arr[1 + floor(pg_temp.rnd(k) * array_length(arr, 1))::int]
$$;


-- EMPLOYEES

CREATE TABLE employees (
  id INT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  manager_id INT REFERENCES employees(id),
  department VARCHAR(50),
  job_title VARCHAR(100) NOT NULL,
  hired_at DATE NOT NULL,
  salary INT NOT NULL
);

WITH names AS (
  SELECT
    ARRAY['Emma','Liam','Olivia','Noah','Louise','Arthur','Mila','Jules','Elena','Lucas',
          'Julia','Adam','Marie','Victor','Lina','Finn','Nora','Jack','Anna','Leon',
          'Sofia','Mohamed','Hanna','Louis','Lotte','Matteo','Fien','Vic','Ella','Kobe',
          'Sara','Wout','Ines','Lars','Amber','Milan','Zoe','Bram','Lisa','Senne'] AS firsts,
    ARRAY['Peeters','Janssens','Maes','Jacobs','Mertens','Willems','Claes','Goossens','Wouters','De Smet',
          'Dubois','Lambert','Dupont','Martin','Simon','Laurent','Leroy','Hermans','Michiels','Aerts',
          'Smets','Vermeulen','Van den Broeck','Desmet','Coppens','Lemmens','Verstraete','Pauwels','Stevens','Cools',
          'Leclercq','Renard','Bogaert','Segers','De Backer','Verhoeven','Martens','Bosmans','Thys','Gevaert'] AS lasts
)
INSERT INTO employees (id, name, manager_id, job_title, hired_at, salary)
SELECT
  i,
  firsts[1 + ((i * 641) % 1600) / 40] || ' ' || lasts[1 + ((i * 641) % 1600) % 40],
  CASE
    WHEN i = 1 THEN NULL
    WHEN i <= 7 THEN 1
    ELSE 2 + floor((i - 2) * (0.05 + 0.25 * pg_temp.rnd('mgr' || i)))::int
  END,
  '',
  DATE '2008-01-01' + (i * 3 + floor(pg_temp.rnd('hired' || i) * 900)::int),
  2500 + floor(pg_temp.rnd('salary' || i) * 3000)::int
FROM names, generate_series(1, 1500) i;

UPDATE employees SET department = d.name, job_title = 'Head of ' || d.name, salary = salary + 6000
FROM (VALUES (2, 'Sales'), (3, 'Engineering'), (4, 'Support'), (5, 'Marketing'), (6, 'Finance'), (7, 'HR')) d(id, name)
WHERE employees.id = d.id;

UPDATE employees SET department = NULL, job_title = 'CEO', salary = 15000 WHERE id = 1;

WITH RECURSIVE tree AS (
  SELECT id, department FROM employees WHERE id BETWEEN 2 AND 7
  UNION ALL
  SELECT e.id, t.department FROM employees e JOIN tree t ON e.manager_id = t.id
)
UPDATE employees e SET department = t.department FROM tree t WHERE e.id = t.id AND e.id > 7;

UPDATE employees e SET
  job_title = CASE WHEN EXISTS (SELECT 1 FROM employees r WHERE r.manager_id = e.id) THEN e.department || ' Manager'
    ELSE CASE e.department
      WHEN 'Sales' THEN 'Account Executive'
      WHEN 'Engineering' THEN 'Software Engineer'
      WHEN 'Support' THEN 'Support Agent'
      WHEN 'Marketing' THEN 'Marketeer'
      WHEN 'Finance' THEN 'Accountant'
      WHEN 'HR' THEN 'HR Officer'
    END
  END,
  salary = salary + CASE WHEN EXISTS (SELECT 1 FROM employees r WHERE r.manager_id = e.id) THEN 1500 ELSE 0 END
WHERE e.id > 7;

CREATE INDEX ix_employees_manager ON employees(manager_id);


-- CUSTOMERS

CREATE TABLE customers (
  id INT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  country VARCHAR(50) NOT NULL,
  created_at DATE NOT NULL
);

INSERT INTO customers (id, name, country, created_at)
SELECT
  i,
  pg_temp.pick('c1' || i, ARRAY['Blue','Red','Golden','Silver','Green','Rapid','Bright','Royal','Smart','Happy',
                                 'Brave','Clever','Swift','Urban','North','Iron','Crystal','Lucky','Wild','Quiet'])
  || ' ' ||
  pg_temp.pick('c2' || i, ARRAY['Falcon','Bakery','Systems','Logistics','Garden','Media','Builders','Pixel','Harbor','Studio',
                                 'Coffee','Labs','Farm','Motors','Design','Consulting','Bikes','Books','Fitness','Kitchen'])
  || ' ' ||
  pg_temp.pick('c3' || i, ARRAY['BV','NV','SA','SRL','GmbH','Ltd','BVBA','& Co']),
  pg_temp.pick('c4' || i, ARRAY['Belgium','Belgium','Belgium','Belgium','Netherlands','Netherlands','Netherlands',
                                 'France','France','Germany','Germany','Luxembourg','Spain','Italy']),
  DATE '2022-01-01' + floor(sqrt(pg_temp.rnd('c5' || i)) * 1277)::int
FROM generate_series(1, 50000) i;


-- PRODUCTS

CREATE TABLE products (
  id INT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  attributes JSONB NOT NULL
);

WITH base AS (
  SELECT
    i,
    (ARRAY['Laptop','Monitor','Phone','Headset','Keyboard','Mouse','Chair','Desk'])[1 + (i - 1) % 8] AS category,
    pg_temp.rnd('p1' || i) AS r1,
    pg_temp.rnd('p2' || i) AS r2,
    pg_temp.rnd('p3' || i) AS r3
  FROM generate_series(1, 240) i
),
brand AS (
  SELECT base.*,
    CASE
      WHEN category IN ('Laptop','Monitor','Phone') THEN pg_temp.pick('b' || i, ARRAY['Lumen','Corvex','Nimbus','Apex','Zento'])
      WHEN category IN ('Headset','Keyboard','Mouse') THEN pg_temp.pick('b' || i, ARRAY['Corvex','Apex','Klikk','Sonora'])
      ELSE pg_temp.pick('b' || i, ARRAY['Ergon','Sitwell','Oakline'])
    END AS brand,
    (SELECT jsonb_agg(c ORDER BY c) FROM (
      SELECT DISTINCT pg_temp.pick('col' || i || '-' || n, ARRAY['black','black','silver','white','blue','grey','pink','green','red']) AS c
      FROM generate_series(1, 1 + floor(r3 * 3)::int) n) x) AS colors
  FROM base
)
INSERT INTO products (id, name, category, price, attributes)
SELECT
  i,
  brand || ' ' || category || ' ' || (100 + i * 7 % 900)::text,
  category,
  round((CASE category
    WHEN 'Laptop' THEN 700 + r1 * 1800
    WHEN 'Monitor' THEN 150 + r1 * 650
    WHEN 'Phone' THEN 250 + r1 * 1100
    WHEN 'Headset' THEN 40 + r1 * 260
    WHEN 'Keyboard' THEN 25 + r1 * 175
    WHEN 'Mouse' THEN 15 + r1 * 115
    WHEN 'Chair' THEN 120 + r1 * 680
    ELSE 200 + r1 * 900
  END)::numeric, 0) - 0.01,
  CASE category
    WHEN 'Laptop' THEN jsonb_build_object(
      'brand', brand,
      'ram_gb', (ARRAY[8,16,16,32,32,64])[1 + floor(r2 * 6)::int],
      'cpu', pg_temp.pick('cpu' || i, ARRAY['i5','i7','i9','Ryzen 5','Ryzen 7','M3']),
      'screen_inch', (ARRAY[13.3,14,15.6,16])[1 + floor(r1 * 4)::int],
      'colors', colors)
    WHEN 'Monitor' THEN jsonb_build_object(
      'brand', brand,
      'screen_inch', (ARRAY[24,27,27,32,34])[1 + floor(r1 * 5)::int],
      'resolution', pg_temp.pick('res' || i, ARRAY['1920x1080','2560x1440','3840x2160']),
      'refresh_hz', (ARRAY[60,75,144,165,240])[1 + floor(r2 * 5)::int])
    WHEN 'Phone' THEN jsonb_build_object(
      'brand', brand,
      'storage_gb', (ARRAY[64,128,256,512])[1 + floor(r2 * 4)::int],
      '5g', r1 > 0.3,
      'colors', colors)
    WHEN 'Headset' THEN jsonb_build_object(
      'brand', brand,
      'wireless', r2 > 0.4,
      'noise_cancelling', r1 > 0.5,
      'colors', colors)
    WHEN 'Keyboard' THEN jsonb_build_object(
      'brand', brand,
      'layout', pg_temp.pick('lay' || i, ARRAY['AZERTY','QWERTY','QWERTZ']),
      'wireless', r2 > 0.5)
    WHEN 'Mouse' THEN jsonb_build_object(
      'brand', brand,
      'wireless', r2 > 0.3,
      'colors', colors)
    WHEN 'Chair' THEN jsonb_build_object(
      'brand', brand,
      'adjustable', r2 > 0.2,
      'colors', colors)
    ELSE jsonb_build_object(
      'brand', brand,
      'width_cm', (ARRAY[120,140,160,180])[1 + floor(r2 * 4)::int],
      'adjustable', r1 > 0.6)
  END
FROM brand;


-- ORDERS

CREATE TABLE orders (
  id INT PRIMARY KEY,
  customer_id INT NOT NULL REFERENCES customers(id),
  employee_id INT NOT NULL REFERENCES employees(id),
  ordered_at TIMESTAMP NOT NULL,
  status VARCHAR(20) NOT NULL
);

CREATE TABLE order_lines (
  order_id INT NOT NULL REFERENCES orders(id),
  line_no INT NOT NULL,
  product_id INT NOT NULL REFERENCES products(id),
  quantity INT NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,
  PRIMARY KEY (order_id, line_no)
);

-- Webshop down: no orders on these days
CREATE TEMP TABLE open_days AS
SELECT row_number() OVER (ORDER BY d)::int AS idx, d::date AS d
FROM generate_series(DATE '2023-01-01', DATE '2025-12-31', INTERVAL '1 day') d
WHERE d::date NOT BETWEEN DATE '2023-08-14' AND DATE '2023-08-16'
  AND d::date NOT BETWEEN DATE '2024-03-11' AND DATE '2024-03-12'
  AND d::date NOT BETWEEN DATE '2025-01-27' AND DATE '2025-01-31'
  AND to_char(d, 'MM-DD') <> '12-25';

CREATE TEMP TABLE customer_first_day AS
SELECT c.id, COALESCE((SELECT min(idx) FROM open_days WHERE d >= c.created_at), 1) AS first_idx
FROM customers c;

WITH const AS (
  SELECT
    (SELECT array_agg(id ORDER BY id) FROM employees WHERE job_title = 'Account Executive') AS reps,
    (SELECT array_agg(d ORDER BY idx) FROM open_days) AS days
)
INSERT INTO orders (id, customer_id, employee_id, ordered_at, status)
SELECT
  o.i,
  o.customer_id,
  reps[1 + (o.customer_id * 7919 + floor(pg_temp.rnd('rep' || o.i) * 3)::int) % array_length(reps, 1)],
  days[cf.first_idx + floor(o.rd * (array_length(days, 1) - cf.first_idx + 1))::int] + make_interval(secs => floor(pg_temp.rnd('t' || o.i) * 86400)::int),
  CASE WHEN o.rs < 0.06 THEN 'cancelled' WHEN o.rs < 0.10 THEN 'returned' ELSE 'delivered' END
FROM const, (
  SELECT i,
    1 + floor(pg_temp.rnd('cust' || i) * 50000)::int AS customer_id,
    pg_temp.rnd('day' || i) AS rd,
    pg_temp.rnd('status' || i) AS rs
  FROM generate_series(1, 600000) i
) o
JOIN customer_first_day cf ON cf.id = o.customer_id;

INSERT INTO order_lines (order_id, line_no, product_id, quantity, unit_price)
SELECT
  o.id,
  n,
  p.id,
  1 + floor(power(pg_temp.rnd('q' || o.id || '-' || n), 4) * 10)::int,
  round(p.price * (ARRAY[1, 1, 1, 1, 0.9, 0.8])[1 + floor(pg_temp.rnd('disc' || o.id || '-' || n) * 6)::int], 2)
FROM orders o
CROSS JOIN LATERAL generate_series(1, 1 + floor(pg_temp.rnd('lines' || o.id) * 5)::int) n
JOIN products p ON p.id = 1 + floor(power(pg_temp.rnd('prod' || o.id || '-' || n), 1.5) * 240)::int;

CREATE INDEX ix_orders_customer ON orders(customer_id);
CREATE INDEX ix_orders_employee ON orders(employee_id);
CREATE INDEX ix_orders_ordered_at ON orders(ordered_at);
CREATE INDEX ix_order_lines_product ON order_lines(product_id);

DROP TABLE open_days, customer_first_day;
