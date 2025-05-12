const mongoose = require('mongoose');

const segmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  rules: [{
    field: {
      type: String,
      required: true
    },
    operator: {
      type: String,
      required: true,
      enum: ['equals', 'not_equals', 'contains', 'not_contains', 'greater_than', 'less_than', 'between', 'in', 'not_in']
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    groupId: {
      type: String,
      required: true
    }
  }],
  groups: [{
    id: {
      type: String,
      required: true
    },
    logic: {
      type: String,
      enum: ['AND', 'OR'],
      default: 'AND'
    }
  }],
  ruleLogic: {
    type: String,
    enum: ['AND', 'OR'],
    default: 'AND'
  },
  customerCount: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isDynamic: {
    type: Boolean,
    default: true
  },
  lastEvaluated: {
    type: Date,
    default: null
  },
  tags: [{
    type: String,
    trim: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
segmentSchema.index({ createdBy: 1 });
segmentSchema.index({ tags: 1 });
segmentSchema.index({ lastEvaluated: 1 });

// Method to evaluate if a customer matches the segment rules
segmentSchema.methods.evaluateCustomer = async function(customer) {
  try {
    // Group rules by their groupId
    const rulesByGroup = this.rules.reduce((acc, rule) => {
      if (!acc[rule.groupId]) {
        acc[rule.groupId] = [];
      }
      acc[rule.groupId].push(rule);
      return acc;
    }, {});

    // Evaluate each group
    const groupResults = await Promise.all(
      this.groups.map(async (group) => {
        const groupRules = rulesByGroup[group.id] || [];
        const ruleResults = await Promise.all(
          groupRules.map(rule => this.evaluateRule(rule, customer))
        );

        // Apply group logic (AND/OR)
        return group.logic === 'AND' 
          ? ruleResults.every(result => result)
          : ruleResults.some(result => result);
      })
    );

    // Apply overall rule logic (AND/OR)
    return this.ruleLogic === 'AND'
      ? groupResults.every(result => result)
      : groupResults.some(result => result);
  } catch (error) {
    console.error('Error evaluating customer:', error);
    return false;
  }
};

// Helper method to evaluate a single rule
segmentSchema.methods.evaluateRule = function(rule, customer) {
  const value = customer[rule.field];
  if (value === undefined) return false;

  switch (rule.operator) {
    case 'equals':
      return value === rule.value;
    case 'not_equals':
      return value !== rule.value;
    case 'contains':
      return String(value).toLowerCase().includes(String(rule.value).toLowerCase());
    case 'not_contains':
      return !String(value).toLowerCase().includes(String(rule.value).toLowerCase());
    case 'greater_than':
      return Number(value) > Number(rule.value);
    case 'less_than':
      return Number(value) < Number(rule.value);
    case 'between':
      const [min, max] = rule.value.split(',').map(Number);
      return Number(value) >= min && Number(value) <= max;
    case 'in':
      return rule.value.split(',').map(v => v.trim()).includes(String(value));
    case 'not_in':
      return !rule.value.split(',').map(v => v.trim()).includes(String(value));
    default:
      return false;
  }
};

const Segment = mongoose.model('Segment', segmentSchema);

module.exports = Segment; 