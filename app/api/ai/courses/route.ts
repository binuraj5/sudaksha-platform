import { NextRequest, NextResponse } from 'next/server'
import { generateChatCompletion } from '@/lib/ai/providers';
import { CreateCourse } from '@/lib/schemas/course';
import { AIGenerateCourse } from '@/lib/schemas/course';

// BULLETPROOF COURSE GENERATION PROMPT
const getBulletproofPrompt = (params: {
  title: string;
  industry: string;
  level: string;
  domain: string;
  weeks: number;
  mode: string;
}) => `<XML_SYSTEM_PROMPT>
You are EXECUTIVE EDUCATION ARCHITECT. Generate PRODUCTION-READY course JSON.
The user wants a course on: "${params.title}"

EXCELLENCE CRITERIA (FAIL IF NOT MET):
1. NO generic modules ("Foundation", "Basics", "Advanced Topics")
2. Industry-specific tools/examples (Refinitiv, Bloomberg for Finance; JIRA for IT)
3. ${params.weeks}-week progression: Weeks 1-2=Foundations→Weeks 3-6=Advanced→Weeks 7-8=Capstone
4. Chapter descriptions = ACTIONABLE OUTCOMES (what they BUILD)
5. Generate a CATCHY, PROFESSIONAL COURSE TITLE. Do not just use the prompt.
6. MINIMUM 8 MODULES REQUIRED. Split complex topics if needed.
7. Include a "deliverables" section in the JSON with 3-5 specific artifacts (Projects, Case Studies, Toolkits) students will build.

INPUT SPEC:
Concept/Topic: "${params.title}"
Industry: "${params.industry}"
Level: "${params.level}"
Domain: "${params.domain}"
Duration: ${params.weeks} weeks
Mode: ${params.mode}
</XML_SYSTEM_PROMPT>

<EXACT_JSON_STRUCTURE>
{
  "name": "Catchy Title Here",
  "description": "500+ words. Industry pain→solution→ROI. Mention ${params.industry} companies.",
  "prerequisites": ["Prerequisite 1", "Prerequisite 2"],
  "learningObjectives": [
    "Learning Objective 1",
    "Learning Objective 2"
  ],
  "curriculum": [
    {
      "module": "Module 1: [Specific Topic] (Week 1)",
      "description": "Description",
      "chapters": [
        {"title": "[Subtopic]", "description": "Description"}
      ]
    }
  ],
  "deliverables": [
    {
      "title": "[Deliverable Title]",
      "description": "[Brief Description]",
      "type": "PROJECT"
    }
  ]
}
</EXACT_JSON_STRUCTURE>

GENERATE JSON ONLY. NO MARKDOWN. NO EXPLANATIONS.`;

// Helper function to determine if capstone project is required
const needsCapstone = (domain: string, industry: string): boolean => {
  return domain === 'IT' || industry === 'Technology' || industry === 'Software Development';
};

// Helper function to generate smart category
const generateSmartCategory = (domain: string, industry: string, courseType: string): string => {
  const categoryMap: Record<string, string> = {
    'IT': domain === 'IT' ? 'Software Development' : 'Technology',
    'Technology': 'Technology & Engineering',
    'Healthcare': 'Healthcare & Medical',
    'Finance': 'Finance & Banking',
    'Marketing': 'Marketing & Sales',
    'Consulting': 'Business Consulting',
    'Education': 'Education & Training',
    'Manufacturing': 'Manufacturing & Operations',
    'Retail': 'Retail & E-commerce',
    'HR': 'Human Resources'
  };

  return categoryMap[industry] || categoryMap[domain] || courseType || 'Professional Development';
};

// Helper function to convert weeks to hours
const weeksToHours = (weeks: number): number => {
  return weeks * 4; // Assuming 4 hours per week for part-time/corporate or similar
};

// Helper function to validate course quality
const validateCourseQuality = (courseData: any): boolean => {
  if (!courseData.curriculum || courseData.curriculum.length < 8) return false;
  if (!courseData.name || courseData.name.length < 5) return false;
  return true;
};

