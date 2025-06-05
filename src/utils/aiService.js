import StorageService from './storage';

/**
 * AI Service for generating personalized follow-up messages
 * using OpenAI's API
 */

// Default prompt templates for different follow-up styles
const PROMPT_TEMPLATES = {
  // Main template that generates all three variations
  default: `Generate a professional follow-up message for:
Name: {name}
Title: {title}
Company: {company}
Meeting Context: {meetingNotes}
Goals: {goals}

Generate 3 variations:
1. FORMAL: Professional and business-appropriate
2. CASUAL: Friendly but still professional
3. FRIENDLY: Warm and personable

For each variation, include:
- A greeting
- Reference to our meeting
- Next steps or action items
- A closing

Format the response with clear headers for each variation.`,

  // Individual style templates (used as fallbacks)
  formal: `Generate a formal, professional follow-up email for:
Name: {name}
Title: {title}
Company: {company}
Meeting Context: {meetingNotes}
Goals: {goals}

The tone should be professional and business-appropriate.
Include a greeting, reference to our meeting, next steps, and a professional closing.`,

  casual: `Generate a casual but professional follow-up email for:
Name: {name}
Title: {title}
Company: {company}
Meeting Context: {meetingNotes}
Goals: {goals}

The tone should be conversational yet professional.
Include a friendly greeting, brief reference to our meeting, clear next steps, and a casual closing.`,

  friendly: `Generate a warm, friendly follow-up email for:
Name: {name}
Title: {title}
Company: {company}
Meeting Context: {meetingNotes}
Goals: {goals}

The tone should be warm, personable and engaging.
Include a warm greeting, personal reference to our meeting, enthusiastic next steps, and a friendly closing.`,
};

// Fallback messages when API is unavailable
const FALLBACK_MESSAGES = {
  formal: {
    subject: "Following up on our meeting",
    body: `Dear {name},

I hope this email finds you well. I wanted to follow up on our recent meeting regarding {meetingNotes}.

As discussed, we agreed to {goals}. I'm looking forward to our next steps and continuing our professional relationship.

Please let me know if you have any questions or if there's anything else I can provide.

Best regards,
{userName}`
  },
  casual: {
    subject: "Quick follow-up from our chat",
    body: `Hi {name},

Hope you're doing well! Just wanted to touch base after our meeting about {meetingNotes}.

I'm excited about moving forward with {goals} that we discussed. Let me know what you think about the next steps.

Looking forward to connecting again soon.

Cheers,
{userName}`
  },
  friendly: {
    subject: "Great meeting you!",
    body: `Hey {name}!

It was fantastic meeting you and discussing {meetingNotes}! I really enjoyed our conversation.

I'm really excited about working together on {goals}. I think we can create something amazing!

Let's keep in touch and chat again soon.

All the best,
{userName}`
  }
};

/**
 * Validates an OpenAI API key
 * @param {string} apiKey - The OpenAI API key to validate
 * @returns {Promise<boolean>} - Whether the API key is valid
 */
export const validateApiKey = async (apiKey) => {
  if (!apiKey || apiKey.trim() === '') {
    return false;
  }

  try {
    // Simple format validation (not a full validation)
    if (!apiKey.startsWith('sk-') || apiKey.length < 20) {
      return false;
    }

    // For a real validation, we would make a lightweight API call
    // but for now we'll just check the format to avoid unnecessary API calls
    
    return true;
  } catch (error) {
    console.error('Error validating API key:', error);
    return false;
  }
};

/**
 * Fills in template placeholders with actual values
 * @param {string} template - The template string with placeholders
 * @param {Object} data - The data to fill in
 * @returns {string} - The filled template
 */
const fillTemplate = (template, data) => {
  let result = template;
  
  // Replace each placeholder with its corresponding value
  Object.keys(data).forEach(key => {
    const value = data[key] || '';
    result = result.replace(new RegExp(`{${key}}`, 'g'), value);
  });
  
  return result;
};

/**
 * Generates personalized follow-up messages
 * @param {Object} contact - The contact information
 * @param {Object} context - The meeting context and goals
 * @param {string} style - The style of follow-up (default, formal, casual, friendly)
 * @returns {Promise<Object>} - The generated follow-up messages
 */
