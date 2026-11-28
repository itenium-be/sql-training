import { expect, test } from "bun:test";
import { exercises } from "./exercises";

// The frontend shows the database engine as an icon next to each dataset.
test.each(exercises.map(game => [game.id, game.desc]))("%s description does not name the database engine", (_id, desc) => {
  expect(desc).not.toMatch(/postgres|sql server/i);
});
