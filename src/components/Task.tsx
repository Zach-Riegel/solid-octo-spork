import styled from "@emotion/styled";

const Container = styled.div`
  display: grid;
  grid-template-columns: max-content 1fr;
  align-items: center;
  gap: 12px;
  width: 100%;
  height: 30px;
`;

const Checkbox = styled.input`
  color: var(--white);
`;

const Input = styled.input`
  width: 100%;
  font-size: 16px;
  line-height: 24px;
  font-family: Monocraft;
  color: var(--white);
  border: none;
  border-bottom: 1px solid currentColor;
  background-color: var(--background);

  &:focus {
    outline: none;
  }
`;

const Task = ({
  checked,
  onChangeChecked,
  taskName,
  onChangeTaskName,
}: {
  checked: boolean;
  onChangeChecked: (value: boolean) => void;
  taskName: string;
  onChangeTaskName: (value: string) => void;
}) => {
  return (
    <Container>
      <Checkbox
        type="checkbox"
        checked={checked}
        onChange={() => onChangeChecked(!checked)}
      />
      <Input
        type="text"
        value={taskName}
        onChange={(event) => onChangeTaskName(event.target.value)}
      />
    </Container>
  );
};

export default Task;