export const generateFollowUp = async (contact, context, style = 'default') => {
  try {
    // Get user settings to check for API key
    const settings = await StorageService.getSettings();
    const apiKey = settings.aiApiKey;
    
    // Get user's card for signature
    const userCard = await StorageService.getUserCard();
    const userName = userCard ? userCard.name : 'Me';
    
    // Prepare data for template filling
    const templateData = {
      name: contact.cardData.name || '',
      title: contact.cardData.title || '',
      company: contact.cardData.company || '',
      meetingNotes: context.meetingNotes || '',
      goals: context.goals || '',
      userName: userName,
    };
    
    // If no API key or invalid context, return fallback messages
    if (!apiKey || !validateApiKey(apiKey) || 
        !templateData.name || (!templateData.meetingNotes && !templateData.goals)) {
      return {
        success: false,
        error: !apiKey ? 'No API key provided' : 'Invalid context or API key',
        messages: {
          formal: {
            subject: fillTemplate(FALLBACK_MESSAGES.formal.subject, templateData),
            body: fillTemplate(FALLBACK_MESSAGES.formal.body, templateData),
          },
          casual: {
            subject: fillTemplate(FALLBACK_MESSAGES.casual.subject, templateData),
            body: fillTemplate(FALLBACK_MESSAGES.casual.body, templateData),
          },
          friendly: {
            subject: fillTemplate(FALLBACK_MESSAGES.friendly.subject, templateData),
            body: fillTemplate(FALLBACK_MESSAGES.friendly.body, templateData),
          }
        },
        isAiGenerated: false,
      };
    }
    
    // Select the appropriate prompt template
    const promptTemplate = PROMPT_TEMPLATES[style] || PROMPT_TEMPLATES.default;
    const prompt = fillTemplate(promptTemplate, templateData);
    
    // Call OpenAI API
    const messages = [
      { role: 'system', content: 'You are a professional assistant helping to draft follow-up emails after business meetings.' },
      { role: 'user', content: prompt }
    ];
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000
      })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    // Parse the AI response to extract the different variations
    const parsedMessages = parseAiResponse(aiResponse, templateData);
    
    return {
      success: true,
      messages: parsedMessages,
      isAiGenerated: true,
      rawResponse: aiResponse
    };
    
  } catch (error) {
    console.error('Error generating follow-up:', error);
    
    // Return fallback messages on error
    const templateData = {
      name: contact.cardData.name || '',
      title: contact.cardData.title || '',
      company: contact.cardData.company || '',
      meetingNotes: context.meetingNotes || '',
      goals: context.goals || '',
      userName: 'Me',
    };
    
    return {
      success: false,
      error: error.message || 'Failed to generate follow-up messages',
      messages: {
        formal: {
          subject: fillTemplate(FALLBACK_MESSAGES.formal.subject, templateData),
          body: fillTemplate(FALLBACK_MESSAGES.formal.body, templateData),
        },
        casual: {
          subject: fillTemplate(FALLBACK_MESSAGES.casual.subject, templateData),
          body: fillTemplate(FALLBACK_MESSAGES.casual.body, templateData),
        },
        friendly: {
          subject: fillTemplate(FALLBACK_MESSAGES.friendly.subject, templateData),
          body: fillTemplate(FALLBACK_MESSAGES.friendly.body, templateData),
        }
      },
      isAiGenerated: false,
    };
  }
};

/**
 * Parses the AI response to extract different message variations
 * @param {string} aiResponse - The raw AI response
 * @param {Object} templateData - The template data (for fallbacks)
 * @returns {Object} - Object containing the parsed messages
 */
