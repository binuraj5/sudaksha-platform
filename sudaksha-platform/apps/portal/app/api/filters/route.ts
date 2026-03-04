import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Helper function to check if we're in mock mode
const isMockMode = () => Object.keys(prisma).length === 0

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const activeTab = searchParams.get('activeTab') || 'courses'

    if (isMockMode()) {
      console.log('🔄 Mock mode: Returning filters API data')
      
      if (activeTab === 'courses') {
        return NextResponse.json({
          success: true,
          filters: {
            categories: [
              { value: 'software_development', label: 'Software Development' },
              { value: 'data_science', label: 'Data Science' },
              { value: 'cloud_computing', label: 'Cloud Computing' },
              { value: 'devops', label: 'DevOps' },
              { value: 'cybersecurity', label: 'Cybersecurity' }
            ],
            industries: [
              { value: 'it_services', label: 'IT Services' },
              { value: 'banking_finance', label: 'Banking & Finance' },
              { value: 'healthcare', label: 'Healthcare' },
              { value: 'ecommerce', label: 'E-commerce' },
              { value: 'manufacturing', label: 'Manufacturing' }
            ],
            targetLevels: [
              { value: 'beginner', label: 'Beginner' },
              { value: 'intermediate', label: 'Intermediate' },
              { value: 'advanced', label: 'Advanced' }
            ]
          }
        })
      } else {
        return NextResponse.json({
          success: true,
          filters: {
            industries: [
              { value: 'it_services', label: 'IT Services' },
              { value: 'banking_finance', label: 'Banking & Finance' },
              { value: 'healthcare', label: 'Healthcare' },
              { value: 'ecommerce', label: 'E-commerce' },
              { value: 'manufacturing', label: 'Manufacturing' }
            ]
          }
        })
      }
    }

    if (activeTab === 'courses') {
      // Fetch unique categories, industries, and target levels from courses
      const [categories, industries, targetLevels] = await Promise.all([
        prisma.course.findMany({
          select: { category: true },
          distinct: ['category'],
          where: { status: 'PUBLISHED' }
        }),
        prisma.course.findMany({
          select: { industry: true },
          distinct: ['industry'],
          where: { status: 'PUBLISHED' }
        }),
        prisma.course.findMany({
          select: { targetLevel: true },
          distinct: ['targetLevel'],
          where: { status: 'PUBLISHED' }
        })
      ])

      // Get unique values
      const uniqueCategories = [...new Set(categories.map(c => c.category))]
      const uniqueIndustries = [...new Set(industries.map(i => i.industry))]
      const uniqueTargetLevels = [...new Set(targetLevels.map(t => t.targetLevel))]

      return NextResponse.json({
        success: true,
        filters: {
          categories: uniqueCategories.map(cat => ({
            value: cat,
            label: cat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
          })),
          industries: uniqueIndustries.map(ind => ({
            value: ind,
            label: ind === 'GENERIC' ? 'Generic/All Industries' : ind.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
          })),
          targetLevels: uniqueTargetLevels.map(level => ({
            value: level,
            label: level.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
          }))
        }
      })
    } else {
      // Fetch unique industries from finishing school
      const industries = await prisma.finishingSchool.findMany({
        select: { industry: true },
        distinct: ['industry']
      })

      const uniqueIndustries = [...new Set(industries.map(i => i.industry))]

      return NextResponse.json({
        success: true,
        filters: {
          industries: uniqueIndustries.map(ind => ({
            value: ind,
            label: ind === 'GENERIC' ? 'Generic/All Industries' : ind.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
          }))
        }
      })
    }
  } catch (error) {
    console.error('Error fetching filters:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch filter options' },
      { status: 500 }
    )
  }
}
