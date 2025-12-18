import type { FileOrFolder, User } from './types';
import { PlaceHolderImages } from './placeholder-images';

const users: User[] = [
  { id: 'user1', name: 'Alice', avatar: PlaceHolderImages.find(p => p.id === 'avatar1')! },
  { id: 'user2', name: 'Bob', avatar: PlaceHolderImages.find(p => p.id === 'avatar2')! },
  { id: 'user3', name: 'Charlie', avatar: PlaceHolderImages.find(p => p.id === 'avatar3')! },
  { id: 'user4', name: 'Diana', avatar: PlaceHolderImages.find(p => p.id === 'avatar4')! },
];

export const files: FileOrFolder[] = [
  {
    id: '1',
    name: 'Q3_Financials',
    type: 'folder',
    size: '1.2 GB',
    lastModified: '2 days ago',
    members: [users[0], users[1]],
  },
  {
    id: '2',
    name: 'Corporate Deck.doc',
    type: 'doc',
    size: '15.3 MB',
    lastModified: '3 hours ago',
    members: [users[0]],
    thumbnail: PlaceHolderImages.find(p => p.id === 'thumbnail-corporate-deck'),
  },
  {
    id: '3',
    name: 'Brand_Guidelines_v2.pdf',
    type: 'pdf',
    size: '8.1 MB',
    lastModified: '1 day ago',
    members: [users[1], users[2]],
  },
  {
    id: '4',
    name: 'Summer Vacation.jpg',
    type: 'jpg',
    size: '4.2 MB',
    lastModified: '5 days ago',
    members: [users[3]],
    thumbnail: PlaceHolderImages.find(p => p.id === 'thumbnail-summer-vacation'),
  },
  {
    id: '5',
    name: 'Onboarding',
    type: 'folder',
    size: '512 MB',
    lastModified: '1 week ago',
    members: [users[0], users[2], users[3]],
  },
  {
    id: '6',
    name: 'Drone Footage.mp4',
    type: 'mp4',
    size: '850 MB',
    lastModified: '20 minutes ago',
    members: [users[0], users[3]],
    thumbnail: PlaceHolderImages.find(p => p.id === 'thumbnail-drone-footage'),
  },
  {
    id: '7',
    name: 'Website_Copy.doc',
    type: 'doc',
    size: '256 KB',
    lastModified: '4 days ago',
    members: [users[1]],
  },
  {
    id: '8',
    name: 'Logo_Assets',
    type: 'folder',
    size: '78 MB',
    lastModified: '2 weeks ago',
    members: [users[0], users[1], users[2]],
  },
];
