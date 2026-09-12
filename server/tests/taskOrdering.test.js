const { buildReorderOperations } = require('../src/utils/taskOrdering');

const WS = 'workspace-1';
const TASK = 'task-1';

describe('buildReorderOperations', () => {
  test('same column, no-op when order is unchanged', () => {
    const ops = buildReorderOperations({
      workspaceId: WS, taskId: TASK,
      oldStatus: 'todo', oldOrder: 2,
      newStatus: 'todo', newOrder: 2,
    });
    expect(ops).toHaveLength(0);
  });

  test('same column, moving down shifts the tasks in between up by one', () => {
    // task moves from order 1 -> order 4 within 'todo'
    const ops = buildReorderOperations({
      workspaceId: WS, taskId: TASK,
      oldStatus: 'todo', oldOrder: 1,
      newStatus: 'todo', newOrder: 4,
    });
    expect(ops).toHaveLength(1);
    expect(ops[0].updateMany.filter).toMatchObject({
      workspace: WS, status: 'todo', order: { $gt: 1, $lte: 4 },
    });
    expect(ops[0].updateMany.update).toEqual({ $inc: { order: -1 } });
  });

  test('same column, moving up shifts the tasks in between down by one', () => {
    const ops = buildReorderOperations({
      workspaceId: WS, taskId: TASK,
      oldStatus: 'todo', oldOrder: 4,
      newStatus: 'todo', newOrder: 1,
    });
    expect(ops).toHaveLength(1);
    expect(ops[0].updateMany.filter).toMatchObject({
      workspace: WS, status: 'todo', order: { $gte: 1, $lt: 4 },
    });
    expect(ops[0].updateMany.update).toEqual({ $inc: { order: 1 } });
  });

  // Regression test for the original bug: moving a task to a different
  // column only ever made room in the destination — it never closed the
  // gap left behind in the source column, so the source column's order
  // sequence permanently skipped a number every time a task left it.
  test('cross-column move closes the gap in the source column AND makes room in the destination', () => {
    const ops = buildReorderOperations({
      workspaceId: WS, taskId: TASK,
      oldStatus: 'todo', oldOrder: 2,
      newStatus: 'in-progress', newOrder: 0,
    });

    expect(ops).toHaveLength(2);

    const sourceOp = ops.find(op => op.updateMany.filter.status === 'todo');
    expect(sourceOp.updateMany.filter).toMatchObject({
      workspace: WS, status: 'todo', order: { $gt: 2 },
    });
    expect(sourceOp.updateMany.update).toEqual({ $inc: { order: -1 } });

    const destOp = ops.find(op => op.updateMany.filter.status === 'in-progress');
    expect(destOp.updateMany.filter).toMatchObject({
      workspace: WS, status: 'in-progress', order: { $gte: 0 },
    });
    expect(destOp.updateMany.update).toEqual({ $inc: { order: 1 } });
  });

  test('every operation excludes the task being moved itself', () => {
    const ops = buildReorderOperations({
      workspaceId: WS, taskId: TASK,
      oldStatus: 'todo', oldOrder: 0,
      newStatus: 'done', newOrder: 0,
    });
    ops.forEach(op => {
      expect(op.updateMany.filter._id).toEqual({ $ne: TASK });
    });
  });
});