// Helper function to transform AI response to CreateCourse format
const transformAICourseToCreateCourse = (aiCourse: any, body: AIGenerateCourse): CreateCourse => {
  const capstoneRequired = needsCapstone(body.domain, body.industry);

  const curriculum = aiCourse.curriculum.map((module: any) => ({
    title: module.module || module.title,
    description: module.description || '',
    duration: 10, // Default duration per module
    chapters: (module.chapters || []).map((chapter: any) => ({
      title: chapter.title,
      description: chapter.description || '',
      duration: 2,
      videoUrl: '#',
      resources: ['Guide', 'Exercise']
    }))
  }));

  const catchyName = aiCourse.name || body.prompt;

  return {
    name: catchyName,
    title: catchyName,
    slug: catchyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    description: aiCourse.description || body.prompt,
    shortDescription: (aiCourse.description || body.prompt).substring(0, 160),
    category: aiCourse.category || generateSmartCategory(body.domain, body.industry, body.courseType),
    domain: body.domain,
    industry: body.industry,
    targetLevel: body.targetLevel || 'Beginner',
    audienceLevel: 'ALL_LEVELS',
    courseType: body.courseType,
    deliveryMode: [body.deliveryMode],
    durationHours: body.durationHours || 40,
    price: body.price || 0,
    status: 'DRAFT',
    prerequisites: Array.isArray(aiCourse.prerequisites) ? aiCourse.prerequisites.join('\n') : (aiCourse.prerequisites || ''),
    learningObjectives: (aiCourse.learningObjectives || []).map((lo: any) => ({
      outcome: typeof lo === 'string' ? lo : (lo.outcome || ''),
      category: lo.category || 'TECHNICAL'
    })),
    curriculum,
    instructors: [],
    deliverables: aiCourse.deliverables || [],
    specialFeatures: capstoneRequired ? ['Project Work', 'Industry Case Study'] : [],
    skillTags: [],
    hasProjects: true, // Auto-generated courses usually have projects/deliverables
    hasCaseStudies: false,
    hasProcessFrameworks: false,
    hasPersonalActivities: false,
    certification: false,
    includedFeatures: [],
  };
};

