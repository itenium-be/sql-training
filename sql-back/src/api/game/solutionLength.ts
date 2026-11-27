/** Character count used for the shortest-solution award.
 *
 * Whitespace and one trailing semicolon are ignored so that `SELECT 1;` and
 * `SELECT 1` count the same.
 */
export function solutionLength(solution: string): number {
  return solution.replace(/\s/g, "").replace(/;$/, "").length;
}
