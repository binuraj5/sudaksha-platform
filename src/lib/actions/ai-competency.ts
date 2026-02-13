"use server";

export interface GeneratedCompetency {
  name: string;
  category: "TECHNICAL" | "BEHAVIORAL" | "COGNITIVE" | "DOMAIN_SPECIFIC";
  description: string;
  indicators: {
    level: "JUNIOR" | "MIDDLE" | "SENIOR" | "EXPERT";
    text: string;
    type: "POSITIVE" | "NEGATIVE";
  }[];
}

interface AIProvider {
  name: string;
  apiKey: string | undefined;
  execute: (prompt: string) => Promise<string>;
}

export async function generateCompetenciesForRole(
  roleName: string,
  roleDescription: string,
  industry: string[],
  level: string
): Promise<{ success: boolean; data?: GeneratedCompetency[]; error?: string; provider?: string }> {

  const prompt = `
You are an expert HR and Technical Assessment specialist.
Generate a list of 5-7 key competencies for the following Job Role.

Role Information:
- Title: ${roleName}
- Level: ${level}
- Industries: ${industry.join(", ")}
- Description: ${roleDescription}

For each competency, provide:
1. Name (Concise, standard terminology)
2. Category (Choose from: TECHNICAL, BEHAVIORAL, COGNITIVE, DOMAIN_SPECIFIC)
3. Description (Brief definition)
4. Behavioral Indicators: Provide behavioral indicators for ALL 4 proficiency levels (JUNIOR, MIDDLE, SENIOR, EXPERT).
   - For EACH level, provide exactly 2 POSITIVE and 2 NEGATIVE indicators.
   - This means 16 indicators per competency in total.
   - POSITIVE indicators describe clear, observable behaviors that DEMONSTRATE the competency.
   - NEGATIVE indicators describe behaviors that indicate a LACK of the competency or are COUNTER-PRODUCTIVE.

Return the response STRICTLY as a valid JSON array of objects with the following structure:
[
  {
    "name": "Competency Name",
    "category": "TECHNICAL", 
    "description": "Description...",
    "indicators": [
      { "level": "JUNIOR", "text": "Positive indicator...", "type": "POSITIVE" },
      { "level": "JUNIOR", "text": "Negative indicator...", "type": "NEGATIVE" },
      { "level": "MIDDLE", "text": "...", "type": "POSITIVE" },
      ...
    ]
  }
]

Do not include markdown formatting like \`\`\`json. Just the raw JSON.
  `;

  // Define all available AI providers
  const providers: AIProvider[] = [
    {
      name: "OpenAI GPT-4o-mini",
      apiKey: process.env.OPENAI_API_KEY,
      execute: async (prompt: string) => {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'You are an expert HR and Technical Assessment specialist. Return only valid JSON without any markdown formatting.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.7,
            response_format: { type: "json_object" }
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error?.message || `OpenAI API error: ${response.status}`);
        }

        const result = await response.json();
        return result.choices?.[0]?.message?.content || "";
      }
    },
    {
      name: "Anthropic Claude",
      apiKey: process.env.ANTHROPIC_API_KEY,
      execute: async (prompt: string) => {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY!,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-3-5-sonnet-20240620',
            max_tokens: 4096,
            messages: [
              {
                role: 'user',
                content: prompt
              }
            ],
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error?.message || `Anthropic API error: ${response.status}`);
        }

        const data = await response.json();
        return data.content?.[0]?.text || "";
      }
    },
    {
      name: "xAI Grok",
      apiKey: process.env.XAI_API_KEY,
      execute: async (prompt: string) => {
        const response = await fetch('https://api.x.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.XAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'grok-beta',
            messages: [
              {
                role: 'system',
                content: 'You are an expert HR and Technical Assessment specialist. Return only valid JSON.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.7,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error?.message || `xAI API error: ${response.status}`);
        }

        const result = await response.json();
        return result.choices?.[0]?.message?.content || "";
      }
    },
    {
      name: "Google Gemini 2.5 Flash Lite",
      apiKey: process.env.GEMINI_API_KEY,
      execute: async (prompt: string) => {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }]
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error?.message || `Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      }
    },
    {
      name: "Perplexity",
      apiKey: process.env.PERPLEXITY_API_KEY,
      execute: async (prompt: string) => {
        const response = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'llama-3.1-sonar-small-128k-online',
            messages: [
              {
                role: 'system',
                content: 'You are an expert HR and Technical Assessment specialist. Return only valid JSON.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error?.message || `Perplexity API error: ${response.status}`);
        }

        const result = await response.json();
        return result.choices?.[0]?.message?.content || "";
      }
    }
  ];

  // Try each provider in order until one works
  const errors: string[] = [];

  for (const provider of providers) {
    // Skip if API key is not configured
    if (!provider.apiKey || provider.apiKey.includes('your-') || provider.apiKey === '') {
      console.log(`⏭️  Skipping ${provider.name}: API key not configured`);
      continue;
    }

    try {
      console.log(`🔄 Trying ${provider.name}...`);

      const text = await provider.execute(prompt);

      // Clean potential markdown
      const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();

      const parsed = JSON.parse(cleanText);

      // Handle if the response is wrapped in an object with a key
      const data = Array.isArray(parsed) ? parsed : (parsed.competencies || parsed.data || []);

      if (data && data.length > 0) {
        console.log(`✅ Success with ${provider.name}! Generated ${data.length} competencies.`);
        console.log(`📍 Example: ${data[0].name} has ${data[0].indicators?.length || 0} indicators.`);
        return {
          success: true,
          data,
          provider: provider.name
        };
      } else {
        throw new Error("Empty response from AI");
      }

    } catch (error: any) {
      const errorMsg = `${provider.name}: ${error.message}`;
      console.warn(`❌ ${errorMsg}`);
      errors.push(errorMsg);
      // Continue to next provider
      continue;
    }
  }

  // If we get here, all providers failed
  return {
    success: false,
    error: `All AI providers failed. Errors:\n${errors.join('\n')}`
  };
}
