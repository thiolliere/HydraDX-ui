import BigNumber from "bignumber.js"
import { useAssetMeta } from "api/assetMeta"
import { useAccountCurrency } from "api/payments"
import { usePaymentInfo } from "api/transaction"
import { Button } from "components/Button/Button"
import { Modal } from "components/Modal/Modal"
import { Text } from "components/Typography/Text/Text"
import { Controller, useForm } from "react-hook-form"
import { Trans, useTranslation } from "react-i18next"
import { useApiPromise } from "utils/api"
import { FormValues } from "utils/helpers"
import { useAccountStore, useStore } from "../../../state/store"
import { OrderAssetPrice } from "./cmp/AssetPrice"
import { OrderAssetGet, OrderAssetPay } from "./cmp/AssetSelect"
import { OfferingPair } from "../orders/OtcOrdersData.utils"
import { useTokenBalance } from "api/balances"
import { BN_10 } from "utils/constants"
import { useEffect } from "react"

type PlaceOrderProps = {
  orderId: string
  offering: OfferingPair
  accepting: OfferingPair
  onClose: () => void
  onSuccess: () => void
}

export const FillOrder = ({
  orderId,
  offering,
  accepting,
  onClose,
  onSuccess,
}: PlaceOrderProps) => {
  const { t } = useTranslation()
  const { account } = useAccountStore()

  const form = useForm<{
    amountIn: string
  }>({
    defaultValues: {
      amountIn: accepting.amount.toFixed(),
    },
  })

  useEffect(() => {
    form.trigger()
  }, [form])

  const api = useApiPromise()
  const assetInMeta = useAssetMeta(accepting.asset)
  const assetInBalance = useTokenBalance(accepting.asset, account?.address)
  const assetOutMeta = useAssetMeta(offering.asset)
  const accountCurrency = useAccountCurrency(account?.address)
  const accountCurrencyMeta = useAssetMeta(accountCurrency.data)
  const { createTransaction } = useStore()

  const { data: paymentInfoData } = usePaymentInfo(api.tx.otc.fillOrder(""))

  const price = accepting.amount.div(offering.amount)

  const handleSubmit = async (values: FormValues<typeof form>) => {
    await createTransaction(
      {
        tx: api.tx.otc.fillOrder(orderId),
      },
      {
        onSuccess,
        onSubmitted: () => {
          onClose()
          form.reset()
        },
        toast: {
          onLoading: (
            <Trans t={t} i18nKey="otc.order.fill.toast.onLoading" tOptions={{}}>
              <span />
              <span className="highlight" />
            </Trans>
          ),
          onSuccess: (
            <Trans t={t} i18nKey="otc.order.fill.toast.onSuccess" tOptions={{}}>
              <span />
              <span className="highlight" />
            </Trans>
          ),
        },
      },
    )
  }

  return (
    <Modal
      open={true}
      withoutOutsideClose
      title={t("otc.order.fill.title")}
      onClose={() => {
        onClose()
        form.reset()
      }}
    >
      <Text fs={16} color="basic400" sx={{ mt: 10, mb: 22 }}>
        {t("otc.order.fill.desc")}
      </Text>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        autoComplete="off"
        sx={{
          flex: "column",
          justify: "space-between",
        }}
      >
        <Controller
          name="amountIn"
          control={form.control}
          rules={{
            validate: {
              maxBalance: (value) => {
                const balance = assetInBalance.data?.balance
                const decimals = assetInMeta.data?.decimals.toString()
                if (
                  balance &&
                  decimals &&
                  balance.gte(
                    new BigNumber(value).multipliedBy(BN_10.pow(decimals)),
                  )
                ) {
                  return true
                }
                return t("otc.order.fill.validation.notEnoughBalance")
              },
            },
          }}
          render={({ field: { value }, fieldState: { error } }) => (
            <OrderAssetPay
              title={t("otc.order.fill.payTitle")}
              value={value}
              asset={accepting.asset}
              balance={assetInBalance.data?.balance}
              readonly={true}
              error={error?.message}
            />
          )}
        />
        <OrderAssetPrice
          inputAsset={assetOutMeta.data?.symbol}
          outputAsset={assetInMeta.data?.symbol}
          price={price && price.toFixed()}
        />
        <OrderAssetGet
          title={t("otc.order.fill.getTitle")}
          value={offering.amount.toFixed()}
          remaining={offering.amount}
          asset={offering.asset}
          readonly={true}
        />
        <div
          sx={{
            mt: 14,
            flex: "row",
            justify: "space-between",
          }}
        >
          <Text fs={13} color="darkBlue300">
            {t("otc.order.place.fee")}
          </Text>
          <div sx={{ flex: "row", align: "center", gap: 4 }}>
            {paymentInfoData?.partialFee != null && (
              <Text fs={14}>
                {t("otc.order.place.feeValue", {
                  amount: new BigNumber(paymentInfoData.partialFee.toHex()),
                  symbol: accountCurrencyMeta.data?.symbol,
                  fixedPointScale: accountCurrencyMeta.data?.decimals,
                })}
              </Text>
            )}
          </div>
        </div>
        <Button
          sx={{ mt: 20 }}
          variant="primary"
          disabled={!form.formState.isValid}
        >
          {t("otc.order.fill.confirm")}
        </Button>
      </form>
    </Modal>
  )
}