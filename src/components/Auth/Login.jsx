import { useId, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck } from "lucide-react"
import BrandLogo from "@/components/brand/BrandLogo"
import { UserLogin, storeToken } from "@/lib/request"
import { useNavigate } from "react-router-dom"


const Login = () => {
  const navigate = useNavigate()
  const emailId = useId()
  const passwordId = useId()

  const [viewPassword, setViewPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
      remember: true,
    },
    mode: "onSubmit",
  })

  const disabled = loading || isSubmitting

  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }, [])

  const onSubmit = async (data) => {
    setLoading(true)
    const authentication = await UserLogin(data.email, data.password)

    if (authentication.success) {
      toast.success("Login successful.")
      const token = authentication.data?.token
      if (!token) {
        setLoading(false)
        setError("email", { type: "custom", message: "Login token missing. Please try again." })
        return
      }
      storeToken(token)
      setLoading(false)
      navigate("/dashboard")
      return
    }

    setLoading(false)
    const errs = authentication.error || ["Login failed."]
    errs.forEach((e) => toast.error(e))
    setError("email", { type: "custom", message: "Check your email and password." })
  }

  return (
    <div className="relative isolate min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-indigo-500/25 blur-3xl" />
        <div className="absolute -bottom-28 -right-24 h-96 w-96 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.20),transparent_55%)]" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full items-stretch gap-8 lg:grid-cols-2">
          <div className="hidden flex-col justify-between rounded-3xl border border-white/10 bg-white/5 p-8 text-white shadow-2xl backdrop-blur lg:flex">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/90 ring-1 ring-inset ring-white/10">
                <ShieldCheck className="h-4 w-4" aria-hidden />
                Secure access
              </div>
              <BrandLogo size="lg" dark className="mt-6" />
              <p className="mt-3 text-sm leading-6 text-white/70">
                Track sales, supplies, and dispenser levels across your locations. Sign in to continue.
              </p>
            </div>

            <div className="mt-10 grid gap-3 text-sm text-white/70">
              <div className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 ring-1 ring-inset ring-white/10">
                  <Mail className="h-4 w-4 text-white/85" aria-hidden />
                </span>
                <span>Business-owner and manager accounts supported</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 ring-1 ring-inset ring-white/10">
                  <Lock className="h-4 w-4 text-white/85" aria-hidden />
                </span>
                <span>Your session token is stored locally for API access</span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-xl shadow-slate-900/10 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">{greeting}</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Sign in</h2>
                <p className="mt-2 text-sm text-slate-500">
                  Use your email and password to access your dashboard.
                </p>
              </div>
              <div className="hidden rounded-2xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 ring-1 ring-inset ring-slate-200 sm:block">
                v1
              </div>
            </div>

            <form className="mt-8 grid gap-5" onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-2">
                <Label htmlFor={emailId}>Email address</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
                  <Input
                    id={emailId}
                    type="email"
                    placeholder="you@company.com"
                    autoComplete="email"
                    className="pl-9"
                    {...register("email", { required: "Email is required" })}
                    aria-invalid={errors.email ? "true" : "false"}
                  />
                </div>
                {errors.email ? (
                  <p role="alert" className="text-xs text-rose-600">
                    {errors.email.message}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <Label htmlFor={passwordId}>Password</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
                  <Input
                    id={passwordId}
                    type={viewPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="pl-9 pr-10"
                    {...register("password", { required: "Password is required" })}
                    aria-invalid={errors.password ? "true" : "false"}
                  />
                  <button
                    type="button"
                    onClick={() => setViewPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                    aria-label={viewPassword ? "Hide password" : "Show password"}
                  >
                    {viewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password ? (
                  <p role="alert" className="text-xs text-rose-600">
                    {errors.password.message}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <Checkbox {...register("remember")} defaultChecked />
                  <span className="font-medium">Remember me</span>
                </label>
                <button
                  type="button"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                  onClick={() => toast.info("Password reset is not set up yet.")}
                >
                  Forgot password?
                </button>
              </div>

              <Button
                type="submit"
                disabled={disabled}
                className="h-11 w-full rounded-xl bg-indigo-600 text-white hover:bg-indigo-500"
              >
                {disabled ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                <span>{disabled ? "Signing in..." : "Sign in"}</span>
              </Button>

              <p className="text-center text-xs text-slate-500">
                By continuing, you agree to your organization’s access policies.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login