'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface NavItem {
  title: string;
  href: string;
  children?: NavItem[];
}

export default function CorporateNavigation() {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const navigation: NavItem[] = [
    {
      title: 'Overview',
      href: '/corporates'
    },
    {
      title: 'Domestic B2B',
      href: '/corporates/domestic',
      children: [
        {
          title: 'Overview',
          href: '/corporates/domestic'
        },
        {
          title: 'Our Process (6-Step Model)',
          href: '/corporates/domestic/process'
        },
        {
          title: 'Employment Models',
          href: '/corporates/domestic/employment-models',
          children: [
            {
              title: 'Overview',
              href: '/corporates/domestic/employment-models'
            },
            {
              title: 'Train-Hire-Deploy (THD)',
              href: '/corporates/domestic/thd'
            },
            {
              title: 'Deploy-Hire-Train (DHT)',
              href: '/corporates/domestic/dht'
            }
          ]
        },
        {
          title: 'Success Stories',
          href: '/corporates/domestic/case-studies'
        }
      ]
    },
    {
      title: 'International B2B',
      href: '/corporates/international',
      children: [
        {
          title: 'Overview',
          href: '/corporates/international'
        },
        {
          title: 'For Global Corporations',
          href: '/corporates/international/global-corporations'
        },
        {
          title: 'For Government Agencies',
          href: '/corporates/international/government'
        },
        {
          title: 'Compliance & Certifications',
          href: '/corporates/international/compliance'
        }
      ]
    },
    {
      title: 'Industry Solutions',
      href: '/corporates/industries',
      children: [
        {
          title: 'All Industries',
          href: '/corporates/industries'
        },
        {
          title: 'FinTech',
          href: '/corporates/industries/fintech'
        },
        {
          title: 'E-commerce',
          href: '/corporates/industries/ecommerce'
        },
        {
          title: 'Healthcare',
          href: '/corporates/industries/healthcare'
        },
        {
          title: 'Pharma',
          href: '/corporates/industries/pharma'
        },
        {
          title: 'Logistics & Supply Chain',
          href: '/corporates/industries/logistics'
        },
        {
          title: 'EdTech',
          href: '/corporates/industries/edtech'
        },
        {
          title: 'Government',
          href: '/corporates/industries/government'
        },
        {
          title: 'Defence',
          href: '/corporates/industries/defence'
        },
        {
          title: 'Aviation',
          href: '/corporates/industries/aviation'
        },
        {
          title: 'Travel & Hospitality',
          href: '/corporates/industries/travel'
        },
        {
          title: 'Retail & FMCG',
          href: '/corporates/industries/retail'
        },
        {
          title: 'Real Estate',
          href: '/corporates/industries/real-estate'
        }
      ]
    },
    {
      title: 'Learning Solutions',
      href: '/corporates/solutions',
      children: [
        {
          title: 'Custom Training Programs',
          href: '/corporates/solutions/custom-training'
        },
        {
          title: 'On-Site Training',
          href: '/corporates/solutions/onsite'
        },
        {
          title: 'Virtual Instructor-Led',
          href: '/corporates/solutions/virtual-ilt'
        },
        {
          title: 'Blended Learning',
          href: '/corporates/solutions/blended'
        },
        {
          title: 'Train-the-Trainer',
          href: '/corporates/solutions/train-the-trainer'
        }
      ]
    },
    {
      title: 'Resources',
      href: '/corporates/resources',
      children: [
        {
          title: 'Case Studies',
          href: '/corporates/case-studies'
        },
        {
          title: 'White Papers',
          href: '/corporates/resources/whitepapers'
        },
        {
          title: 'ROI Calculator',
          href: '/corporates/roi-calculator'
        },
        {
          title: 'Corporate Blog',
          href: '/corporates/blog'
        },
        {
          title: 'Success Metrics',
          href: '/corporates/metrics'
        }
      ]
    },
    {
      title: 'Get Started',
      href: '/corporates/get-started',
      children: [
        {
          title: 'Request a Demo',
          href: '/corporates/demo'
        },
        {
          title: 'Get a Quote',
          href: '/corporates/quote'
        },
        {
          title: 'Schedule Consultation',
          href: '/corporates/consultation'
        },
        {
          title: 'Contact Corporate Team',
          href: '/corporates/contact'
        }
      ]
    }
  ];

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const renderNavItem = (item: NavItem, level: number = 0) => {
    const isExpanded = expandedItems.includes(item.title);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.title} className={`${level > 0 ? 'ml-4' : ''}`}>
        <div className="flex items-center justify-between py-2 px-3 hover:bg-gray-100 rounded-lg transition-colors duration-200">
          <Link
            href={item.href}
            className="flex-1 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
          >
            {item.title}
          </Link>
          {hasChildren && (
            <button
              onClick={() => toggleExpanded(item.title)}
              className="p-1 hover:bg-gray-200 rounded transition-colors duration-200"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
            </button>
          )}
        </div>
        
        {hasChildren && isExpanded && (
          <div className="mt-1">
            {item.children!.map(child => renderNavItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <nav className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
      <h2 className="text-lg font-bold text-gray-900 mb-4 px-3">
        FOR CORPORATES
      </h2>
      <div className="space-y-1">
        {navigation.map(item => renderNavItem(item))}
      </div>
    </nav>
  );
}
