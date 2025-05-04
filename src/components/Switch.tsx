import { useId } from "react";
import SrOnly from "../util/SrOnly";
import styled from "@emotion/styled";

const SwitchIndicator = styled.div`
  border: 10px solid #f1f1f1;
  border-radius: 5px;

  translate: 0 0;
  transition: translate 250ms ease-in-out;
`;

const FakedCheckbox = styled.input`
  ${SrOnly};

  &:focus-visible + * {
    outline: 1px solid #f1f1f1;
  }

  &:checked + * {
    background-color: var(--green);
  }

  &:checked + * ${SwitchIndicator} {
    translate: 30px 0;
  }
`;

const Container = styled.div`
  width: 60px;
  height: 30px;
  position: relative;
`;

const SwitchBackground = styled.label`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: var(--red);
  padding: 5px;
  border-radius: 10px;
  cursor: pointer;

  justify-content: flex-start;
  transition: justify-content 250ms ease-in-out, background-color 250ms;
`;

const Switch = ({
  value,
  onChange,
}: {
  value: boolean;
  onChange: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const id = useId();

  return (
    <Container>
      <FakedCheckbox
        checked={value}
        onChange={() => onChange((value) => !value)}
        id={id}
        type="checkbox"
      />
      <SwitchBackground htmlFor={id}>
        <SwitchIndicator />
      </SwitchBackground>
    </Container>
  );
};

export default Switch;
