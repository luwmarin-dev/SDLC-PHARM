import type { ReactNode } from "react";
import styled from "styled-components";

interface Props {
  children: ReactNode;
  className?: string;
}

// Defined at module scope: creating it inside the component would generate a
// brand-new class (and stylesheet entry) on every single render.
const Container = styled.div`
  margin: 0 auto;
  max-width: 1440px;
  height: auto;
  /* Side padding only: a shorthand here would override any py-* class
     callers pass through className. */
  padding-left: 1rem;
  padding-right: 1rem;
`;

const StyledContainer = ({ children, className }: Props) => (
  <Container className={className}>{children}</Container>
);

export default StyledContainer;
