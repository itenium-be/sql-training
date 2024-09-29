import { createSlice } from '@reduxjs/toolkit'
import { ExerciseId, ExerciseModel, exercises } from './exerciseModels'

type StoreState = {
  entities: ExerciseModel[];
  selected: ExerciseId | null;
  World: ExerciseState;
  Nobel: ExerciseState;
}

type ExerciseState = {
  exampleData: any[];
  currentExercise: number;
}

const initialState: StoreState = {
  entities: exercises,
  selected: null,
  World: {
    exampleData: [],
    currentExercise: 1,
  },
  Nobel: {
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
        state.selected = null
      } else {
        state.selected = action.payload.key as ExerciseId
        state[action.payload.key as ExerciseId].exampleData = action.payload.data
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
    }
  },
})


export const { switch, nextQuestion, prevQuestion } = exercisesSlice.actions

export default exercisesSlice.reducer
