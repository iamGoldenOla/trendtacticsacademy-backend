import mongoose, { Document, Schema } from 'mongoose';

export interface IAIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    confidence?: number;
    sources?: string[];
    suggestions?: string[];
  };
}

export interface IAISession extends Document {
  user: mongoose.Types.ObjectId;
  course?: mongoose.Types.ObjectId;
  lesson?: mongoose.Types.ObjectId;
  sessionId: string; // TrendyAI session identifier
  context: {
    userId: string;
    courseId?: string;
    lessonId?: string;
    topic?: string;
    userLevel?: string;
    userProgress?: number;
    learningStyle?: string;
    previousSessions?: number;
  };
  messages: IAIMessage[];
  status: 'active' | 'completed' | 'expired';
  lastActivity: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AIMessageSchema = new Schema<IAIMessage>({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  metadata: {
    confidence: {
      type: Number,
      min: 0,
      max: 1,
    },
    sources: [{
      type: String,
    }],
    suggestions: [{
      type: String,
    }],
  },
});

const AISessionSchema = new Schema<IAISession>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
  },
  lesson: {
    type: Schema.Types.ObjectId,
    ref: 'Lesson',
  },
  sessionId: {
    type: String,
    required: true,
    unique: true,
  },
  context: {
    userId: {
      type: String,
      required: true,
    },
    courseId: String,
    lessonId: String,
    topic: String,
    userLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    userProgress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    learningStyle: {
      type: String,
      enum: ['visual', 'auditory', 'kinesthetic', 'reading'],
    },
    previousSessions: {
      type: Number,
      default: 0,
    },
  },
  messages: [AIMessageSchema],
  status: {
    type: String,
    enum: ['active', 'completed', 'expired'],
    default: 'active',
  },
  lastActivity: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Indexes for better query performance
AISessionSchema.index({ user: 1, createdAt: -1 });
AISessionSchema.index({ sessionId: 1 });
AISessionSchema.index({ status: 1, lastActivity: 1 });
AISessionSchema.index({ 'context.courseId': 1, user: 1 });

// Auto-expire sessions after 24 hours of inactivity
AISessionSchema.index({ lastActivity: 1 }, { expireAfterSeconds: 86400 });

// Pre-save middleware to update lastActivity
AISessionSchema.pre('save', function(next) {
  if (this.isModified('messages')) {
    this.lastActivity = new Date();
  }
  next();
});

// Instance methods
AISessionSchema.methods.addMessage = function(message: Omit<IAIMessage, 'timestamp'>) {
  this.messages.push({
    ...message,
    timestamp: new Date(),
  });
  this.lastActivity = new Date();
  return this.save();
};

AISessionSchema.methods.markCompleted = function() {
  this.status = 'completed';
  return this.save();
};

AISessionSchema.methods.isExpired = function() {
  const now = new Date();
  const expiryTime = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  return (now.getTime() - this.lastActivity.getTime()) > expiryTime;
};

// Static methods
AISessionSchema.statics.findActiveSession = function(userId: string, courseId?: string) {
  const query: any = {
    user: userId,
    status: 'active',
  };
  
  if (courseId) {
    query['context.courseId'] = courseId;
  }
  
  return this.findOne(query).sort({ lastActivity: -1 });
};

AISessionSchema.statics.getUserSessionStats = function(userId: string) {
  return this.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        activeSessions: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        completedSessions: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        totalMessages: { $sum: { $size: '$messages' } },
        avgMessagesPerSession: { $avg: { $size: '$messages' } },
        lastSessionDate: { $max: '$createdAt' },
      }
    }
  ]);
};

AISessionSchema.statics.cleanupExpiredSessions = function() {
  const expiryDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
  return this.updateMany(
    {
      status: 'active',
      lastActivity: { $lt: expiryDate }
    },
    {
      $set: { status: 'expired' }
    }
  );
};

export const AISession = mongoose.model<IAISession>('AISession', AISessionSchema);