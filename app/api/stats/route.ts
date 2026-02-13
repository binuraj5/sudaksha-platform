import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const stats = {
      studentsTrained: 10000,
      placementRate: 85,
      averageSalary: 650000, // in rupees
      corporatePartners: 200,
      industryVerticals: 12
    };

    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
