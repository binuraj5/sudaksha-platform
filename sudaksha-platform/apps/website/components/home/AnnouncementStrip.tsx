import { Megaphone } from 'lucide-react';
import Link from 'next/link';

async function getActiveAnnouncements() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/admin/homepage/announcements`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.announcements?.filter((a: any) => a.isActive) || [];
  } catch {
    return [];
  }
}

const typeStyles = {
  INFO: 'bg-blue-600 text-white',
  PROMOTIONAL: 'bg-indigo-600 text-white',
  URGENT: 'bg-red-600 text-white',
  SUCCESS: 'bg-green-600 text-white',
};

export async function AnnouncementStrip() {
  const announcements = await getActiveAnnouncements();

  if (!announcements || announcements.length === 0) return null;

  const announcement = announcements[0];
  const styleClass = typeStyles[announcement.type as keyof typeof typeStyles] || typeStyles.INFO;

  return (
    <div className={`w-full py-2.5 px-4 flex items-center justify-center text-sm font-medium ${styleClass} rounded-md`}>
      <Megaphone className="w-4 h-4 mr-2 hidden sm:block flex-shrink-0" />
      <span className="truncate">{announcement.message}</span>
      {announcement.ctaLabel && announcement.ctaUrl && (
        <Link
          href={announcement.ctaUrl}
          className="ml-3 underline font-bold whitespace-nowrap hover:opacity-80"
        >
          {announcement.ctaLabel} &rarr;
        </Link>
      )}
    </div>
  );
}
