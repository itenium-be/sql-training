import { describe, expect, test } from "bun:test";
import { filterSchemaForGame, type SqlSchema } from "./sqlCheck";

const pgSchema: SqlSchema = {
  countries: ["id", "name"],
  teachers: ["id", "name", "dept"],
  departments: ["id", "name"],
  employees: ["id", "name"],
  customers: ["id", "name"],
  products: ["id", "name"],
  orders: ["id"],
  order_lines: ["id"],
};

describe("filterSchemaForGame", () => {
  test("keeps only the selected game's tables", () => {
    expect(Object.keys(filterSchemaForGame("Teachers", pgSchema))).toEqual(["teachers", "departments"]);
    expect(Object.keys(filterSchemaForGame("World", pgSchema))).toEqual(["countries"]);
    expect(Object.keys(filterSchemaForGame("Company", pgSchema))).toEqual([
      "employees",
      "customers",
      "products",
      "orders",
      "order_lines",
    ]);
  });

  test("passes columns through unchanged", () => {
    expect(filterSchemaForGame("World", pgSchema)).toEqual({ countries: ["id", "name"] });
  });

  test("leaves an unmapped game (SQL Server) untouched", () => {
    const mssql: SqlSchema = { matches: ["id"], goals: ["id"] };
    expect(filterSchemaForGame("Worldcup", mssql)).toEqual(mssql);
  });
});
