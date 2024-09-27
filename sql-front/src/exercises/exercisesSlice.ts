import { createSlice } from '@reduxjs/toolkit'
import { ExerciseModel, exercises } from './exerciseModels'

type StoreState = {
  entities: ExerciseModel[];
  selected: string | null;
  exampleData: any[];
}

const initialState: StoreState = {
  entities: exercises,
  selected: null,
  exampleData: [],
}

export const exercisesSlice = createSlice({
  name: 'exercises',
  initialState,
  reducers: {
    switch: (state, action) => {
      if (action.payload.key === 'home') {
        state.selected = null
        state.exampleData = [];
      } else {
        state.selected = action.payload.key
        state.exampleData = action.payload.data
      }
    },
  },
})


export const { switch } = exercisesSlice.actions

export default exercisesSlice.reducer
