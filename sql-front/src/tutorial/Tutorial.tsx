import { useCallback, useState } from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import exercisesSlice from '../exercises/exercisesSlice';
import { TopNavigation } from '../layout/TopNavigation';
import { Dashboard } from '../dashboard/Dashboard';
import { Exercise } from '../exercises/Exercise';
import { createFakeApi, FakeApi } from './fakeApi';
import { installSandbox } from './sandbox';
import { demoDefinitions, demoOthers, YOU } from './demoData';
import { TourPlayer } from './TourPlayer';
import { STEPS } from './steps';
import { markTutorialSeen } from './autoStart';

let api: FakeApi = createFakeApi();
let realStorage: Storage | null = null;

function sandboxed(): Storage {
  realStorage ??= installSandbox(() => api);
  return realStorage;
}

function demoStore() {
  const store = configureStore({ reducer: { exercises: exercisesSlice } });
  store.dispatch({ type: 'exercises/register', payload: YOU });
  store.dispatch({ type: 'exercises/setEntities', payload: demoDefinitions });
  store.dispatch({ type: 'exercises/setScores', payload: demoOthers });
  return store;
}

export function Tutorial() {
  const [real] = useState(sandboxed);
  const [loop] = useState(() => new URLSearchParams(window.location.search).has('loop'));
  const [run, setRun] = useState(() => ({ id: 0, store: demoStore() }));
  const [tourId, setTourId] = useState(0);

  const resetDemo = useCallback(() => {
    api = createFakeApi();
    localStorage.clear();
    setRun(r => ({ id: r.id + 1, store: demoStore() }));
  }, []);

  const onEnd = useCallback(() => {
    if (loop) {
      resetDemo();
      setTourId(t => t + 1);
      return;
    }
    markTutorialSeen(real);
    window.location.assign('/');
  }, [loop, real, resetDemo]);

  return (
    <>
      <Provider key={`demo-${run.id}`} store={run.store}>
        <MemoryRouter>
          <Container className="df-app">
            <TopNavigation />
            <Routes>
              <Route path="/" element={<Dashboard />} />
              {demoDefinitions.map(ex => <Route key={ex.id} path={ex.id} element={<Exercise exercise={ex} />} />)}
            </Routes>
          </Container>
        </MemoryRouter>
      </Provider>
      <TourPlayer key={`tour-${tourId}`} steps={STEPS} loop={loop} onEnd={onEnd} onRewind={resetDemo} />
    </>
  );
}
