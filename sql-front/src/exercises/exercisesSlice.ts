import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { exercises } from './exerciseModels'

// const fetchExerciseSampleData = createAsyncThunk<any, string>('exercises/fetch', async () => {
//   const res = await fetch('http://localhost:8080/exercises/sampleData/world', {
//     method: 'GET',
//     headers: { 'Content-Type': 'application/json' },
//   });
//   const data = await res.json();
//   return data.responseObject;
// })

export const exercisesSlice = createSlice({
  name: 'exercises',
  initialState: {
    entities: exercises,
    exampleData: [] as any[],
  },
  reducers: {
    increment: state => {
      state.entities = []
    },
  },
  // extraReducers: (builder) => {
  //   builder
  //     .addCase(fetchExerciseSampleData.pending, (state, action) => {
  //       state.exampleData = []
  //     })
  //     .addCase(fetchExerciseSampleData.fulfilled, (state, action) => {
  //       state.exampleData = action.payload
  //     })
  //     .addCase(fetchExerciseSampleData.rejected, (state, action) => {
  //       state.exampleData = []
  //     })
  // }
})


export const { increment } = exercisesSlice.actions

export default exercisesSlice.reducer
