import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Check, CreditCard, Loader2 } from "lucide-react"
import {
  initializeSubscriptionPayment,
  verifySubscriptionPayment,
} from "@/lib/request"
import { setSubscription } from "@/store/AuthenticationSlice"
import { formatCurrency } from "@/lib/utils"

const formatPlanPrice = (amountNgn) => `₦${formatCurrency(amountNgn)}`

export default function Subscribe() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const token = useSelector((state) => state.authentication.token)
  const business = useSelector((state) => state.authentication.business)
  const subscription = useSelector((state) => state.authentication.subscription)

  const [loadingPlan, setLoadingPlan] = useState(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [verifying, setVerifying] = useState(false)

  const plans = subscription?.plans ?? []
  const reference = searchParams.get("reference") || searchParams.get("trxref")

  useEffect(() => {
    const verifyPayment = async () => {
      if (!reference || !token || !business?.id) return
      setVerifying(true)
      setError("")
      const res = await verifySubscriptionPayment(token, business.id, reference)
      setVerifying(false)
      if (res.success) {
        dispatch(setSubscription(res.data))
        setSuccess(res.message ?? "Subscription activated successfully.")
        setSearchParams({})
        setTimeout(() => navigate("/dashboard"), 2000)
      } else {
        setError(res.error ?? "Could not verify payment.")
      }
    }
    verifyPayment()
  }, [reference, token, business?.id, dispatch, navigate, setSearchParams])

  const handleSubscribe = async (planKey) => {
    if (!token || !business?.id) return
    setLoadingPlan(planKey)
    setError("")
    const res = await initializeSubscriptionPayment(token, business.id, planKey)
    setLoadingPlan(null)
    if (!res.success) {
      setError(res.error ?? "Could not start payment.")
      return
    }
    if (res.data?.authorization_url) {
      window.location.href = res.data.authorization_url
    }
  }

  const statusLabel = () => {
    if (subscription?.on_trial) {
      return `Free trial — ${subscription.trial_days_left} day(s) left`
    }
    if (subscription?.is_active) {
      return `Active — ${subscription.plan?.name ?? subscription.plan_key} plan`
    }
    return "Subscription required"
  }

  const currentPlanKey = subscription?.plan_key

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Billing & subscription</h1>
        <p className="mt-2 text-slate-600">
          Choose a plan based on how many locations you operate. All plans are billed monthly via Paystack.
        </p>
        <p className="mt-3 inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
          {statusLabel()}
        </p>
      </div>

      {verifying ? (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-indigo-900">
          <Loader2 className="h-4 w-4 animate-spin" />
          Verifying your payment…
        </div>
      ) : null}

      {success ? (
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-900">
          {success}
        </div>
      ) : null}

      {error ? (
        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-900">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = currentPlanKey === plan.key && subscription?.is_active
          return (
            <div
              key={plan.key}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-indigo-600" />
                <h2 className="text-lg font-semibold text-slate-900">{plan.name}</h2>
              </div>
              <p className="text-3xl font-bold tabular-nums text-slate-900">
                {formatPlanPrice(plan.amount_ngn)}
                <span className="text-base font-normal text-slate-500">/mo</span>
              </p>
              <p className="mt-2 text-sm text-slate-600">{plan.description}</p>
              <ul className="mt-4 flex-1 space-y-2 text-sm text-slate-700">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600" />
                  {plan.max_locations === null
                    ? "Unlimited locations"
                    : `${plan.max_locations} location${plan.max_locations === 1 ? "" : "s"}`}
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600" />
                  Sales, supplies & analytics
                </li>
              </ul>
              <Button
                className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700"
                disabled={loadingPlan !== null || isCurrent}
                onClick={() => handleSubscribe(plan.key)}
              >
                {loadingPlan === plan.key ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {isCurrent ? "Current plan" : subscription?.is_active ? "Upgrade" : "Subscribe"}
              </Button>
            </div>
          )
        })}
      </div>

      {subscription?.has_access && !reference ? (
        <div className="mt-8 text-center">
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            Back to dashboard
          </Button>
        </div>
      ) : null}
    </div>
  )
}
