# Task Manager

A full-stack collaborative task management application with real-time updates, built with React, TypeScript, Node.js, and Socket.io.

## Tech Stack

### Frontend
- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** for styling
- **React Query (TanStack Query)** for state management
- **React Router DOM** for routing
- **Socket.io Client** for real-time functionality
- **React Hook Form** + **Zod** for form validation

### Backend
- **Node.js** + **Express** + **TypeScript**
- **Prisma ORM** with PostgreSQL database
- **Socket.io** for real-time WebSocket connections
- **JWT** for authentication with HTTP-only cookies
- **Zod** for runtime validation

## Setup Instructions

### Prerequisites

- Node.js 18+
- MongoDB database
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env
   ```
   
   Configure your `.env` file:
   ```env
   DATABASE_URL="mongodb://username:password@localhost:27017/taskmanager"
   JWT_SECRET="your-super-secret-jwt-key"
   CLIENT_URL="http://localhost:3000"
   PORT=5000
   ```

4. Set up the database:
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. Start the backend server:
   ```bash
   npm run dev
   ```

The backend will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

4. Configure your `.env` file:
   ```env
   VITE_BACKEND_URL=http://localhost:5000
   ```

5. Start the frontend development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:3000`

## API Contract Documentation

### Authentication Endpoints

#### POST `/api/v1/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "user-id",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

#### POST `/api/v1/auth/login`
Authenticate a user and set HTTP-only cookie.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "user-id",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

#### POST `/api/v1/auth/logout`
Clear the authentication cookie.

**Response:**
```json
{
  "status": "success",
  "message": "Logged out successfully"
}
```

### Task Endpoints

#### GET `/api/v1/tasks`
Retrieve all tasks with optional filtering.

**Query Parameters:**
- `status`: Filter by task status (TODO, IN_PROGRESS, REVIEW, COMPLETED)
- `priority`: Filter by priority (LOW, MEDIUM, HIGH, URGENT)
- `sortByDueDate`: Sort by due date (asc, desc)

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "task-id",
      "title": "Task Title",
      "description": "Task description",
      "dueDate": "2024-01-15T00:00:00.000Z",
      "priority": "HIGH",
      "status": "TODO",
      "creatorId": "creator-id",
      "assignedToId": "assigned-user-id",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "creator": {
        "id": "creator-id",
        "name": "Creator Name",
        "email": "creator@example.com"
      },
      "assignedTo": {
        "id": "assigned-user-id",
        "name": "Assigned User",
        "email": "assigned@example.com"
      }
    }
  ]
}
```

#### POST `/api/v1/tasks`
Create a new task.

**Request Body:**
```json
{
  "title": "New Task",
  "description": "Task description",
  "dueDate": "2024-01-15",
  "priority": "HIGH",
  "status": "TODO",
  "assignedToId": "assigned-user-id"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "new-task-id",
    "title": "New Task",
    "description": "Task description",
    "dueDate": "2024-01-15T00:00:00.000Z",
    "priority": "HIGH",
    "status": "TODO",
    "creatorId": "creator-id",
    "assignedToId": "assigned-user-id",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### PATCH `/api/v1/tasks/:id`
Update an existing task.

**Request Body:**
```json
{
  "title": "Updated Task Title",
  "description": "Updated description",
  "dueDate": "2024-01-20",
  "priority": "MEDIUM",
  "status": "IN_PROGRESS",
  "assignedToId": "new-assigned-user-id"
}
```

#### DELETE `/api/v1/tasks/:id`
Delete a task.

**Response:** `204 No Content`

### User Endpoints

#### GET `/api/v1/users/me`
Get current user information.

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "user-id",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### GET `/api/v1/users`
Get all users (for task assignment).

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "user-id",
      "name": "John Doe",
      "email": "john@example.com"
    }
  ]
}
```

### Notification Endpoints

#### GET `/api/v1/notifications`
Get unread notifications for current user.

**Response:**
```json
{
  "data": [
    {
      "id": "notification-id",
      "message": "You have been assigned to task: Task Title",
      "isRead": false,
      "createdAt": "2024-01-01T12:00:00.000Z"
    }
  ]
}
```

#### PATCH `/api/v1/notifications/:id/read`
Mark a notification as read.

**Response:**
```json
{
  "data": {
    "id": "notification-id",
    "message": "You have been assigned to task: Task Title",
    "isRead": true,
    "createdAt": "2024-01-01T12:00:00.000Z"
  }
}
```

#### POST `/api/v1/notifications/mark-all-read`
Mark all notifications as read.

**Response:**
```json
{
  "success": true
}
```

## Architecture Overview & Design Decisions

### Database Choice: MongoDB with Prisma ORM

**Why MongoDB?**
- **Flexibility**: Schema-less design allows rapid iteration and easy field additions
- **Scalability**: Horizontal scaling with sharding and replica sets
- **Performance**: Excellent for read-heavy applications with complex queries
- **Developer Experience**: Rich query capabilities and aggregation pipeline
- **JSON Native**: Perfect match for JavaScript/TypeScript applications

**Why Prisma ORM?**
- **Type Safety**: Auto-generated TypeScript types prevent runtime errors
- **Query Optimization**: Efficient query generation and connection pooling
- **Migration Management**: Version-controlled database schema changes
- **Developer Experience**: Intuitive API with excellent IDE support

### Authentication Strategy: JWT with HTTP-Only Cookies

**Design Decisions:**
- **HTTP-Only Cookies**: Prevent XSS attacks by making tokens inaccessible to JavaScript
- **JWT**: Stateless authentication for easy scaling
- **Secure Configuration**: `SameSite=Strict` and `Secure` flags in production

**Implementation:**
```typescript
// JWT middleware attaches user to request
const token = req.cookies.jwt;
const decoded = jwt.verify(token, process.env.JWT_SECRET);
req.user = decoded;
```

### Service Layer Architecture

**Three-Layer Architecture:**
1. **Controllers**: Handle HTTP requests/responses and validation
2. **Services**: Contain business logic and orchestration
3. **Repositories**: Handle database operations

**Benefits:**
- **Separation of Concerns**: Each layer has a single responsibility
- **Testability**: Easy to mock dependencies for unit testing
- **Maintainability**: Business logic is isolated from HTTP concerns

**Example Structure:**
```typescript
// Controller: HTTP handling
export const createTask = async (req: AuthRequest, res: Response) => {
  const task = await createTaskService(req.user!.id, req.body);
  return res.status(201).json({ status: 'success', data: task });
};

