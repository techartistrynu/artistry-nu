// components/ui/button.tsx
import { Loader2 } from "lucide-react"
import { ButtonProps } from "./button"

export function ButtonScore({
  loading = false,
  children,
  ...props
}: ButtonProps & { loading?: boolean }) {
  return (
    <button {...props} disabled={props.disabled || loading}>
      {loading ? (
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Processing...
        </div>
      ) : (
        children
      )}
    </button>
  )
}