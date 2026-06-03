type CheckoutCommitmentCardProps = {
  amount: number
  currency: string
  mode: "full" | "installments"
  installmentCount?: number
}

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount)
}

export default function CheckoutCommitmentCard({
  amount,
  currency,
  mode,
  installmentCount = 4,
}: CheckoutCommitmentCardProps) {
  const totalCommitment = mode === "installments" ? amount * installmentCount : amount

  return (
    <div className="rounded-2xl border border-navy-dark/10 bg-navy-dark/5 p-4 sm:p-5 mb-5">
      <p className="font-body text-xs font-semibold uppercase tracking-widest text-textMuted">
        Payment commitment
      </p>
      <div className="mt-2 flex flex-col gap-1">
        <p className="font-display font-bold text-navy-dark text-2xl sm:text-3xl leading-tight">
          {mode === "installments"
            ? `${formatMoney(amount, currency)} per month`
            : `${formatMoney(amount, currency)} today`}
        </p>
        {mode === "installments" ? (
          <p className="font-body text-sm text-textMuted">
            Paid over {installmentCount} monthly instalments. Total commitment {formatMoney(totalCommitment, currency)}.
          </p>
        ) : (
          <p className="font-body text-sm text-textMuted">
            Pay the full amount in a single payment today.
          </p>
        )}
      </div>
    </div>
  )
}