// Service: Business logic
export const createTaskService = (creatorId: string, data: CreateTaskInput) => {
  return createTaskRepo(creatorId, data);
};

// Repository: Database operations
export const createTaskRepo = async (creatorId: string, data: CreateTaskInput) => {
  return prisma.task.create({ data: { ...data, creatorId } });
};
```

### Frontend State Management: React Query

**Why React Query over Redux?**
- **Server State**: Optimized for API data with caching, refetching, and synchronization
- **Less Boilerplate**: No need for actions, reducers, or selectors
- **Built-in DevTools**: Excellent debugging capabilities
- **Optimistic Updates**: Smooth user experience with immediate UI updates

**Implementation:**
```typescript
// Automatic caching and refetching
const { data: tasks, isLoading } = useQuery({
  queryKey: ['tasks'],
  queryFn: fetchTasks,
});

// Optimistic updates with automatic rollback
const mutation = useMutation({
  mutationFn: updateTask,
  onMutate: async (newTask) => {
    await queryClient.cancelQueries(['tasks']);
    const previousTasks = queryClient.getQueryData(['tasks']);
    queryClient.setQueryData(['tasks'], old => 
      old?.map(task => task.id === newTask.id ? newTask : task)
    );
    return { previousTasks };
  },
  onError: (err, newTask, context) => {
    queryClient.setQueryData(['tasks'], context?.previousTasks);
  },
  onSettled: () => {
    queryClient.invalidateQueries(['tasks']);
  }
});
```

### Form Validation: React Hook Form + Zod

**Benefits:**
- **Type Safety**: Zod schemas provide runtime validation and TypeScript types
- **Performance**: Minimal re-renders with uncontrolled inputs
- **User Experience**: Real-time validation feedback

**Example:**
```typescript
// Shared schema for frontend and backend
const taskFormSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  dueDate: z.string(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED']),
  assignedToId: z.string().nullable()
});

