import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

/**
 * AI Service for TrendyAI Integration
 * This service handles communication with the TrendyAI API
 */

interface TrendyAIConfig {
  baseURL: string;
  apiKey: string;
  timeout: number;
  retries: number;
}

interface AISessionContext {
  userId: string;
  courseId?: string;
  lessonId?: string;
  topic?: string;
  userLevel?: string;
  userProgress?: number;
  learningStyle?: string;
  previousSessions?: number;
}

interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: any;
}

interface TrendyAIResponse {
  success: boolean;
  data?: any;
  error?: string;
  sessionId?: string;
  content?: string;
  metadata?: any;
}

class AIService {
  private client: any;
  private config: TrendyAIConfig;
  private rateLimitCache: Map<string, { count: number; resetTime: number }> = new Map();

  constructor() {
    this.config = {
      baseURL: process.env.TRENDY_AI_BASE_URL || 'https://api.trendyai.com',
      apiKey: process.env.TRENDY_AI_API_KEY || '',
      timeout: parseInt(process.env.TRENDY_AI_TIMEOUT || '30000'),
      retries: parseInt(process.env.TRENDY_AI_RETRIES || '3'),
    };

    this.client = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'TrendTactics-LMS/1.0',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor for rate limiting
    this.client.interceptors.request.use(
      async (config: any) => {
        await this.checkRateLimit(config.url || '');
        return config;
      },
      (error: any) => Promise.reject(error)
    );

    // Response interceptor for error handling and retries
    this.client.interceptors.response.use(
      (response: any) => {
        this.updateRateLimit(response);
        return response;
      },
      async (error: any) => {
        if (error.response?.status === 429) {
          // Rate limit exceeded
          const retryAfter = error.response.headers['retry-after'] || 60;
          console.warn(`Rate limit exceeded. Retrying after ${retryAfter} seconds`);
          await this.delay(retryAfter * 1000);
          return this.client.request(error.config);
        }
        return Promise.reject(error);
      }
    );
  }

  private async checkRateLimit(endpoint: string): Promise<void> {
    const key = `rate_limit_${endpoint}`;
    const now = Date.now();
    const limit = this.rateLimitCache.get(key);

    if (limit && now < limit.resetTime && limit.count >= 100) {
      const waitTime = limit.resetTime - now;
      console.warn(`Rate limit reached for ${endpoint}. Waiting ${waitTime}ms`);
      await this.delay(waitTime);
    }
  }

