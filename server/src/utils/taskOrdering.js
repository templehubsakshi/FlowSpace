// Pure logic for keeping `order` values contiguous within a status column
// after a drag-and-drop move. Kept separate from the controller so it can be
// unit tested without touching MongoDB.
//
// Returns an array of MongoDB bulkWrite operations. The caller is
// responsible for actually moving `task` itself (status/order) and for
// wrapping everything in a transaction.
function buildReorderOperations({ workspaceId, taskId, oldStatus, oldOrder, newStatus, newOrder }) {
  const ops = [];

  if (oldStatus === newStatus) {
    if (newOrder === oldOrder) return ops; // no-op

    if (newOrder > oldOrder) {
      // Moved down within the same column: everything strictly after the old
      // spot, up to and including the new spot, shifts up by one.
      ops.push({
        updateMany: {
          filter: {
            workspace: workspaceId,
            status: oldStatus,
            _id: { $ne: taskId },
            order: { $gt: oldOrder, $lte: newOrder }
          },
          update: { $inc: { order: -1 } }
        }
      });
    } else {
      // Moved up within the same column: everything from the new spot up to
      // (but not including) the old spot shifts down by one.
      ops.push({
        updateMany: {
          filter: {
            workspace: workspaceId,
            status: oldStatus,
            _id: { $ne: taskId },
            order: { $gte: newOrder, $lt: oldOrder }
          },
          update: { $inc: { order: 1 } }
        }
      });
    }
  } else {
    // Close the gap left behind in the source column.
    ops.push({
      updateMany: {
        filter: {
          workspace: workspaceId,
          status: oldStatus,
          _id: { $ne: taskId },
          order: { $gt: oldOrder }
        },
        update: { $inc: { order: -1 } }
      }
    });

    // Make room at the destination column.
    ops.push({
      updateMany: {
        filter: {
          workspace: workspaceId,
          status: newStatus,
          _id: { $ne: taskId },
          order: { $gte: newOrder }
        },
        update: { $inc: { order: 1 } }
      }
    });
  }

  return ops;
}

module.exports = { buildReorderOperations };
