import Link from 'next/link'

export function ViewAllLink({ href, label }) {
  return (
    <Link href={href} aria-label={`View all ${label}`} className="shrink-0 whitespace-nowrap text-[11px] font-medium text-primary hover:underline">
      View all
    </Link>
  )
}
