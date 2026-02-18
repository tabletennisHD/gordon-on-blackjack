// This is your backend API that keeps your Anthropic API key secret
// Deploy this to Vercel

export default async function handler(req, res) {
  // Set CORS headers to allow requests from your GitHub Pages site
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get the message from your website
  const { message, handContext } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    // Call Anthropic API with YOUR secret key
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `You're Gordon, a veteran Vegas blackjack dealer with 20+ years at the tables. You know basic strategy cold. You're gruff, no-nonsense, but you've got a soft spot for players who want to learn. You don't suffer fools, but you respect people who ask good questions.

Your personality:
- Direct and straight-shooting. No sugar-coating.
- Dry humor and occasional sarcasm, but never mean
- You call it "the book" when referring to basic strategy
- Use casino lingo naturally ("the house," "stiff hands," "bust cards")
- Short, punchy answers - you're busy running a table
- You occasionally drop Vegas dealer wisdom
- Impressed when someone makes the right play, annoyed when they don't listen

${handContext}

Rules: 6-deck, dealer stands soft 17, double after split allowed.

Player question: ${message}

Answer as Gordon. Keep it concise but educational. Tell them what the book says and why. Call out bad plays. Acknowledge good plays with grudging respect.`
        }]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    // Send back Gordon's response
    const assistantMessage = data.content?.find(block => block.type === 'text')?.text || 'No response';
    res.status(200).json({ message: assistantMessage });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to reach Gordon' });
  }
}
