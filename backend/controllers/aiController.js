const OpenAI = require('openai');

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are StudyAI, an expert academic tutor helping students understand any topic.
Always respond in well-structured, easy-to-understand format.
Use markdown formatting:
- Use ## for main headings
- Use **bold** for key terms
- Use bullet points for lists
- Use numbered lists for steps
- Add a "💡 Key Takeaway" section at the end
- Keep language clear and student-friendly
- Include examples where helpful
- Be thorough but concise`;

exports.askQuestion = async (req, res) => {
  const { question, history = [] } = req.body;

  if (!question || question.trim().length === 0) {
    return res.status(400).json({ error: 'Question cannot be empty.' });
  }

  if (question.length > 1000) {
    return res.status(400).json({ error: 'Question too long. Max 1000 characters.' });
  }

  if (!process.env.OPENAI_API_KEY) {
    // Demo mode — return mock answer if no API key
    return res.json({
      answer: `## Demo Answer for: "${question}"\n\n**StudyAI** is in demo mode (no API key set).\n\nTo get real AI answers:\n1. Get an OpenAI API key from https://platform.openai.com\n2. Add it to \`backend/.env\` as \`OPENAI_API_KEY=your_key\`\n3. Restart the backend\n\n💡 **Key Takeaway**: Set your OPENAI_API_KEY to unlock full AI-powered answers!`,
      relatedQuestions: [
        'How do I set up OpenAI API?',
        'What subjects can StudyAI help with?',
        'How do I create flashcards?'
      ]
    });
  }

  try {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.slice(-6), // keep last 3 exchanges for context
      { role: 'user', content: question }
    ];

    const completion = await client.chat.completions.create({
      model: 'gpt-4o',
      messages,
      max_tokens: 1200,
      temperature: 0.7
    });

    const answer = completion.choices[0].message.content;

    // Generate related questions
    const relatedCompletion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Generate exactly 3 related study questions a student might ask next. Return ONLY a JSON array of 3 strings, no other text.' },
        { role: 'user', content: `Topic: ${question}` }
      ],
      max_tokens: 200
    });

    let relatedQuestions = [];
    try {
      relatedQuestions = JSON.parse(relatedCompletion.choices[0].message.content);
    } catch (_) {
      relatedQuestions = [];
    }

    res.json({ answer, relatedQuestions });
  } catch (err) {
    console.error('OpenAI error:', err.message);
    res.status(500).json({ error: 'AI service error. Please check your API key and try again.' });
  }
};
