import Skeleton from "react-loading-skeleton"
import { ReactComponent as LinkIcon } from "assets/icons/LinkPixeled.svg"
import { Separator } from "components/Separator/Separator"
import { SContainer, SHeader } from "./ReferendumCard.styled"
import { Spacer } from "components/Spacer/Spacer"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { Icon } from "components/Icon/Icon"

export const ReferendumCardSkeleton = ({
  type,
}: {
  type: "toast" | "staking"
}) => {
  const { t } = useTranslation()

  return (
    <SContainer type={type}>
      <SHeader>
        <Skeleton height={13} width={164} />
        <Icon sx={{ color: "brightBlue300" }} icon={<LinkIcon />} />
      </SHeader>

      <Separator color="primaryA15Blue" opacity={0.35} sx={{ my: 16 }} />

      <Skeleton height={23} width={565} />

      <Spacer size={20} />

      <div sx={{ flex: "row", gap: 8, justify: "space-between" }}>
        <Skeleton height={4} width={279} />
        <Skeleton height={4} width={279} />
      </div>

      <Spacer size={4} />

      <div sx={{ flex: "row", justify: "space-between" }}>
        <Text color="white" fs={14} fw={600}>
          {t("toast.sidebar.referendums.aye")}
        </Text>
        <Text color="white" fs={14} fw={600}>
          {t("toast.sidebar.referendums.nay")}
        </Text>
      </div>

      <Spacer size={4} />

      <div sx={{ flex: "row", justify: "space-between" }}>
        <Skeleton height={10} width={100} />
        <Skeleton height={10} width={100} />
      </div>
    </SContainer>
  )
}