function generateTemplateCourse(prompt: string, industry: string, courseType: string) {
  const courseTitle = prompt.split(' ').slice(0, 4).join(' ') + ' Mastery';

  const modules = [
    {
      module: `Module 1: Professional Foundations (Week 1)`,
      description: `Introduction to the core principles and standards of the ${industry} industry.`,
      chapters: [
        { title: `${industry} Industry Ecosystem`, description: `Understanding key players, market drivers, and regulatory frameworks.` },
        { title: 'Core Competency Assessment', description: `Identifying skill gaps and defining professional growth milestones.` }
      ]
    },
    {
      module: `Module 2: Strategic ${industry} Operations (Week 2)`,
      description: `Deep dive into the operational methodologies that drive success in ${industry}.`,
      chapters: [
        { title: 'Operational Lifecycle Management', description: `Mastering the end-to-end process from initiation to delivery.` },
        { title: 'Stakeholder Management', description: `Communicating effectively with clients, partners, and internal teams.` }
      ]
    },
    {
      module: `Module 3: Advanced Tools & Technology (Week 3-4)`,
      description: `Mastering the essential software and technological tools used by ${industry} leaders.`,
      chapters: [
        { title: 'Industry-Standard Software Mastery', description: `Hands-on training with the most widely used platforms in the field.` },
        { title: 'Automation & Workflow Optimization', description: `Using technology to streamline repetitive tasks and increase output.` }
      ]
    },
    {
      module: `Module 4: Risk Management & Quality Assurance (Week 5)`,
      description: `Ensuring reliability and meeting high standards within the ${industry} sector.`,
      chapters: [
        { title: `${industry} Quality Standards`, description: `Adhering to ISO and other critical quality frameworks.` },
        { title: 'Crisis Management Protocols', description: `Developing contingency plans for common industry challenges.` }
      ]
    },
    {
      module: `Module 5: Leadership & Team Dynamics (Week 6-7)`,
      description: `Building and leading high-performance teams tailored for the ${industry} context.`,
      chapters: [
        { title: 'Strategic Leadership Mastery', description: `Motivating diverse teams and managing conflict effectively.` },
        { title: 'Collaborative Problem Solving', description: `Facilitating innovation through collective brainpower.` }
      ]
    },
    {
      module: `Module 6: Financial Literacy & ROI (Week 8)`,
      description: `Understanding the business of ${industry} through budgeting and value analysis.`,
      chapters: [
        { title: 'Project Budgeting & Planning', description: `Allocating resources effectively to maximize project impact.` },
        { title: 'Value Stream Mapping', description: `Identifying and eliminating waste in ${industry} business processes.` }
      ]
    },
    {
      module: `Module 7: Specialized ${industry} Techniques (Week 9-10)`,
      description: `Mastering the "secret sauce" skills that distinguish top-tier ${industry} professionals.`,
      chapters: [
        { title: 'Advanced Technical Mastery', description: `Deep dive into complex scenarios and edge cases.` },
        { title: 'Case Study Performance Analysis', description: `Deconstructing successful ${industry} projects step-by-step.` }
      ]
    },
    {
      module: `Module 8: Capstone Implementation & Evaluation (Week 11-12)`,
      description: `A final high-stakes project demonstrating total mastery of the ${industry} curriculum.`,
      chapters: [
        { title: 'Capstone Project Execution', description: `Independent application of all course modules to a real-world problem.` },
        { title: 'Final Technical Presentation', description: `Pitching results to a panel and receiving professional feedback.` }
      ]
    }
  ];

  return {
    name: courseTitle,
    description: `A comprehensive ${courseType} program specialized for the ${industry} sector, designed to build core competencies and advanced industry skills over 8-12 weeks.`,
    prerequisites: [`Completion of basic graduation`, `Enthusiasm for ${industry}`],
    learningObjectives: [
      `Master the core principles of ${industry}`,
      `Develop high-demand skills in ${courseType}`,
      `Analyze real-world ${industry} case studies`,
      `Implement ${industry} projects from scratch`,
      `Gain industry-recognized professional certification`
    ],
    curriculum: modules,
    deliverables: [
      { title: `${industry} Professional Portfolio`, description: "A collection of 3 major projects built during the course.", type: "PROJECT" },
      { title: "Industry Performance Audit", description: "A comprehensive analysis of a major industry player.", type: "CASE_STUDY" },
      { title: "Strategic Roadmap", description: "A detailed 5-year career development plan.", type: "DEVELOPMENT_PLAN" }
    ]
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: AIGenerateCourse = await request.json();

    const bulletproofPrompt = getBulletproofPrompt({
      title: body.prompt,
      industry: body.industry,
      level: body.targetLevel,
      domain: body.domain,
      weeks: 12,
      mode: body.deliveryMode
    });

    let courseData;
    let generationMethod = 'gemini';

    try {
      const messages = [
        { role: 'system', content: 'You are an expert curriculum designer. Return JSON only.' },
        { role: 'user', content: bulletproofPrompt }
      ];

      const aiResponse = await generateChatCompletion(messages);
      const text = aiResponse.choices[0].message.content;

      const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
      courseData = JSON.parse(jsonString);

      if (!validateCourseQuality(courseData)) {
        throw new Error('Quality gates failed');
      }
    } catch (e) {
      console.warn('⚠️ AI API failed or low quality, using fallback template:', e);
      courseData = generateTemplateCourse(body.prompt, body.industry, body.courseType);
      generationMethod = 'template';
    }

    const generatedCourse = transformAICourseToCreateCourse(courseData, body);

    return NextResponse.json({
      success: true,
      course: generatedCourse,
      metadata: {
        generationMethod,
        modules: courseData.curriculum?.length || 0,
        industry: body.industry
      }
    });

  } catch (error) {
    console.error('❌ AI generation error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to generate course' },
      { status: 500 }
    );
  }
}
