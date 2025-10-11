# Full Stack Application

This project is a full-stack application built with Next.js for both frontend and backend, with API routes handling server-side logic.

## Project Structure

```
mhc-project
├── app                   # Next.js app directory
│   ├── api               # API routes (backend)
│   │   └── [route]       # Dynamic API endpoints
│   ├── components        # React components
│   ├── page.jsx          # Home page
│   └── layout.jsx        # Root layout
├── public                # Public assets
├── styles                # Global styles
│   └── globals.css       # Global CSS with Tailwind
├── .env.local            # Environment variables (local)
├── next.config.js        # Next.js configuration
├── tailwind.config.js    # Tailwind CSS configuration
├── postcss.config.js     # PostCSS configuration
├── package.json          # Project dependencies and scripts
└── README.md             # Project documentation
```

## Getting Started

### Prerequisites

- Node.js and npm installed on your machine.

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd mhc-project
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env.local` file for environment variables:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

### Running the Application

To start the development server:
```
npm run dev
```

The application will be available at `http://localhost:3000`.

### Built With

- Next.js
- React
- Tailwind CSS
- Node.js (via API Routes)

### License

This project is licensed under the MIT License.
