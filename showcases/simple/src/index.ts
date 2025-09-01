import { safeSift } from 'safe-sift';

interface User {
  id: number;
  name: string;
  age: number;
  email: string;
  profile: {
    active: boolean;
    department: string;
  };
}

const users: User[] = [
  {
    id: 1,
    name: 'Alice Johnson',
    age: 28,
    email: 'alice@example.com',
    profile: { active: true, department: 'Engineering' }
  },
  {
    id: 2,
    name: 'Bob Smith',
    age: 35,
    email: 'bob@example.com',
    profile: { active: false, department: 'Marketing' }
  },
  {
    id: 3,
    name: 'Alice Brown',
    age: 24,
    email: 'alice.brown@example.com',
    profile: { active: true, department: 'Design' }
  }
];

const queryByName = safeSift<User>({ name: 'Alice Johnson' });
const result = queryByName.filter(users);

console.log('Users named "Alice Johnson":', result);