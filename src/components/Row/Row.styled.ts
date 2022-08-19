import { Box } from "components/Box/Box"
import styled from "styled-components/macro"
import { theme } from "theme"

export const StyledRightSide = styled(Box)`
  font-size: 14px;
  line-height: 22px;
  color: ${theme.colors.white};

  p {
    font-size: 14px;
    line-height: 22px;
  }
`