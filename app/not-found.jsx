import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[80vh] flex-col items-start justify-center">
      <span className="eyebrow">Error 404</span>
      <h1 className="mt-4 text-6xl font-semibold tracking-tight text-fg md:text-8xl">
        Lost the <span className="font-serif font-normal italic text-signal">signal</span>.
      </h1>
      <p className="mt-6 max-w-md text-fg-muted">This page doesn&apos;t exist — but the rest of the site does.</p>
      <Link href="/" className="btn-primary mt-10">
        Back home
      </Link>
    </div>
  );
}
