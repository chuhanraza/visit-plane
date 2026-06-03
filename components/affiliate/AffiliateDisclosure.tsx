/**
 * AffiliateDisclosure — FTC/ASA compliant disclosure component
 *
 * Must appear on every page that contains affiliate links.
 * Placement: above the footer, or as a tooltip on each card.
 *
 * Usage:
 *   <AffiliateDisclosure />          // full banner (bottom of page)
 *   <AffiliateDisclosure compact />  // one-liner under a section
 */

interface AffiliateDisclosureProps {
  compact?: boolean
  className?: string
}

export default function AffiliateDisclosure({
  compact = false,
  className = '',
}: AffiliateDisclosureProps) {
  if (compact) {
    return (
      <p className={`text-[11px] text-gray-400 text-center leading-relaxed ${className}`}>
        VisitPlane may earn a commission when you book through our partner links.
        This never affects your price, and it helps us keep visa data free for everyone.
        We only partner with services we&apos;d use ourselves.
      </p>
    )
  }

  return (
    <div
      className={`border-t border-gray-100 bg-gray-50/70 px-4 py-4 text-center ${className}`}
      role="note"
      aria-label="Affiliate disclosure"
    >
      <p className="mx-auto max-w-2xl text-xs text-gray-400 leading-relaxed">
        <span className="font-semibold text-gray-500">Affiliate disclosure:</span>
        {' '}VisitPlane may earn a commission when you book through our partner links.
        This never affects your price, and it helps us keep visa data free for everyone.
        We only partner with services we&apos;d use ourselves.
      </p>
    </div>
  )
}
