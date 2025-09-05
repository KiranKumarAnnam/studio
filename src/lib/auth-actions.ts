'use server';

import { sign, verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { promises as fs } from 'fs';
import path from 'path';
import type { User } from './types';
import { logActivity } from './logger';
import { redirect } from 'next/navigation';


// In a real app, you'd use a more secure secret and manage it properly.
const JWT_SECRET = process.env.JWT_SECRET || 'this-is-a-super-secret-key-that-should-be-in-env';
const USERS_DB_PATH = path.join(process.cwd(), 'src', 'lib', 'users.json');

async function getUsers(): Promise<User[]> {
  try {
    await logActivity('[getUsers] Reading users database.');
    const data = await fs.readFile(USERS_DB_PATH, 'utf-8');
    const users = JSON.parse(data) as User[];
    await logActivity(`[getUsers] Found ${users.length} users.`);
    return users;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      await logActivity('[getUsers] users.json not found, returning empty array.');
      return [];
    }
    await logActivity(`[getUsers] Error reading users database: ${error}`);
    throw error;
  }
}

async function saveUsers(users: User[]): Promise<void> {
  await logActivity('[saveUsers] Saving users database.');
  await fs.writeFile(USERS_DB_PATH, JSON.stringify(users, null, 2), 'utf-8');
  await logActivity('[saveUsers] Users database saved successfully.');
}


async function createSession(email: string) {
    await logActivity(`[createSession] Creating session for user: '${email}'.`);
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    const session = sign({ email }, JWT_SECRET, { expiresIn: '24h' });
    await logActivity(`[createSession] JWT created.`);

    cookies().set('session', session, { expires, httpOnly: true });
    await logActivity(`[createSession] Session cookie set.`);
}

export async function getSession() {
  await logActivity('[getSession] Attempting to get session.');
  const sessionCookie = cookies().get('session')?.value;
  if (!sessionCookie) {
    await logActivity('[getSession] No session cookie found.');
    return null;
  }

  try {
    await logActivity('[getSession] Verifying session cookie.');
    const decoded = verify(sessionCookie, JWT_SECRET) as { email: string; iat: number; exp: number };
    await logActivity(`[getSession] Session verified for user: '${decoded.email}'.`);
    return { user: { email: decoded.email } };
  } catch (error) {
    await logActivity(`[getSession] Session verification failed: ${error}`);
    return null;
  }
}

export async function logout() {
    const session = await getSession();
    if(session?.user?.email) {
        await logActivity(`User '${session.user.email}' logged out.`);
    }
    cookies().set('session', '', { expires: new Date(0) });
    redirect('/login');
}

export async function login(credentials: any): Promise<{ error?: string } | undefined> {
  await logActivity(`[login] Attempting login for email: '${credentials.email}'.`);
  let user;
  try {
    const users = await getUsers();
    user = users.find(u => u.email === credentials.email);

    if (!user || user.password !== credentials.password) {
      await logActivity(`[login] Login failed: Invalid credentials for email '${credentials.email}'.`);
      return { error: 'Invalid email or password.' };
    }
  } catch (error) {
    await logActivity(`[login] An exception occurred during login: ${error}`);
    return { error: 'A server error occurred.' };
  }
  
  await createSession(user.email);
  await logActivity(`[login] Login successful for '${user.email}'. Redirecting.`);
  redirect('/');
}

export async function signup(credentials: any): Promise<{ error?: string } | undefined> {
  await logActivity(`[signup] Attempting signup for email: '${credentials.email}'.`);
  let newUser: User;
  try {
    const users = await getUsers();
    const existingUser = users.find(u => u.email === credentials.email);

    if (existingUser) {
      await logActivity(`[signup] Signup failed: Email already exists for '${credentials.email}'.`);
      return { error: 'An account with this email already exists.' };
    }

    newUser = {
      id: (users.length + 1).toString(),
      email: credentials.email,
      password: credentials.password,
    };

    users.push(newUser);
    await saveUsers(users);
  } catch (error) {
    await logActivity(`[signup] An exception occurred during signup: ${error}`);
    return { error: 'A server error occurred.' };
  }

  await createSession(newUser.email);
  await logActivity(`[signup] New user signed up: '${newUser.email}'. Redirecting.`);
  redirect('/');
}
