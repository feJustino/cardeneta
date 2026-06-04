"use client"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-1 items-center justify-center py-20">
      <div className="flex flex-col items-center gap-4 text-center">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Algo deu errado
        </h2>
        <p className="max-w-md text-sm text-zinc-500">
          {error.message || "Ocorreu um erro inesperado. Tente novamente."}
        </p>
        <button
          onClick={reset}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  )
}
