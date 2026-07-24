import { LoginButton } from '@/components/auth/LoginButton';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-xl font-semibold">YouTube社員AI</h1>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        Googleアカウントでログインしてください。
      </p>
      <LoginButton />
    </main>
  );
}
