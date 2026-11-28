import { Target } from './tourEngine';
import { demoAttempts } from './demoData';

export type Action = Target & { do: 'click' } | Target & { do: 'type'; text: string };

export type Step = Target & {
  title: string;
  caption: string;
  /** Run instantly on arrival, before the step's anchor is looked up: the click that leaves the previous screen. */
  enter?: Action[];
  /** Run in order once the cursor reaches the step's anchor. */
  actions?: Action[];
};

const [noFilter, selectStar, noOrder, correct] = demoAttempts.map(a => a.sql);

const submit = (text: string): Action[] => [
  { do: 'type', anchor: 'editor', text },
  { do: 'click', anchor: 'submit' },
];

export const STEPS: Step[] = [
  { anchor: 'posters', title: 'Four playgrounds', caption: 'From easy to expert, each on its own database.' },
  { anchor: 'poster', title: "Let's play", caption: 'Pick a playground to start.' },
  { anchor: 'intro-panel', title: 'Sample', caption: 'A peek at the real tables: get to know the data before you start.', enter: [{ do: 'click', anchor: 'poster' }], actions: [{ do: 'click', anchor: 'intro-sample-tab' }] },
  { anchor: 'intro-panel', title: 'Diagram', caption: 'How the tables relate to each other.', actions: [{ do: 'click', anchor: 'intro-diagram-tab' }] },
  { anchor: 'start', title: 'The clock starts', caption: 'Each question is timed from the moment you first open it. Fastest earns a bonus.' },
  { anchor: 'question', title: 'The question', caption: 'The badge shows the points it is worth. Help and wrong answers lower it.', enter: [{ do: 'click', anchor: 'start' }] },
  { anchor: 'columns', title: 'Expected columns', caption: 'Return exactly these columns. "Order matters" means the row order counts too.' },
  { anchor: 'schema', narrowAnchor: 'schema-tab', title: 'Schema', caption: 'Every table and column. The editor autocompletes them as you type.' },
  { anchor: 'editor', title: 'Write & submit', caption: 'Type your query and submit it, or press Ctrl+Enter.', actions: submit(noFilter) },
  { anchor: 'editor', title: 'Wrong?', caption: 'You can try as often as you like…', actions: [...submit(selectStar), ...submit(noOrder)] },
  { anchor: 'question', title: '…but it costs', caption: 'Every 3 wrong attempts cost a point. Watch the badge.' },
  { anchor: 'expected-tab', title: 'Expected result', caption: 'Stuck? Reveal the rows you should get, for a point.', actions: [{ do: 'click', anchor: 'expected-tab' }, { do: 'click', anchor: 'reveal-expected' }] },
  { anchor: 'result-tab', title: 'Spot the difference', caption: 'Now your result is compared row by row: here only the order is off.', actions: [{ do: 'click', anchor: 'result-tab' }] },
  { anchor: 'hint', title: 'Hint', caption: 'A nudge in the right direction, also for a point.', actions: [{ do: 'click', anchor: 'hint' }] },
  { anchor: 'sample-tab', title: 'Always at hand', caption: 'Sample data and the diagram are one click away while you work.', actions: [{ do: 'click', anchor: 'sample-tab' }] },
  { anchor: 'giveup', title: 'Give up', caption: 'No points, but you get to see the solutions. Skip moves on and lets you come back.' },
  { anchor: 'editor', title: 'Solved!', caption: 'Right answer: the points are yours.', actions: submit(correct) },
  { anchor: 'solutions', title: 'Compare', caption: 'See the reference and the others’ queries. Fastest, Shortest and Leanest each earn a bonus.' },
  { title: 'Your turn', caption: 'That’s all there is to it. Good luck!' },
];
