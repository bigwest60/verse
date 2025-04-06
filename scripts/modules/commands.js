import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function runCLI(args) {
  const command = args[2];
  const options = parseOptions(args.slice(3));

  switch (command) {
    case 'parse-prd':
      return parsePRD(options);
    case 'list':
      return listTasks(options);
    case 'next':
      return showNextTask(options);
    case 'set-status':
      return setTaskStatus(options);
    default:
      console.log('Unknown command:', command);
      return;
  }
}

function parseOptions(args) {
  const options = {};
  args.forEach((arg, index) => {
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=');
      options[key] = value || args[index + 1];
    }
  });
  return options;
}

function parsePRD(options) {
  const inputFile = options.input || 'scripts/PRD.md';
  
  try {
    // Read the PRD file
    const prdContent = fs.readFileSync(inputFile, 'utf8');
    
    // Parse the PRD content into tasks
    const tasks = generateTasksFromPRD(prdContent);
    
    // Write tasks to tasks.json
    const tasksDir = path.join(process.cwd(), 'tasks');
    if (!fs.existsSync(tasksDir)) {
      fs.mkdirSync(tasksDir);
    }
    
    fs.writeFileSync(
      path.join(tasksDir, 'tasks.json'),
      JSON.stringify(tasks, null, 2)
    );
    
    console.log('Successfully generated tasks from PRD!');
    
  } catch (error) {
    console.error('Error parsing PRD:', error);
  }
}

function listTasks(options) {
  try {
    const tasks = loadTasks();
    console.log('\nCurrent Tasks:');
    tasks.tasks.forEach(task => {
      const status = task.status.toUpperCase().padEnd(8);
      const priority = task.priority.toUpperCase().padEnd(6);
      console.log(`[${task.id}] ${status} ${priority} ${task.title}`);
    });
  } catch (error) {
    console.error('Error listing tasks:', error);
  }
}

function showNextTask(options) {
  try {
    const tasks = loadTasks();
    const nextTask = findNextTask(tasks.tasks);
    
    if (nextTask) {
      console.log('\nNext Task:');
      console.log('==========');
      console.log(`ID: ${nextTask.id}`);
      console.log(`Title: ${nextTask.title}`);
      console.log(`Status: ${nextTask.status}`);
      console.log(`Priority: ${nextTask.priority}`);
      console.log(`Description: ${nextTask.description}`);
      console.log(`Dependencies: ${nextTask.dependencies.join(', ')}`);
      console.log(`Test Strategy: ${nextTask.testStrategy}`);
    } else {
      console.log('No pending tasks found.');
    }
  } catch (error) {
    console.error('Error showing next task:', error);
  }
}

function setTaskStatus(options) {
  if (!options.id || !options.status) {
    console.error('Missing required parameters: --id and --status');
    return;
  }

  try {
    const tasks = loadTasks();
    const task = tasks.tasks.find(t => t.id === parseInt(options.id));
    
    if (task) {
      task.status = options.status;
      saveTasks(tasks);
      console.log(`Updated task ${options.id} status to ${options.status}`);
    } else {
      console.error(`Task ${options.id} not found`);
    }
  } catch (error) {
    console.error('Error updating task status:', error);
  }
}

function loadTasks() {
  const tasksPath = path.join(process.cwd(), 'tasks', 'tasks.json');
  return JSON.parse(fs.readFileSync(tasksPath, 'utf8'));
}

function saveTasks(tasks) {
  const tasksPath = path.join(process.cwd(), 'tasks', 'tasks.json');
  fs.writeFileSync(tasksPath, JSON.stringify(tasks, null, 2));
}

function findNextTask(tasks) {
  return tasks.find(task => 
    task.status === 'pending' && 
    task.dependencies.every(depId => 
      tasks.find(t => t.id === depId)?.status === 'done'
    )
  );
}

function generateTasksFromPRD(prdContent) {
  // Basic task structure
  const tasks = {
    meta: {
      generatedAt: new Date().toISOString(),
      projectName: "Bible Verse Website",
      version: "1.0.0"
    },
    tasks: []
  };

  // Helper function to add a task
  function addTask(title, description, priority = "medium", dependencies = []) {
    tasks.tasks.push({
      id: tasks.tasks.length + 1,
      title,
      description,
      status: "pending",
      priority,
      dependencies,
      details: description,
      testStrategy: `Verify ${title.toLowerCase()} works as expected`
    });
  }

  // Phase 1: MVP Tasks
  addTask(
    "Setup Project Structure",
    "Initialize project with basic file structure and dependencies",
    "high"
  );

  addTask(
    "Create Basic Express Server",
    "Set up Express.js server with static file serving",
    "high",
    [1]
  );

  addTask(
    "Implement Verse Data Structure",
    "Create JSON structure for verses and implement verse extraction script",
    "high",
    [1]
  );

  addTask(
    "Create Basic Frontend UI",
    "Implement basic HTML/CSS structure with verse display card",
    "high",
    [1, 2]
  );

  addTask(
    "Implement Random Verse Selection",
    "Create API endpoint and frontend logic for random verse display",
    "high",
    [2, 3, 4]
  );

  // Phase 2: Enhancement Tasks
  addTask(
    "Implement Background Image System",
    "Create image download script and theme mapping system",
    "medium",
    [5]
  );

  addTask(
    "Add Verse Transitions",
    "Implement smooth transitions between verses",
    "medium",
    [5]
  );

  addTask(
    "Setup Ad Integration",
    "Add placeholder ad banner and prepare for ad network integration",
    "medium",
    [4]
  );

  // Phase 3: Optimization Tasks
  addTask(
    "Optimize Image Loading",
    "Implement lazy loading and CDN integration for background images",
    "medium",
    [6]
  );

  addTask(
    "Add Analytics Integration",
    "Set up analytics to track page views and user engagement",
    "low",
    [5]
  );

  addTask(
    "Implement SEO Optimization",
    "Add meta tags and optimize for search engines",
    "low",
    [5]
  );

  addTask(
    "Add Error Handling",
    "Implement comprehensive error handling and fallbacks",
    "medium",
    [5]
  );

  return tasks;
} 