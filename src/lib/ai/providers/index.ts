/**
 * AI Providers Utility
 * Supports multiple AI backends (Gemini, OpenAI, Anthropic) 
 * with a unified interface compatible with OpenAI format.
 */

export async function generateChatCompletion(messages: Array<{ role: string, content: string }>) {
    const providers = [
        { name: 'OpenAI', key: process.env.OPENAI_API_KEY, call: callOpenAI },
        { name: 'Anthropic', key: process.env.ANTHROPIC_API_KEY, call: callAnthropic },
        { name: 'xAI', key: process.env.XAI_API_KEY, call: callXAI },
        { name: 'Gemini', key: process.env.GEMINI_API_KEY, call: callGemini },
        { name: 'Perplexity', key: process.env.PERPLEXITY_API_KEY, call: callPerplexity },
    ];

    const errors: string[] = [];

    for (const provider of providers) {
        // Skip if API key is not configured
        if (!provider.key || provider.key.includes('your-') || provider.key === '') {
            console.log(`⏭️  Skipping ${provider.name}: API key not configured`);
            continue;
        }

        try {
            console.log(`🔄 Trying ${provider.name}...`);
            const result = await provider.call(messages);
            console.log(`✅ Success with ${provider.name}!`);
            return result;
        } catch (error: any) {
            const errorMsg = `${provider.name}: ${error.message}`;
            console.warn(`❌ ${errorMsg}`);
            errors.push(errorMsg);
            // Continue to next provider
        }
    }

    throw new Error(`All AI providers failed. Errors:\n${errors.join('\n')}`);
}

async function callGemini(messages: Array<{ role: string, content: string }>) {
    const apiKey = process.env.GEMINI_API_KEY;
    const model = "gemini-2.5-flash-lite";

    // For Gemini simple generation, we combine the messages or take the last one
    const context = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');

    // Try primary model
    let response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [{
                parts: [{
                    text: context
                }]
            }],
            generationConfig: {
                maxOutputTokens: 4000,
                temperature: 0.7
            }
        }),
    });

    // Fallback to gemini-2.0-flash if flash-lite fails
    if (!response.ok) {
        console.warn(`Gemini ${model} failed, trying gemini-2.0-flash...`);
        response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: context
                    }]
                }],
                generationConfig: {
                    maxOutputTokens: 4000
                }
            }),
        });
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return {
        choices: [
            {
                message: {
                    content: text
                }
            }
        ]
    };
}

async function callAnthropic(messages: Array<{ role: string, content: string }>) {
    const system = messages.find(m => m.role === "system")?.content;
    const filteredMessages = messages.filter(m => m.role !== "system");

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
            system: system,
            messages: filteredMessages.map(m => ({
                role: m.role === 'user' ? 'user' : 'assistant',
                content: m.content
            })),
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || "";

    return {
        choices: [
            {
                message: {
                    content: text
                }
            }
        ]
    };
}

async function callOpenAI(messages: Array<{ role: string, content: string }>) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: messages,
            temperature: 0.7,
            max_tokens: 4000
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `OpenAI API error: ${response.status}`);
    }

    return await response.json();
}

async function callXAI(messages: Array<{ role: string, content: string }>) {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.XAI_API_KEY}`,
        },
        body: JSON.stringify({
            model: 'grok-beta',
            messages: messages,
            temperature: 0.7,
            max_tokens: 4000
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `xAI API error: ${response.status}`);
    }

    return await response.json();
}

async function callPerplexity(messages: Array<{ role: string, content: string }>) {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        },
        body: JSON.stringify({
            model: 'llama-3.1-sonar-small-128k-online',
            messages: messages,
            temperature: 0.7
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Perplexity API error: ${response.status}`);
    }

    return await response.json();
}
