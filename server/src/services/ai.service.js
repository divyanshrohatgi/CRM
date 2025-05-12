const { OpenAI } = require('openai');
const logger = require('../utils/logger');

class AIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  // Convert natural language to segment rules
  async naturalLanguageToRules(prompt) {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that converts natural language descriptions into structured segment rules for a CRM system. The rules should be in JSON format with field, operator, and value properties."
          },
          {
            role: "user",
            content: `Convert this description into segment rules: ${prompt}`
          }
        ],
        temperature: 0.3
      });

      const rules = JSON.parse(response.choices[0].message.content);
      return rules;
    } catch (error) {
      logger.error('Natural language to rules error:', error);
      throw new Error('Failed to convert natural language to rules');
    }
  }

  // Generate message suggestions
  async generateMessageSuggestions(objective, audience) {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a marketing expert that generates personalized message suggestions for customer campaigns."
          },
          {
            role: "user",
            content: `Generate 3 message suggestions for a campaign with the following objective: ${objective}. Target audience: ${audience}`
          }
        ],
        temperature: 0.7
      });

      const suggestions = response.choices[0].message.content.split('\n').filter(Boolean);
      return suggestions;
    } catch (error) {
      logger.error('Generate message suggestions error:', error);
      throw new Error('Failed to generate message suggestions');
    }
  }

  // Generate campaign performance summary
  async generateCampaignSummary(stats) {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a data analyst that generates human-readable summaries of campaign performance metrics."
          },
          {
            role: "user",
            content: `Generate a summary of these campaign stats: ${JSON.stringify(stats)}`
          }
        ],
        temperature: 0.3
      });

      return response.choices[0].message.content;
    } catch (error) {
      logger.error('Generate campaign summary error:', error);
      throw new Error('Failed to generate campaign summary');
    }
  }

  // Suggest campaign timing
  async suggestCampaignTiming(audience, historicalData) {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a marketing expert that suggests optimal timing for campaign delivery based on audience behavior patterns."
          },
          {
            role: "user",
            content: `Suggest the best time to send a campaign to this audience: ${audience}. Historical data: ${JSON.stringify(historicalData)}`
          }
        ],
        temperature: 0.5
      });

      return response.choices[0].message.content;
    } catch (error) {
      logger.error('Suggest campaign timing error:', error);
      throw new Error('Failed to suggest campaign timing');
    }
  }

  // Auto-tag campaigns
  async autoTagCampaign(campaign) {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a marketing expert that suggests relevant tags for campaigns based on their content and target audience."
          },
          {
            role: "user",
            content: `Suggest tags for this campaign: ${JSON.stringify(campaign)}`
          }
        ],
        temperature: 0.3
      });

      const tags = response.choices[0].message.content.split(',').map(tag => tag.trim());
      return tags;
    } catch (error) {
      logger.error('Auto-tag campaign error:', error);
      throw new Error('Failed to auto-tag campaign');
    }
  }
}

// Create a singleton instance
const aiService = new AIService();

module.exports = aiService; 