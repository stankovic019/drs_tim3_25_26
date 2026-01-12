import styled from "styled-components";

const StyledInput = styled.input`
  --input-focus: #efad21;
  --font-color: #353a7c;
  --font-color-sub: #666;
  --bg-color: #fff;
  --main-color: #353a7c;
  width: 100%;
  height: 50px;
  border-radius: 8px;
  border: 2px solid var(--main-color);
  background-color: var(--bg-color);
  box-shadow: 4px 4px var(--main-color);
  font-size: 15px;
  font-weight: 600;
  color: var(--font-color);
  padding: 8px 12px;
  outline: none;
  transition: all 0.3s ease;

  &::placeholder {
    color: var(--font-color-sub);
    opacity: 0.8;
  }

  &:focus {
    border: 2px solid var(--input-focus);
    box-shadow: 6px 6px var(--input-focus);
  }
`;

export default StyledInput;
