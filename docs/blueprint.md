# **App Name**: ProDrive

## Core Features:

- Secure File Storage: Store files securely using object storage with S3-compatible service.
- Web Disk Access: Access files as if they were on a local drive with virtual file system mapping, offline access, and synchronization.
- User Authentication and Permissions: Implement secure user authentication with role-based permission controls at both folder and file level.
- Real-time Collaboration: Enable real-time collaboration features using WebSocket Gateway to synchronize changes across connected clients, showing presence and progress.
- Media Processing: Process media files with workers: create thumbnails, convert videos to HLS for streaming, extract metadata.
- Monetization: Allow storage tiers, team drives, expiring links, brandable shares and API access to drive revenue generation.
- AI Indexing Suggestion Tool: Allow AI to reason about document content to determine if indexing a file's data should be high-priority and include the indexing task into worker queue.

## Style Guidelines:

- Primary color: Deep blue (#2962FF) for trust and stability.
- Background color: Light gray (#F4F5F7), almost the same hue as the primary, to give the app a professional and clean feel.
- Accent color: Green (#50FA7B) for active states and highlights.
- Body font: 'Inter' (sans-serif) for body text, providing a neutral, readable, and modern appearance.
- Headline font: 'Space Grotesk' (sans-serif) for headlines, providing a computerized, techy, scientific feel. Note: currently only Google Fonts are supported.
- Consistent and professional icon set used across the application to represent files, folders, and actions.
- Grid view for media files and list view for general files.
- Subtle animations for file uploads, downloads, and real-time updates.