const parseAiResponse = (aiResponse, templateData) => {
  // Default structure to return
  const result = {
    formal: {
      subject: '',
      body: ''
    },
    casual: {
      subject: '',
      body: ''
    },
    friendly: {
      subject: '',
      body: ''
    }
  };
  
  try {
    // Check if the response contains the expected variations
    const formalMatch = aiResponse.match(/FORMAL:?([\s\S]*?)(?=CASUAL:|FRIENDLY:|$)/i);
    const casualMatch = aiResponse.match(/CASUAL:?([\s\S]*?)(?=FORMAL:|FRIENDLY:|$)/i);
    const friendlyMatch = aiResponse.match(/FRIENDLY:?([\s\S]*?)(?=FORMAL:|CASUAL:|$)/i);
    
    // Extract subject and body from each variation
    if (formalMatch && formalMatch[1]) {
      const formalContent = formalMatch[1].trim();
      const subjectMatch = formalContent.match(/Subject:(.+?)(?:\n|$)/i);
      result.formal.subject = subjectMatch ? subjectMatch[1].trim() : 'Following up on our meeting';
      result.formal.body = subjectMatch ? 
        formalContent.substring(subjectMatch[0].length).trim() : 
        formalContent;
    } else {
      result.formal.subject = fillTemplate(FALLBACK_MESSAGES.formal.subject, templateData);
      result.formal.body = fillTemplate(FALLBACK_MESSAGES.formal.body, templateData);
    }
    
    if (casualMatch && casualMatch[1]) {
      const casualContent = casualMatch[1].trim();
      const subjectMatch = casualContent.match(/Subject:(.+?)(?:\n|$)/i);
      result.casual.subject = subjectMatch ? subjectMatch[1].trim() : 'Quick follow-up';
      result.casual.body = subjectMatch ? 
        casualContent.substring(subjectMatch[0].length).trim() : 
        casualContent;
    } else {
      result.casual.subject = fillTemplate(FALLBACK_MESSAGES.casual.subject, templateData);
      result.casual.body = fillTemplate(FALLBACK_MESSAGES.casual.body, templateData);
    }
    
    if (friendlyMatch && friendlyMatch[1]) {
      const friendlyContent = friendlyMatch[1].trim();
      const subjectMatch = friendlyContent.match(/Subject:(.+?)(?:\n|$)/i);
      result.friendly.subject = subjectMatch ? subjectMatch[1].trim() : 'Great meeting you!';
      result.friendly.body = subjectMatch ? 
        friendlyContent.substring(subjectMatch[0].length).trim() : 
        friendlyContent;
    } else {
      result.friendly.subject = fillTemplate(FALLBACK_MESSAGES.friendly.subject, templateData);
      result.friendly.body = fillTemplate(FALLBACK_MESSAGES.friendly.body, templateData);
    }
    
    return result;
  } catch (error) {
    console.error('Error parsing AI response:', error);
    
    // Return fallback messages if parsing fails
    return {
      formal: {
        subject: fillTemplate(FALLBACK_MESSAGES.formal.subject, templateData),
        body: fillTemplate(FALLBACK_MESSAGES.formal.body, templateData),
      },
      casual: {
        subject: fillTemplate(FALLBACK_MESSAGES.casual.subject, templateData),
        body: fillTemplate(FALLBACK_MESSAGES.casual.body, templateData),
      },
      friendly: {
        subject: fillTemplate(FALLBACK_MESSAGES.friendly.subject, templateData),
        body: fillTemplate(FALLBACK_MESSAGES.friendly.body, templateData),
      }
    };
  }
};

/**
 * Generates a simple follow-up based on contact information
 * without requiring an API call
 * @param {Object} contact - The contact information
 * @returns {Object} - Simple follow-up messages
 */
export const generateSimpleFollowUp = async (contact) => {
  try {
    // Get user's card for signature
    const userCard = await StorageService.getUserCard();
    const userName = userCard ? userCard.name : 'Me';
    
    const templateData = {
      name: contact.cardData.name || '',
      title: contact.cardData.title || '',
      company: contact.cardData.company || '',
      meetingNotes: 'our recent meeting',
      goals: 'the next steps we discussed',
      userName: userName,
    };
    
    return {
      success: true,
      messages: {
        formal: {
          subject: fillTemplate(FALLBACK_MESSAGES.formal.subject, templateData),
          body: fillTemplate(FALLBACK_MESSAGES.formal.body, templateData),
        },
        casual: {
          subject: fillTemplate(FALLBACK_MESSAGES.casual.subject, templateData),
          body: fillTemplate(FALLBACK_MESSAGES.casual.body, templateData),
        },
        friendly: {
          subject: fillTemplate(FALLBACK_MESSAGES.friendly.subject, templateData),
          body: fillTemplate(FALLBACK_MESSAGES.friendly.body, templateData),
        }
      },
      isAiGenerated: false,
    };
  } catch (error) {
    console.error('Error generating simple follow-up:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate simple follow-up messages',
      messages: {},
      isAiGenerated: false,
    };
  }
};

export default {
  validateApiKey,
  generateFollowUp,
  generateSimpleFollowUp,
};
