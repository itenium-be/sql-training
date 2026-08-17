import { createSlice } from '@reduxjs/toolkit'
import { ExerciseId, ExerciseModel, Score } from './exerciseModels'

type StoreState = {
  entities: ExerciseModel[];
  selected: ExerciseId | null;
  currentExercise: number;
  userName: string;
  scores: Score[];
  World: ExerciseState;
  Teachers: ExerciseState;
  Worldcup: ExerciseState;
}

type ExerciseState = {
  exampleData: any[];
}

const initialState: StoreState = {
  // Fetched from the backend: the browser is not shipped the exercises.
  entities: [],
  selected: null,
  currentExercise: 0,
  userName: '',
  scores: [],
  World: {
    exampleData: [],
  },
  Teachers: {
    exampleData: [],
  },
  Worldcup: {
    exampleData: [],
  },
}

export const exercisesSlice = createSlice({
  name: 'exercises',
  initialState,
  reducers: {
    switch: (state, action) => {
      state.currentExercise = 0;
      if (action.payload.key === 'home') {
        state.selected = null;
      } else {
        state.selected = action.payload.key as ExerciseId;
        state[state.selected].exampleData = action.payload.data;
      }
    },
    nextQuestion: state => {
      if (state.selected) {
        state.currentExercise++;
      }
    },
    prevQuestion: state => {
      if (state.selected) {
        state.currentExercise--;
      }
    },
    firstQuestion: state => {
      if (state.selected) {
        state.currentExercise = 1;
      }
    },
    setExercises: (state, action) => {
      state.entities = action.payload;
    },
    register: (state, action) => {
      state.userName = action.payload;
    },
    setScores: (state, action) => {
      state.scores = action.payload;
      // postgres NUMERIC arrives as a string, and rows written before a metric
      // existed arrive as null.
      const toNumber = (value: any, fallback = 0) => {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : fallback;
      };

      state.scores = state.scores.map(score => ({
        ...score,
        exerciseid: toNumber(score.exerciseid),
        solutionlength: toNumber(score.solutionlength),
        elapsed: toNumber(score.elapsed),
        attempts: toNumber(score.attempts, 1),
        hintsused: toNumber(score.hintsused),
        reads: toNumber(score.reads),
        plannercost: toNumber(score.plannercost),
        rowsscanned: toNumber(score.rowsscanned),
      }))
    }
  },
})

export default exercisesSlice.reducer
