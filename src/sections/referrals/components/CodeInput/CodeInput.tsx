import ChainlinkIcon from "assets/icons/ChainlinkIcon.svg?react"
import { InputHTMLAttributes, forwardRef } from "react"
import { SErrorMessage, SInput, SInputWrapper } from "./CodeInput.styled"
import { Button } from "components/Button/Button"
import { useTranslation } from "react-i18next"
import { randomAlphanumericString } from "utils/helpers"
import DiceIcon from "assets/icons/DiceIcon.svg?react"
import { REFERRAL_CODE_MAX_LENGTH } from "sections/referrals/ReferralsPage.utils"

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> & {
  error?: string
  onChange: (value: string) => void
}

export const CodeInput = forwardRef<HTMLInputElement, InputProps>(
  ({ onChange, className, error, ...props }, ref) => {
    const { t } = useTranslation()
    return (
      <SInputWrapper className={className}>
        <ChainlinkIcon />
        <SInput
          ref={ref}
          autoComplete="off"
          hasError={!!error}
          sx={!props.disabled ? { pr: [40, 180] } : {}}
          {...props}
          onChange={(e) => onChange?.(e.target.value)}
        />
        {!props.disabled && (
          <Button
            size="micro"
            type="button"
            sx={{ px: [0, 6], py: [0, 2] }}
            onClick={() =>
              onChange?.(randomAlphanumericString(REFERRAL_CODE_MAX_LENGTH))
            }
          >
            <DiceIcon sx={{ width: [24, 10], height: [24, 10], mr: [0, -4] }} />
            <span sx={{ display: ["none", "inline"] }}>
              {t("referrals.button.randomCode")}
            </span>
          </Button>
        )}
        {error && <SErrorMessage>{error}</SErrorMessage>}
      </SInputWrapper>
    )
  },
)