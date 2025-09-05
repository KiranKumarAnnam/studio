
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
    await logActivity(`[createSession] Attempting to create session for user: '${email}'.`);
    try {
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        const session = sign({ email }, JWT_SECRET, { expiresIn: '24h' });
        await logActivity(`[createSession] JWT created for '${email}'.`);

        cookies().set('session', session, { expires, httpOnly: true });
        await logActivity(`[createSession] Session cookie set for '${email}'.`);
    } catch(e) {
        await logActivity(`[createSession] CRITICAL FAILURE creating session for '${email}': ${e}`);
        throw e;
    }
}

export async function getSession() {
  await logActivity('[getSession] Attempting to get session.');
  const sessionCookie = cookies().get('session')?.value;
  if (!sessionCookie) {
    await logActivity('[getSession] No session cookie found. Returning null.');
    return null;
  }
  await logActivity(`[getSession] Found session cookie: ${sessionCookie.substring(0,15)}...`);

  try {
    await logActivity('[getSession] Verifying session cookie...');
    const decoded = verify(sessionCookie, JWT_SECRET) as { email: string; iat: number; exp: number };
    await logActivity(`[getSession] SUCCESS: Session verified for user: '${decoded.email}'.`);
    return { user: { email: decoded.email } };
  } catch (error) {
    await logActivity(`[getSession] FAILED: Session verification failed: ${error}. Returning null.`);
    return null;
  }
}

export async function logout() {
    const session = await getSession();
    if(session?.user?.email) {
        await logActivity(`[logout] User '${session.user.email}' is logging out.`);
    } else {
        await logActivity(`[logout] Unauthenticated user is logging out.`);
    }
    cookies().set('session', '', { expires: new Date(0) });
    await logActivity('[logout] Session cookie cleared.');
    redirect('/login');
}

export async function login(credentials: any): Promise<{ error?: string } | void> {
    await logActivity(`[login] SERVER ACTION: Starting login for email: '${credentials.email}'.`);
    
    let user;
    try {
        const users = await getUsers();
        user = users.find(u => u.email === credentials.email);

        if (!user) {
          await logActivity(`[login] FAILURE: User not found for email '${credentials.email}'.`);
          return { error: 'Invalid email or password.' };
        }
        await logActivity(`[login] User found for email '${credentials.email}'.`);

        if (user.password !== credentials.password) {
          await logActivity(`[login] FAILURE: Invalid password for email '${credentials.email}'.`);
          return { error: 'Invalid email or password.' };
        }
        await logActivity(`[login] Password is correct for '${credentials.email}'.`);
        
        await createSession(user.email);
        await logActivity(`[login] Session created. Preparing to redirect.`);

    } catch (error) {
        await logActivity(`[login] CRITICAL FAILURE: An exception occurred during login process: ${error}`);
        return { error: 'A server error occurred during login.' };
    }
  
  await logActivity(`[login] Calling redirect('/').`);
  redirect('/');
}

export async function signup(credentials: any): Promise<{ error?: string } | void> {
    await logActivity(`[signup] SERVER ACTION: Starting signup for email: '${credentials.email}'.`);
    try {
        const users = await getUsers();
        const existingUser = users.find(u => u.email === credentials.email);

        if (existingUser) {
            await logActivity(`[signup] FAILURE: Email already exists for '${credentials.email}'.`);
            return { error: 'An account with this email already exists.' };
        }

        const newUser: User = {
          id: (users.length + 1).toString(),
          email: credentials.email,
          password: credentials.password,
        };
        await logActivity(`[signup] New user object created for '${credentials.email}'.`);

        users.push(newUser);
        await saveUsers(users);
        await logActivity(`[signup] New user saved for '${credentials.email}'.`);
        
        await createSession(newUser.email);
        await logActivity(`[signup] Session created for new user. Preparing to redirect.`);
    } catch (error) {
        await logActivity(`[signup] CRITICAL FAILURE: An exception occurred during signup: ${error}`);
        return { error: 'A server error occurred during signup.' };
    }

  await logActivity(`[signup] Calling redirect('/').`);
  redirect('/');
}
