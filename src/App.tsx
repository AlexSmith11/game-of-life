import React, { useCallback, useRef, useState } from "react";
import produce from "immer";

const numRows = 50;
const numCols = 50;

/**
 * 0 = dead
 * 1 = alive
 */

// rules of neighbours (their locations in the 2d array)
const operations = [
  [0, 1],
  [0, -1],
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
  [1, 0],
  [-1, 0],
];

const generateEmptyGrid = () => {
  const rows = [];
  for (let i = 0; i < numRows; i++) {
    rows.push(Array.from(Array(numCols), () => 0));
  }

  return rows;
};

const App: React.FC = () => {
  const [grid, setGrid] = useState(() => {
    // this runs once when state is initialised.
    return generateEmptyGrid();
  });

  const [running, setRunning] = useState(false);

  // we need to access running, but running changes. useRef allows access to state while not refreshing runSimulation
  const runningRef = useRef(running);
  runningRef.current = running;

  // want to create separate state & don't want it recreated every render so 'useCallback'
  const runSimulation = useCallback(() => {
    // if we are already running:
    if (!runningRef.current) return;

    // simulate the update
    // run through whole grid and check rules, updating where necessary:
    setGrid((g) => {
      // any time we mutate the gridCopy it will now set the grid
      return produce(g, (gridCopy) => {
        for (let i = 0; i < numRows; i++) {
          for (let k = 0; k < numCols; k++) {
            // find number of neighbours
            let neighbours = 0;
            operations.forEach(([x, y]) => {
              const newI = i + x;
              const newK = k + y;
              // check we didn't go above / below
              if (newI >= 0 && newI < numRows && newK >= 0 && newK < numCols) {
                // if we have a live cell, add to the neighbours
                neighbours += g[newI][newK];
              }
            });

            // rules: determines if a cell is alive or dead
            if (neighbours < 2 || neighbours > 3) {
              gridCopy[i][k] = 0;
            } else if (g[i][k] === 0 && neighbours === 3) {
              gridCopy[i][k] = 1;
            }
          }
        }
      });
    });

    setTimeout(runSimulation, 200);
  }, []);

  return (
    <>
      <button
        onClick={() => {
          setRunning(!running);
          if (!running) {
            runningRef.current = true;
            runSimulation();
          }
        }}
      >
        {running ? "stop" : "start"}
      </button>

      <button
        onClick={() => {
          setGrid(generateEmptyGrid());
        }}
      >
        clear
      </button>

      <button
        onClick={() => {
          const rows = [];
          for (let i = 0; i < numRows; i++) {
            rows.push(
              Array.from(Array(numCols), () => (Math.random() > 0.5 ? 1 : 0))
            );
          }

          setGrid(rows);
        }}
      >
        random
      </button>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${numCols}, 20px)`,
        }}
      >
        {grid.map((rows, i) =>
          rows.map((col, k) => (
            <div
              onClick={() => {
                // want to stop mutation so we use immer 'produce'
                const newGrid = produce(grid, (gridCopy) => {
                  // toggle grid colour
                  gridCopy[i][k] = gridCopy[i][k] ? 0 : 1;
                });

                setGrid(newGrid);
              }}
              key={`${i}-${k}`}
              style={{
                width: 20,
                height: 20,
                backgroundColor: grid[i][k] ? "pink" : undefined,
                border: "solid 1px black",
              }}
            />
          ))
        )}
      </div>
    </>
  );
};

export default App;
