import "./App.css";
import * as automerge from "@automerge/automerge";
import styled from "@emotion/styled";
import React, { useState } from "react";

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  background-color: #0d1016;
  color: #f1f1f1;
  font-family: mono-space;
  display: grid;
  grid-template-areas:
    ". header ."
    ". main .";
  grid-template-columns: minmax(20px, 1fr) minmax(300px, 800px) minmax(
      20px,
      1fr
    );
  grid-template-rows: max-content 1fr;
`;

const Header = styled.div`
  grid-area: header;
  font-size: 30px;
  padding: 15px 0;
  border-bottom: 1px solid currentColor;
`;

const MainColumn = styled.div`
  grid-area: main;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const Button = styled.button`
  font-size: 16px;
  border-radius: 8px;
  height: 40px;
  width: 100%;
  background-color:;
`;

type TaskDocument = {
  tasks: Array<{
    name: string;
    done: boolean;
  }>;
};

function App() {
  const foo: string = 2;

  const doc = useState(() =>
    automerge.init<TaskDocument>("someId", {
      tasks: [],
    }),
  );

  return (
    <Container>
      <Header>Y.a.t.l.</Header>
      <MainColumn></MainColumn>
    </Container>
  );
}

export default App;