  private updateRateLimit(response: any): void {
    const endpoint = response.config.url || '';
    const key = `rate_limit_${endpoint}`;
    const remaining = parseInt(response.headers['x-ratelimit-remaining'] || '100');
    const resetTime = parseInt(response.headers['x-ratelimit-reset'] || '0') * 1000;

    this.rateLimitCache.set(key, {
      count: 100 - remaining,
      resetTime: resetTime || Date.now() + 60000,
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Start a new AI tutor session
   */
  async startSession(context: AISessionContext): Promise<{
    sessionId: string;
    welcomeMessage: string;
  }> {
    try {
      const sessionId = uuidv4();
      
      const response = await this.client.post('/v1/sessions/start', {
        sessionId,
        context: {
          ...context,
          systemPrompt: this.buildSystemPrompt(context),
        },
        settings: {
          model: 'trendy-ai-tutor-v2',
          temperature: 0.7,
          maxTokens: 1000,
          streaming: false,
        },
      });

      if (response.data.success) {
        return {
          sessionId,
          welcomeMessage: response.data.welcomeMessage || this.getDefaultWelcomeMessage(context),
        };
      }

      throw new Error(response.data.error || 'Failed to start AI session');
    } catch (error: any) {
      console.error('TrendyAI Start Session Error:', error.response?.data || error.message);
      
      // Fallback to local AI simulation if TrendyAI is unavailable
      if (process.env.NODE_ENV === 'development') {
        return this.simulateAISession(context);
      }
      
      throw new Error('AI service temporarily unavailable');
    }
  }

  /**
   * Send a message to the AI tutor
   */
  async sendMessage(
    sessionId: string,
    message: string,
    context: any
  ): Promise<{
    content: string;
    metadata?: any;
  }> {
    try {
      const response = await this.client.post('/v1/chat/completions', {
        sessionId,
        message,
        context,
        settings: {
          model: 'trendy-ai-tutor-v2',
          temperature: 0.7,
          maxTokens: 1000,
          streaming: false,
        },
      });

      if (response.data.success) {
        return {
          content: response.data.content,
          metadata: response.data.metadata,
        };
      }

      throw new Error(response.data.error || 'Failed to get AI response');
    } catch (error: any) {
      console.error('TrendyAI Chat Error:', error.response?.data || error.message);
      
      // Fallback to local AI simulation if TrendyAI is unavailable
      if (process.env.NODE_ENV === 'development') {
        return this.simulateAIResponse(message, context);
      }
      
      throw new Error('AI service temporarily unavailable');
    }
  }

  /**
   * Get AI-powered learning recommendations
   */
  async getRecommendations(context: any): Promise<any[]> {
    try {
      const response = await this.client.post('/v1/recommendations', {
        context,
        settings: {
          model: 'trendy-ai-recommender-v1',
          maxRecommendations: 10,
          includeReasoning: true,
        },
      });

      if (response.data.success) {
        return response.data.recommendations || [];
      }

      throw new Error(response.data.error || 'Failed to get recommendations');
    } catch (error: any) {
      console.error('TrendyAI Recommendations Error:', error.response?.data || error.message);
      
      // Fallback to mock recommendations
      if (process.env.NODE_ENV === 'development') {
        return this.simulateRecommendations(context);
      }
      
      throw new Error('Recommendation service temporarily unavailable');
    }
  }

  /**
   * Get AI analytics for user learning patterns
   */
  async getAnalytics(context: any): Promise<any> {
    try {
      const response = await this.client.post('/v1/analytics', {
        context,
        settings: {
          model: 'trendy-ai-analytics-v1',
          includeInsights: true,
          includePredictions: true,
        },
      });

      if (response.data.success) {
        return response.data.analytics;
      }

      throw new Error(response.data.error || 'Failed to get analytics');
    } catch (error: any) {
      console.error('TrendyAI Analytics Error:', error.response?.data || error.message);
      
      // Fallback to mock analytics
      if (process.env.NODE_ENV === 'development') {
        return this.simulateAnalytics(context);
      }
      
      throw new Error('Analytics service temporarily unavailable');
    }
  }

  /**
   * Generate AI-powered content
   */
  async generateContent(context: any): Promise<any> {
    try {
      const response = await this.client.post('/v1/content/generate', {
        context,
        settings: {
          model: 'trendy-ai-generator-v1',
          creativity: 0.8,
          quality: 'high',
        },
      });

      if (response.data.success) {
        return response.data.content;
      }

      throw new Error(response.data.error || 'Failed to generate content');
    } catch (error: any) {
      console.error('TrendyAI Content Generation Error:', error.response?.data || error.message);
      
      // Fallback to mock content generation
      if (process.env.NODE_ENV === 'development') {
        return this.simulateContentGeneration(context);
      }
      
      throw new Error('Content generation service temporarily unavailable');
    }
  }

  /**
   * Analyze user progress with AI insights
   */
  async analyzeProgress(context: any): Promise<any> {
    try {
      const response = await this.client.post('/v1/progress/analyze', {
        context,
        settings: {
          model: 'trendy-ai-analyzer-v1',
          includeInsights: true,
          includePredictions: true,
          includeRecommendations: true,
        },
      });

      if (response.data.success) {
        return response.data.analysis;
      }

      throw new Error(response.data.error || 'Failed to analyze progress');
    } catch (error: any) {
      console.error('TrendyAI Progress Analysis Error:', error.response?.data || error.message);
      
      // Fallback to mock analysis
      if (process.env.NODE_ENV === 'development') {
        return this.simulateProgressAnalysis(context);
      }
      
      throw new Error('Progress analysis service temporarily unavailable');
    }
  }

  /**
   * Get personalized learning path
   */
  async personalizeLearningPath(context: any): Promise<any> {
    try {
      const response = await this.client.post('/v1/learning-path/personalize', {
        context,
        settings: {
          model: 'trendy-ai-personalizer-v1',
          adaptivity: 'high',
          includeAlternatives: true,
        },
      });

      if (response.data.success) {
        return response.data.learningPath;
      }

      throw new Error(response.data.error || 'Failed to personalize learning path');
    } catch (error: any) {
      console.error('TrendyAI Personalization Error:', error.response?.data || error.message);
      
      // Fallback to mock personalization
      if (process.env.NODE_ENV === 'development') {
        return this.simulatePersonalization(context);
      }
      
      throw new Error('Personalization service temporarily unavailable');
    }
  }

  // Fallback simulation methods for development
  private buildSystemPrompt(context: AISessionContext): string {
    return `You are TrendyAI, an expert digital marketing tutor. You're helping a ${context.userLevel || 'beginner'} level student ${context.topic ? `learn about ${context.topic}` : 'with their digital marketing studies'}. Be encouraging, provide clear explanations, and offer practical examples. Keep responses concise but informative.`;
  }

  private getDefaultWelcomeMessage(context: AISessionContext): string {
    const level = context.userLevel || 'beginner';
    const topic = context.topic || 'digital marketing';
    return `Hello! I'm TrendyAI, your personal digital marketing tutor. I see you're at a ${level} level and ${context.topic ? `interested in ${topic}` : 'ready to learn'}. How can I help you today?`;
  }

  private async simulateAISession(context: AISessionContext): Promise<{ sessionId: string; welcomeMessage: string }> {
    const sessionId = uuidv4();
    return {
      sessionId,
      welcomeMessage: this.getDefaultWelcomeMessage(context),
    };
  }

  private async simulateAIResponse(message: string, context: any): Promise<{ content: string; metadata?: any }> {
    // Simple simulation - in development, you can enhance this
    const responses = [
      "That's a great question! Let me help you understand this concept better.",
      "I can see you're making good progress. Here's what I recommend next...",
      "Let me break this down into simpler steps for you.",
      "That's exactly right! You're getting the hang of this.",
      "I understand this can be confusing. Let me explain it differently.",
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    return {
      content: randomResponse,
      metadata: {
        confidence: 0.85,
        sources: ['TrendyAI Knowledge Base'],
        suggestions: ['Try the practice exercise', 'Review the previous lesson'],
      },
    };
  }

  private simulateRecommendations(context: any): any[] {
    return [
      {
        id: '1',
        type: 'course',
        title: 'Advanced Social Media Marketing',
        description: 'Based on your progress, this course will help you master social media strategies.',
        confidence: 0.9,
        reasoning: 'Your strong performance in basic social media concepts suggests readiness for advanced topics.',
        metadata: { difficulty: 'intermediate', estimatedTime: 120 },
      },
      {
        id: '2',
        type: 'practice',
        title: 'SEO Keyword Research Exercise',
        description: 'Practice identifying high-value keywords for different industries.',
        confidence: 0.85,
        reasoning: 'Reinforcing SEO fundamentals will strengthen your foundation.',
        metadata: { difficulty: 'beginner', estimatedTime: 30 },
      },
    ];
  }

  private simulateAnalytics(context: any): any {
    return {
      learningStyle: 'visual',
      strengths: ['SEO fundamentals', 'Content marketing basics'],
      weaknesses: ['PPC advertising', 'Analytics interpretation'],
      recommendedPace: 'normal',
      engagementScore: 0.78,
      predictedOutcome: {
        completionProbability: 0.85,
        estimatedCompletionTime: 14, // days
        suggestedInterventions: ['More practice exercises', 'Peer study groups'],
      },
    };
  }

  private simulateContentGeneration(context: any): any {
    return {
      type: context.type,
      content: {
        questions: [
          {
            question: 'What is the primary goal of SEO?',
            options: ['Increase website traffic', 'Improve user experience', 'Both A and B', 'None of the above'],
            correct: 2,
            explanation: 'SEO aims to both increase organic traffic and improve user experience.',
          },
        ],
      },
      metadata: {
        difficulty: context.difficulty,
        estimatedTime: 15,
        learningObjectives: ['Understand SEO fundamentals'],
      },
    };
  }

  private simulateProgressAnalysis(context: any): any {
    return {
      insights: [
        'You\'re progressing well with consistent daily study sessions',
        'Your quiz scores show strong understanding of core concepts',
        'Consider spending more time on practical exercises',
      ],
      recommendations: [
        'Focus on PPC advertising in your next study session',
        'Join the community discussion forum for peer learning',
        'Schedule a practice session for next week',
      ],
      predictedOutcome: {
        completionDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        successProbability: 0.88,
      },
    };
  }

  private simulatePersonalization(context: any): any {
    return {
      path: [
        {
          lessonId: 'lesson-1',
          estimatedTime: 45,
          priority: 1,
          reasoning: 'Foundation concepts are essential before moving forward',
        },
        {
          lessonId: 'lesson-3',
          estimatedTime: 60,
          priority: 2,
          reasoning: 'Your learning style suggests visual content will be most effective',
        },
      ],
      totalEstimatedTime: 105,
      adaptations: [
        'Added more visual examples based on your learning style',
        'Adjusted pace based on your available study time',
      ],
    };
  }
}

// Export singleton instance
export const aiService = new AIService();
export default aiService;