// Type-safe form handling
const { register, handleSubmit, formState: { errors } } = useForm<TaskFormValues>({
  resolver: zodResolver(taskFormSchema),
  defaultValues: { title: '', priority: 'MEDIUM', status: 'TODO' }
});
```

## Socket.io Integration for Real-Time Functionality

### Architecture Overview

Socket.io enables bidirectional real-time communication between the frontend and backend, allowing instant updates across all connected clients.

### Backend Implementation

**Server Setup:**
```typescript
// Create HTTP server and Socket.io instance
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true
  }
});

// User room management
io.on('connection', (socket) => {
  socket.on('joinUserRoom', (userId: string) => {
    socket.join(userId);
  });
});
```

**Real-Time Events:**

1. **Task Creation:**
```typescript
// Broadcast to all users
io.emit('task:created', task);

// Notify assigned user (if different from creator)
if (task.assignedToId && task.assignedToId !== userId) {
  io.to(task.assignedToId).emit('task:assigned', assignmentData);
  await notifyTaskAssignment(task.assignedToId, task.id, task.title);
}
```

2. **Task Updates:**
```typescript
// Broadcast updated task to all users
io.emit('task:updated', updatedTask);

// Notify on reassignment
if (newAssignment && newAssignment !== previousAssignment && newAssignment !== currentUserId) {
  io.to(newAssignment).emit('task:assigned', assignmentData);
  await notifyTaskAssignment(newAssignment, task.id, task.title);
}
```

3. **Task Deletion:**
```typescript
io.emit('task:deleted', { id });
```

### Frontend Implementation

**Socket Connection Setup:**
```typescript
useEffect(() => {
  const socket = io(BACKEND_URL, { withCredentials: true });

  // Join user's personal room for targeted notifications
  const getUserId = async () => {
    const response = await fetch(`${BACKEND_URL}/api/v1/users/me`, {
      credentials: 'include'
    });
    const userData = await response.json();
    socket.emit('joinUserRoom', userData.data.id);
  };

  getUserId();

  return () => socket.disconnect();
}, []);
```

**Real-Time Event Listeners:**
```typescript
// Listen for task updates
socket.on('task:updated', (updatedTask: Task) => {
  queryClient.invalidateQueries({ queryKey: ['tasks'] });
  queryClient.setQueryData(['task', updatedTask.id], updatedTask);
});

// Listen for new tasks
socket.on('task:created', () => {
  queryClient.invalidateQueries({ queryKey: ['tasks'] });
});

// Listen for task deletions
socket.on('task:deleted', () => {
  queryClient.invalidateQueries({ queryKey: ['tasks'] });
});

// Listen for assignment notifications
socket.on('newNotification', (notification: Notification) => {
  queryClient.setQueryData(['notifications'], (old: Notification[] = []) => [
    notification,
    ...old
  ]);
  queryClient.invalidateQueries({ queryKey: ['notifications'] });
});
```

### Notification System

**Database Schema:**
```sql
model Notification {
  id        String   @id @default(cuid())
  userId    String
  taskId    String?
  message   String
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())
  
  user      User     @relation(fields: [userId], references: [id])
  task      Task?    @relation(fields: [taskId], references: [id])
}
```

**Notification Creation:**
```typescript
export const notifyTaskAssignment = async (userId: string, taskId: string, taskTitle: string) => {
  const message = `You have been assigned to task: ${taskTitle}`;
  
  const notification = await notificationModel.createNotification({
    userId,
    taskId,
    message
  });

  // Emit real-time notification to user's room
  io.to(userId).emit('newNotification', notification);

  return notification;
};
```

### Performance Optimizations

1. **Room-Based Messaging**: Users only receive relevant notifications
2. **Connection Management**: Automatic cleanup on disconnect
3. **Event Debouncing**: Prevent duplicate updates during rapid changes
4. **Selective Invalidation**: Only refresh affected queries

### Security Considerations

1. **CORS Configuration**: Restrict origins to trusted domains
2. **Authentication Verification**: Socket connections validated via JWT cookies
3. **Room Authorization**: Users can only join their own rooms
4. **Input Validation**: All event data validated before processing