import { Box } from "components/Box/Box"
import { Switch } from "components/Switch/Switch"
import { GradientText } from "components/Typography/GradientText/GradientText"
import { Heading } from "components/Typography/Heading/Heading"
import { Text } from "components/Typography/Text/Text"
import { FC } from "react"
import { useTranslation } from "react-i18next"
import {
  useTotalInFarms,
  useTotalInPools,
} from "sections/pools/header/PoolsHeader.utils"
import { useStore } from "state/store"

type Props = {
  showMyPositions: boolean
  onShowMyPositionsChange: (value: boolean) => void
}

export const PoolsHeader: FC<Props> = ({
  showMyPositions,
  onShowMyPositionsChange,
}) => {
  const { t } = useTranslation()

  const { account } = useStore()

  const totalInPools = useTotalInPools()
  const totalInFarms = useTotalInFarms()

  return (
    <>
      <Box flex spread mb={43}>
        <GradientText fs={30} fw={700}>
          {t("pools.header.title")}
        </GradientText>
        {!!account && (
          <Switch
            value={showMyPositions}
            onCheckedChange={onShowMyPositionsChange}
            size="small"
            name="my-positions"
            label={t("pools.header.switch")}
            withLabel
          />
        )}
      </Box>
      <Box flex even mb={40}>
        <Box>
          <Text color="neutralGray300" mb={14}>
            {t("pools.header.valueLocked")}
          </Text>
          <Box flex align="baseline">
            <Heading as="h3" fs={42} fw={900}>
              {t("value.usd", { amount: totalInPools.data })}
            </Heading>
          </Box>
        </Box>
        <Box>
          <Text color="neutralGray300" mb={14}>
            {t("pools.header.valueFarms")}
          </Text>
          <Box flex align="baseline">
            <Heading as="h3" fs={42} fw={900}>
              {t("value.usd", { amount: totalInFarms.data })}
            </Heading>
          </Box>
        </Box>
      </Box>
    </>
  )
}
