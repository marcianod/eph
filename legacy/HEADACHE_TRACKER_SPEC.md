# Project Specification: Headache Tracker App

**To the AI Agent building this project:**
This project is a personal headache tracker for the user. It should be built using the exact same technology stack and architecture as their existing "GeoGuessr Stats" project to ensure maintainability and ease of hosting on the user's existing Vercel setup.

## 1. Technology Stack
**Strictly adhere to these versions/technologies:**

*   **Framework**: Next.js 15 (App Router)
    *   Version: `15.5.9` or later
*   **Language**: TypeScript
    *   Version: `^5`
*   **UI Library**: React 19
    *   Version: `19.1.0`
*   **Styling**: Tailwind CSS 4
    *   Version: `^4`
    *   Utils: `clsx`, `tailwind-merge`
*   **Database**: MongoDB (via MongoDB Atlas)
    *   Driver: `mongodb` (`^6.20.0`)
    *   Pattern: Native MongoDB driver (no Mongoose/Prisma unless requested, but native is preferred for this user's simple vector/data needs).
*   **Hosting**: Vercel
*   **Components**: Radix UI (Primitives) + Lucide React (Icons)

## 2. Database Configuration
The user has an existing MongoDB Atlas cluster. You will use the same cluster but a **different database name**.

### Environment Variable
The app requires a `MONGODB_URI` environment variable.

**Instruction for the Agent:**
Ask the user to provide their connection string. It will look like this:
`mongodb+srv://<username>:<password>@cluster0.xyz.mongodb.net/?retryWrites=true&w=majority`

**Critical Step:**
When connecting to the client, you must specify the new database name.
*   **Old App uses**: `gg-vector-db`
*   **New App should use**: `headache-tracker` (or similar)

**Code Pattern (`lib/db.ts`):**
```typescript
import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

const uri = process.env.MONGODB_URI;
const options = {};

let client;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;

// USAGE EXAMPLE:
// const client = await clientPromise;
// const db = client.db("headache-tracker");  <-- IMPORTANT: Database Name Here
```

## 3. Dependencies
Install these core dependencies to match the user's preferred stack:

```bash
npm install next@latest react@latest react-dom@latest mongodb date-fns clsx tailwind-merge lucide-react @radix-ui/react-slot @radix-ui/react-dialog @radix-ui/react-label @radix-ui/react-separator
npm install -D typescript @types/node @types/react @types/react-dom eslint postcss tailwindcss @tailwindcss/postcss
```

## 4. Project Structure
Follow this standard Next.js App Router structure:

```
/
├── app/
│   ├── layout.tsx      # Root layout (Html, Body)
│   ├── page.tsx        # Homepage (Dashboard)
│   ├── api/            # API Routes (e.g., /api/headaches)
│   └── globals.css     # Tailwind imports
├── components/
│   ├── ui/             # Reusable UI components (Buttons, Cards - accessible/Radix)
│   └── ...             # Feature components (e.g., HeadacheLogForm.tsx)
├── lib/
│   ├── db.ts           # MongoDB Connection (see above)
│   ├── utils.ts        # cn() helper for tailwind classes
│   └── types.ts        # TypeScript interfaces
├── .env.local          # Local secrets (MONGODB_URI)
└── package.json
```

## 5. Vercel Deployment
1.  Push code to a new GitHub repository: `headache-tracker`.
2.  Import project in Vercel.
3.  **Settings > Environment Variables**: Add `MONGODB_URI`.
    *   Value: The same string used in development.
4.  Deploy.
