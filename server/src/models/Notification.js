const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      default: null,
    },
    type: {
      type: String,
      enum: [
        'TASK_ASSIGNED',
        'TASK_UNASSIGNED',
        'TASK_STATUS_CHANGED',
        'TASK_CREATED',
        'TASK_DELETED',
        'TASK_COMMENTED',
        'TASK_MENTIONED',
        'MEMBER_JOINED',
        'MEMBER_LEFT',
        'MEMBER_ROLE_CHANGED',
      ],
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    // ADD THIS FIELD
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, workspace: 1, createdAt: -1 });
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model('Notification', notificationSchema);