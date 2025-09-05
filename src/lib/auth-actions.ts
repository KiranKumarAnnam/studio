'use server';

import { sign, verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { promises as fs } from 'fs';
import path from 'path';
import type { User } from './types';
import { logActivity } from './logger';


// In a real app, you'd use a more secure secret and manage it properly.
const JWT_SECRET = process.env.JWT_SECRET || 'this-is-a-super-secret-key-that-should-be-in-env';
const USERS_DB_PATH = path.join(process.cwd(), 'src', 'lib', 'users.json');

async function getUsers(): Promise<User[]> {
  try {
    const data = await fs.readFile(USERS_DB_PATH, 'utf-8');
    return JSON.parse(data) as User[];
  } catch (error) {
    // If the file doesn't exist, return an empty array
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function saveUsers(users: User[]): Promise<void> {
  await fs.writeFile(USERS_DB_PATH, JSON.stringify(users, null, 2), 'utf-8');
}


async function createSession(email: string) {
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    const session = sign({ email }, JWT_SECRET, { expiresIn: '24h' });

    cookies().set('session', session, { expires, httpOnly: true });
}

export async function getSession() {
  const sessionCookie = cookies().get('session')?.value;
  if (!sessionCookie) return null;

  try {
    const decoded = verify(sessionCookie, JWT_SECRET) as { email: string; iat: number; exp: number };
    return { user: { email: decoded.email } };
  } catch (error) {
    return null;
  }
}

export async function logout() {
    const session = await getSession();
    if(session?.user?.email) {
        await logActivity(`User '${session.user.email}' logged out.`);
    }
    cookies().set('session', '', { expires: new Date(0) });
}

export async function login(credentials: any) {
  const users = await getUsers();
  const user = users.find(u => u.email === credentials.email);

  if (!user || user.password !== credentials.password) {
    await logActivity(`Failed login attempt for email: '${credentials.email}'.`);
    return { success: false, error: 'Invalid email or password.' };
  }
  
  await createSession(user.email);
  await logActivity(`User '${user.email}' logged in successfully.`);
  return { success: true };
}

export async function signup(credentials: any) {
  const users = await getUsers();
  const existingUser = users.find(u => u.email === credentials.email);

  if (existingUser) {
    await logActivity(`Failed signup attempt for existing email: '${credentials.email}'.`);
    return { success: false, error: 'An account with this email already exists.' };
  }

  const newUser: User = {
    id: (users.length + 1).toString(),
    email: credentials.email,
    // IMPORTANT: In a real app, NEVER store plain text passwords.
    // Always hash and salt them using a library like bcrypt.
    password: credentials.password,
  };

  users.push(newUser);
  await saveUsers(users);
  
  await createSession(newUser.email);
  await logActivity(`New user signed up: '${newUser.email}'.`);
  return { success: true };
}
