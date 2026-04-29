const sortedTemplates = [{id: 't1'}, {id: 't2'}, {id: 't3'}];
let previousTaskId = null;
const tasksToInsert = sortedTemplates.map((tt) => {
  const taskId = 'new-' + tt.id;
  const task = {
    id: taskId,
    depends_on_task_id: previousTaskId
  };
  previousTaskId = taskId;
  return task;
});
console.log(JSON.stringify(tasksToInsert, null, 2));
