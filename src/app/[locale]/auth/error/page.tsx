import { unstable_setRequestLocale } from 'next-intl/server';
import { AlertTriangle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AuthError({
  params: { locale }
}: {
  params: { locale: string }
}) {
  unstable_setRequestLocale(locale);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <AlertTriangle className="h-12 w-12 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold mb-4">Authentication Error</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          There was a problem with your authentication request.
          <br />
          Please try again or contact support if the problem persists.
        </p>
        <div className="space-x-4">
          <Button asChild>
            <Link href={`/${locale}/auth/signin`}>
              Try Again
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/${locale}`}>
              Go Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
