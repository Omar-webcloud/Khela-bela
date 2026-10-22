import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h2 className="text-xl font-bold text-stone-900">404 — Page Not Found</h2>
      <p className="mt-2 text-xs text-stone-500">The page you are looking for does not exist.</p>
      <Link
        href="/"
        className="mt-4 rounded-xl bg-stone-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-stone-800"
      >
        Return Home
      </Link>
    </div>
  );
}
