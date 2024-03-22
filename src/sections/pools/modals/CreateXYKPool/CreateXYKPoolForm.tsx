import { zodResolver } from "@hookform/resolvers/zod"
import { useTokenBalance } from "api/balances"
import { Button } from "components/Button/Button"
import { Separator } from "components/Separator/Separator"
import { useRpcProvider } from "providers/rpcProvider"
import { Controller, useForm } from "react-hook-form"
import { Trans, useTranslation } from "react-i18next"
import { TokensConversion } from "sections/pools/modals/AddLiquidity/components/TokensConvertion/TokensConversion"
import { WalletTransferAssetSelect } from "sections/wallet/transfer/WalletTransferAssetSelect"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { ToastMessage, useStore } from "state/store"
import { BN_0, BN_1 } from "utils/constants"
import {
  CreateXYKPoolFormData,
  createXYKPoolFormSchema,
} from "./CreateXYKPoolForm.utils"
import BigNumber from "bignumber.js"
import { TOAST_MESSAGES } from "state/toasts"

type CreateXYKPoolFormProps = {
  assetA: string
  assetB: string
  onAssetAOpen: () => void
  onAssetBOpen: () => void
  onClose: () => void
}

export const CreateXYKPoolForm = ({
  assetA,
  assetB,
  onClose,
  onAssetAOpen,
  onAssetBOpen,
}: CreateXYKPoolFormProps) => {
  const { t } = useTranslation()

  const { assets } = useRpcProvider()

  const assetAMeta = assets.getAsset(assetA ?? "")
  const assetBMeta = assets.getAsset(assetB ?? "")

  const { account } = useAccount()

  const { data: balanceA } = useTokenBalance(assetA, account?.address)
  const { data: balanceB } = useTokenBalance(assetB, account?.address)

  const form = useForm<CreateXYKPoolFormData>({
    mode: "onChange",
    resolver: zodResolver(
      createXYKPoolFormSchema(
        balanceA?.balance ?? BN_0,
        assetAMeta.decimals,
        balanceB?.balance ?? BN_0,
        assetBMeta.decimals,
      ),
    ),
    defaultValues: {
      assetA: "",
      assetB: "",
    },
  })

  const assetAValue = BigNumber(form.watch("assetA"))
  const assetBValue = BigNumber(form.watch("assetB"))

  const { createTransaction } = useStore()

  const handleSubmit = async (values: CreateXYKPoolFormData) => {
    const toast = TOAST_MESSAGES.reduce((memo, type) => {
      const msType = type === "onError" ? "onLoading" : type
      memo[type] = (
        <Trans
          t={t}
          i18nKey={`liquidity.pool.xyk.create.toast.${msType}`}
          tOptions={{
            symbolA: assetAMeta.symbol,
            symbolB: assetBMeta.symbol,
          }}
        >
          <span />
          <span className="highlight" />
        </Trans>
      )
      return memo
    }, {} as ToastMessage)

    await createTransaction(
      {},
      {
        onClose,
        onBack: () => {},
        onSubmitted: () => {
          form.reset()
        },
        toast,
      },
    )
  }

  return (
    <form
      onSubmit={form.handleSubmit(handleSubmit)}
      autoComplete="off"
      sx={{
        flex: "column",
        justify: "space-between",
        minHeight: "100%",
      }}
    >
      <Controller
        name="assetA"
        control={form.control}
        rules={{
          required: t("wallet.assets.transfer.error.required"),
        }}
        render={({
          field: { name, value, onChange },
          fieldState: { error },
        }) => (
          <WalletTransferAssetSelect
            name={name}
            value={value}
            title={t("liquidity.pool.xyk.amountA")}
            asset={assetA ?? ""}
            onAssetOpen={onAssetAOpen}
            error={error?.message}
            onChange={onChange}
          />
        )}
      />
      <TokensConversion
        label={t("liquidity.pool.xyk.exchangeRate")}
        placeholderValue="-"
        firstValue={
          assetAValue.gt(0)
            ? { amount: BN_1, symbol: assetAMeta.symbol }
            : undefined
        }
        secondValue={
          assetBValue.gt(0)
            ? {
                amount: assetBValue.div(assetAValue),
                symbol: assetBMeta.symbol,
              }
            : undefined
        }
      />
      <Controller
        name="assetB"
        control={form.control}
        rules={{
          required: t("wallet.assets.transfer.error.required"),
        }}
        render={({
          field: { name, value, onChange },
          fieldState: { error },
        }) => (
          <WalletTransferAssetSelect
            name={name}
            value={value}
            title={t("liquidity.pool.xyk.amountB")}
            asset={assetB ?? ""}
            onAssetOpen={onAssetBOpen}
            error={error?.message}
            onChange={onChange}
          />
        )}
      />
      <Separator
        sx={{
          mx: "calc(-1 * var(--modal-content-padding))",
          my: 20,
          width: "auto",
        }}
      />
      <Button variant="primary" type="submit">
        {t("liquidity.pool.create")}
      </Button>
    </form>
  )
}
