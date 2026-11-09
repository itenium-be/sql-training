import { ExerciseModel, Score } from "../exercises/exerciseModels";

type FastestExercise = {
  game: string;
  exerciseId: number;
  exercise: string;
  points: number;
  player: string;
  solution?: string;
  time: number;
}

export function calculateFastest(exercises: ExerciseModel[], scores: Score[]) {
  const fastestTable = exercises.reduce((cur, game) => {
    const gameExs = game.exercises.map(ex => {
      return {
        game: game.id,
        exerciseId: ex.id,
        exercise: ex.desc,
        points: ex.points,
        player: '',
        solution: undefined,
        time: 0,
      }
    })
    return cur.concat(gameExs);
  }, [] as FastestExercise[]);
  // console.log('fastest', fastestTable);
  // console.log('scores', scores);

  fastestTable.forEach(fastest => {
    const exScores = scores
      .filter(score => score.game === fastest.game && score.exerciseid === fastest.exerciseId)
      .sort((a, b) => a.elapsed - b.elapsed);

    if (exScores.length) {
      fastest.player = exScores[0].player;
      fastest.time = exScores[0].elapsed;
      fastest.solution = exScores[0].solution;
    }
  })

  return fastestTable;
}

type LeanestExercise = {
  game: string;
  exerciseId: number;
  exercise: string;
  points: number;
  player: string;
  solution?: string;
  solutionLength: number;
  avgLength: number;
}

export function calculateShortest(exercises: ExerciseModel[], scores: Score[]) {
  const leanestTable = exercises.reduce((cur, game) => {
    const gameExs = game.exercises.map(ex => {
      return {
        game: game.id,
        exerciseId: ex.id,
        exercise: ex.desc,
        points: ex.points,
        player: '',
        solution: undefined,
        solutionLength: 0,
        avgLength: 0,
      }
    })
    return cur.concat(gameExs);
  }, [] as LeanestExercise[]);
  // console.log('fastest', leanestTable);
  // console.log('scores', scores);

  leanestTable.forEach(leanest => {
    const exScores = scores
      .filter(score => score.game === leanest.game && score.exerciseid === leanest.exerciseId)
      .sort((a, b) => a.solutionlength - b.solutionlength);

    if (exScores.length && (exScores.length === 1 || exScores[0].solutionlength !== exScores[1].solutionlength)) {
      leanest.player = exScores[0].player;
      leanest.solutionLength = exScores[0].solutionlength;
      leanest.avgLength = Math.floor(exScores.reduce((acc, value) => acc + value.solutionlength, 0) / exScores.length);
      leanest.solution = exScores[0].solution;
    }
  })

  return leanestTable;
}

type EfficientExercise = {
  game: string;
  exerciseId: number;
  exercise: string;
  points: number;
  player: string;
  solution?: string;
  cost: number;
  avgCost: number;
}

export function calculateEfficient(exercises: ExerciseModel[], scores: Score[]) {
  const efficientTable = exercises.reduce((cur, game) => {
    const gameExs = game.exercises.map(ex => ({
      game: game.id,
      exerciseId: ex.id,
      exercise: ex.desc,
      points: ex.points,
      player: '',
      solution: undefined,
      cost: 0,
      avgCost: 0,
    }));
    return cur.concat(gameExs);
  }, [] as EfficientExercise[]);

  efficientTable.forEach(efficient => {
    const exScores = scores
      .filter(score => score.game === efficient.game && score.exerciseid === efficient.exerciseId && score.cost !== null)
      .sort((a, b) => a.cost! - b.cost! || a.solutionlength - b.solutionlength);

    if (!exScores.length) {
      return;
    }

    const [best, second] = exScores;
    if (second && second.cost === best.cost && second.solutionlength === best.solutionlength) {
      return;
    }

    efficient.player = best.player;
    efficient.cost = best.cost!;
    efficient.avgCost = Math.floor(exScores.reduce((acc, value) => acc + value.cost!, 0) / exScores.length);
    efficient.solution = best.solution;
  });

  return efficientTable;
}
