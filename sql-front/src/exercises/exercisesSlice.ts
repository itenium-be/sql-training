import { createSlice } from '@reduxjs/toolkit'
import { ExerciseId, ExerciseModel, Score } from './exerciseModels'
import { exercises } from './exercises';

type StoreState = {
  entities: ExerciseModel[];
  selected: ExerciseId | null;
  userName: string;
  scores: Score[];
  World: ExerciseState;
  Teachers: ExerciseState;
  Worldcup: ExerciseState;
}

type ExerciseState = {
  exampleData: any[];
  currentExercise: number;
}

const initialState: StoreState = {
  entities: exercises,
  selected: null,
  userName: '',
  scores: [],
  World: {
    exampleData: [],
    currentExercise: 1,
  },
  Teachers: {
    exampleData: [],
    currentExercise: 1,
  },
  Worldcup: {
    exampleData: [],
    currentExercise: 1,
  },
}

export const exercisesSlice = createSlice({
  name: 'exercises',
  initialState,
  reducers: {
    switch: (state, action) => {
      if (action.payload.key === 'home') {
        state.selected = null;
      } else {
        state.selected = action.payload.key as ExerciseId;
        state[state.selected].exampleData = action.payload.data;
        state[state.selected].currentExercise = 1;
      }
    },
    nextQuestion: state => {
      if (state.selected) {
        state[state.selected].currentExercise++;
      }
    },
    prevQuestion: state => {
      if (state.selected) {
        state[state.selected].currentExercise--;
      }
    },
    firstQuestion: state => {
      if (state.selected) {
        state[state.selected].currentExercise = 1;
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
