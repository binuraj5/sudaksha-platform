import Link from 'next/link';
import { Clock, Star, Users, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface CourseCardProps {
  course: {
    id: string;
    slug: string;
    name: string;
    shortDescription: string | null;
    imageUrl: string | null;
    durationDays: number | null;
    durationHours: any | null;
    deliveryMode: string;
    rating: number | null;
    totalReviews: number | null;
    skillTags: any;
    basePrice: any | null;
    discountedPrice: any | null;
    currency: string | null;
    technologyDomain?: string | null;
    categoryPrimary?: string | null;
  };
}

export function CourseCard({ course }: CourseCardProps) {
  // Safe parsing of JSON skill arrays
  let tags: string[] = [];
  try {
    if (Array.isArray(course.skillTags)) {
      tags = course.skillTags;
    } else if (typeof course.skillTags === 'string') {
      tags = JSON.parse(course.skillTags);
    }
  } catch (e) {
    tags = [];
  }

  return (
    <div className="group flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300 overflow-hidden">
      
      {/* Cover Image */}
      <Link href={`/courses/${course.slug}`} className="relative h-48 bg-gray-100 overflow-hidden block">
        {course.imageUrl ? (
          <img 
            src={course.imageUrl} 
            alt={course.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-50 to-blue-100" />
        )}
        <div className="absolute top-4 left-4 flex gap-2">
           <Badge className="bg-white/90 text-gray-800 backdrop-blur-sm border-none shadow-sm capitalize">
              {course.deliveryMode.toLowerCase()}
           </Badge>
           {course.technologyDomain && (
              <Badge className="bg-indigo-600/90 text-white backdrop-blur-sm border-none shadow-sm">
                {course.technologyDomain}
              </Badge>
           )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center gap-2 mb-3 text-sm">
          <div className="flex items-center text-amber-500 font-medium">
            <Star className="w-4 h-4 fill-current mr-1" />
            {course.rating ? Number(course.rating).toFixed(1) : 'New'}
          </div>
          {course.totalReviews ? (
            <span className="text-gray-400">({course.totalReviews} reviews)</span>
          ) : null}
        </div>

        <Link href={`/courses/${course.slug}`}>
          <h3 className="text-xl font-bold text-gray-900 leading-tight mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
            {course.name}
          </h3>
        </Link>
        
        <p className="text-gray-600 line-clamp-2 text-sm leading-relaxed mb-6">
          {course.shortDescription || "Master this technology with our hands-on, expert-led training program designed for rapid capability building."}
        </p>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="px-2.5 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-md border border-gray-100">
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="px-2.5 py-1 bg-gray-50 text-gray-400 text-xs font-medium rounded-md border border-gray-100">
                +{tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Action Footer */}
        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center text-gray-500 text-sm">
             <Clock className="w-4 h-4 mr-1.5 text-gray-400" />
             {course.durationDays ? `${course.durationDays} Days` : 
              course.durationHours ? `${course.durationHours} Hours` : 
              'Self-Paced'}
          </div>
          <Link href={`/courses/${course.slug}`} className="text-sm font-semibold text-indigo-600 group-hover:translate-x-1 transition-transform flex items-center">
            Course Details <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
