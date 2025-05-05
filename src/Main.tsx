import "./App.css";
import styled from "@emotion/styled";
import { useCallback, useState } from "react";

import Switch from "./components/Switch";
import Task from "./components/Task";
import * as automerge from "@automerge/automerge/next";
import useSyncedDocument from "./useSyncedDocument";
import { keyframes } from "@emotion/react";

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  background-color: var(--background);
  color: #f1f1f1;
  font-family: Monocraft;
  display: grid;
  gap: 10px;
  grid-template-areas:
    ". header ."
    ". main .";
  grid-template-columns: minmax(20px, 1fr) minmax(300px, 500px) minmax(
      20px,
      1fr
    );
  grid-template-rows: max-content 1fr;
  overflow-y: auto;
`;

const Header = styled.div`
  grid-area: header;
  font-size: 30px;
  padding: 15px 0;
  border-bottom: 1px solid currentColor;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const MainColumn = styled.div`
  grid-area: main;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 0 0 200px 0;
`;

const Button = styled.button`
  font-size: 16px;
  font-family: Monocraft;
  border-radius: 8px;
  height: 40px;
  width: 100%;
  cursor: pointer;
  border: 0;
  color: var(--background);
`;

const Spin = keyframes`
  0% {
    transform: rotateZ(0deg);
  }

  100% {
    transform: rotateZ(360deg);
  }
`;

const Spinner = styled.div`
  width: 50px;
  height: 50px;
  margin: 20px auto;
  animation: ${Spin} 2s infinite linear;
  background-color: var(--white);
  border-radius: 10px;
`;

const EmptyMessage = styled.div`
  font-family: Monocraft;
  font-size: 12px;
  color; var(--white);
  margin: 0 auto;
  line-height: 30px;
`;

function Main({ docName }: { docName: string }) {
  const [isOnline, setIsOnline] = useState(true);
  const { document: doc, mutate } = useSyncedDocument(docName, isOnline);

  const addTask = useCallback(() => {
    mutate((doc) => {
      doc.tasks ??= [];
      doc.tasks.push({
        done: false,
        name: "New Task",
      });
    });
  }, [mutate]);

  const changeTaskStatus = useCallback(
    (taskIndex: number) => (value: boolean) => {
      mutate((doc) => {
        doc.tasks ??= [];
        doc.tasks[taskIndex].done = value;
      });
    },
    [mutate],
  );

  const changeTaskName = useCallback(
    (taskIndex: number) => (value: string) => {
      mutate((doc) => {
        doc.tasks ??= [];
        automerge.updateText(doc.tasks[taskIndex], ["name"], value);
      });
    },
    [mutate],
  );

  return (
    <Container>
      <Header>
        <div>Yatl</div>
        <Switch value={isOnline} onChange={setIsOnline} />
      </Header>
      <MainColumn>
        {doc ? (
          <>
            {doc?.tasks?.length ? (
              doc?.tasks?.map((task, taskIndex) => (
                <Task
                  key={taskIndex}
                  checked={task.done}
                  onChangeChecked={changeTaskStatus(taskIndex)}
                  taskName={task.name}
                  onChangeTaskName={changeTaskName(taskIndex)}
                />
              ))
            ) : (
              <EmptyMessage>No tasks yet</EmptyMessage>
            )}
            <Button onClick={addTask}>Yet Another Task</Button>
          </>
        ) : (
          <Spinner />
        )}
      </MainColumn>
    </Container>
  );
}

export default Main;
