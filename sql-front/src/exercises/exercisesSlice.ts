import { createSlice } from '@reduxjs/toolkit'
import { ExerciseId, ExerciseModel, Score } from './exerciseModels'
import { lastSolvedQuestion } from './lastSolved'
import { normalizeScores } from './normalizeScores'

type StoreState = {
  entities: ExerciseModel[];
  selected: ExerciseId | null;
  currentExercise: number;
  userName: string;
  scores: Score[];
  World: ExerciseState;
  Teachers: ExerciseState;
  Worldcup: ExerciseState;
  Company: ExerciseState;
}

type ExerciseState = {
  exampleData: Record<string, unknown>[];
}

const initialState: StoreState = {
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
  Company: {
    exampleData: [],
  },
}

const exercisesSlice = createSlice({
  name: 'exercises',
  initialState,
  reducers: {
    switch: (state, action) => {
      if (action.payload.key === 'home') {
        state.selected = null;
        state.currentExercise = 0;
      } else {
        state.selected = action.payload.key as ExerciseId;
        state[state.selected].exampleData = action.payload.data;
        state.currentExercise = lastSolvedQuestion(state.scores, state.userName, state.selected);
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
    gotoQuestion: (state, action) => {
      if (state.selected) {
        state.currentExercise = action.payload;
      }
    },
    setEntities: (state, action) => {
      state.entities = action.payload;
    },
    register: (state, action) => {
      state.userName = action.payload;
    },
    setScores: (state, action) => {
      state.scores = normalizeScores(action.payload);
    }
  },
})

export default exercisesSlice.reducer
