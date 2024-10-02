import { createSlice } from '@reduxjs/toolkit'
import { ExerciseId, ExerciseModel, Score } from './exerciseModels'
import { exercises } from './exercises';

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
  entities: exercises,
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
    register: (state, action) => {
      state.userName = action.payload;
    },
    setScores: (state, action) => {
      state.scores = action.payload;
      state.scores = state.scores.map(score => ({
        ...score,
        exerciseid: +score.exerciseid,
        solutionlength: +score.solutionlength,
        elapsed: +score.elapsed,
      }))
    }
  },
})

export default exercisesSlice.reducer
