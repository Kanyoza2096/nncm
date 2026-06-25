import { initializeApp, getApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User,
  signOut as firebaseSignOut
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App if not already done
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/calendar');
provider.addScope('https://www.googleapis.com/auth/calendar.events');

// In-memory token storage to avoid storing credentials in localStorage
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const initGoogleAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user && cachedAccessToken) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  if (isSigningIn) return null;
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to obtain Google Calendar OAuth access token.');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error('[Google OAuth] Error during authentication:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const googleSignOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
    cachedAccessToken = null;
  } catch (err) {
    console.error('[Google OAuth] Error during sign out:', err);
  }
};

export const getGoogleAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const isGoogleConnected = (): boolean => {
  return cachedAccessToken !== null && auth.currentUser !== null;
};

export interface SyncResult {
  sundayService: 'created' | 'updated' | 'skipped' | 'failed';
  bibleStudy: 'created' | 'updated' | 'skipped' | 'failed';
  timezone: string;
}

/**
 * Creates or updates recurring Sunday Service and Bible Study events in the user's primary Google Calendar.
 */
export const syncChurchReminders = async (useMalawiTimezone: boolean = true): Promise<SyncResult> => {
  const token = getGoogleAccessToken();
  if (!token) {
    throw new Error('Google Calendar is not authenticated. Please log in first.');
  }

  // Define target timezone: Africa/Blantyre (CAT, UTC+2) or dynamic local timezone
  const targetTimezone = useMalawiTimezone ? 'Africa/Blantyre' : Intl.DateTimeFormat().resolvedOptions().timeZone || 'Africa/Blantyre';
  console.log('[Google Calendar] Syncing events using timezone:', targetTimezone);

  // We find next Sunday and next Wednesday to anchor the recurring events start date
  const now = new Date();
  
  // Next Sunday
  const nextSunday = new Date(now);
  nextSunday.setDate(now.getDate() + ((7 - now.getDay()) % 7));
  nextSunday.setHours(6, 0, 0, 0); // 6:00 AM

  // Next Wednesday
  const nextWednesday = new Date(now);
  nextWednesday.setDate(now.getDate() + ((3 - now.getDay() + 7) % 7));
  if (nextWednesday < now && now.getDay() === 3 && now.getHours() >= 14) {
    nextWednesday.setDate(nextWednesday.getDate() + 7);
  }
  nextWednesday.setHours(14, 0, 0, 0); // 2:00 PM (14:00)

  // Format Helper to generate strings like 2026-06-28T06:00:00
  const formatDateTimeLocal = (date: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };

  const sundayStartStr = formatDateTimeLocal(nextSunday);
  const sundayEndStr = formatDateTimeLocal(new Date(nextSunday.getTime() + 2.5 * 60 * 60 * 1000)); // 2.5 hrs duration

  const wednesdayStartStr = formatDateTimeLocal(nextWednesday);
  const wednesdayEndStr = formatDateTimeLocal(new Date(nextWednesday.getTime() + 1.5 * 60 * 60 * 1000)); // 1.5 hrs duration

  const sundayEventBody = {
    summary: 'NNCM Sunday Service',
    description: 'Weekly Sunday Worship and Word Service at New Nature In Christ Ministry (NNCM). Transforming lives by the power of the Holy Spirit.',
    location: 'NNCM Sanctuary, Zomba, Malawi',
    start: {
      dateTime: sundayStartStr,
      timeZone: targetTimezone
    },
    end: {
      dateTime: sundayEndStr,
      timeZone: targetTimezone
    },
    recurrence: [
      'RRULE:FREQ=WEEKLY;BYDAY=SU'
    ],
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 30 },
        { method: 'email', minutes: 120 }
      ]
    }
  };

  const wednesdayEventBody = {
    summary: 'NNCM Bible Study',
    description: 'Weekly interactive Bible Study and Deep Word Fellowship at New Nature In Christ Ministry (NNCM). Teaching the uncompromised word of God.',
    location: 'NNCM Sanctuary / Online Portal',
    start: {
      dateTime: wednesdayStartStr,
      timeZone: targetTimezone
    },
    end: {
      dateTime: wednesdayEndStr,
      timeZone: targetTimezone
    },
    recurrence: [
      'RRULE:FREQ=WEEKLY;BYDAY=WE'
    ],
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 30 },
        { method: 'email', minutes: 120 }
      ]
    }
  };

  const result: SyncResult = {
    sundayService: 'failed',
    bibleStudy: 'failed',
    timezone: targetTimezone
  };

  // 1. Fetch existing events to check for duplicates
  let existingSundayEventId: string | null = null;
  let existingWednesdayEventId: string | null = null;

  try {
    const listResponse = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=100&q=NNCM',
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    if (listResponse.ok) {
      const data = await listResponse.json();
      const eventsList = data.items || [];
      
      const sundayEvent = eventsList.find((e: any) => e.summary === 'NNCM Sunday Service' && !e.status?.includes('cancelled'));
      const wednesdayEvent = eventsList.find((e: any) => e.summary === 'NNCM Bible Study' && !e.status?.includes('cancelled'));

      if (sundayEvent) existingSundayEventId = sundayEvent.id;
      if (wednesdayEvent) existingWednesdayEventId = wednesdayEvent.id;
    }
  } catch (err) {
    console.warn('[Google Calendar] Failed to check existing events:', err);
  }

  // 2. Sync Sunday Service Event
  try {
    const url = existingSundayEventId 
      ? `https://www.googleapis.com/calendar/v3/calendars/primary/events/${existingSundayEventId}`
      : 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
    
    const method = existingSundayEventId ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sundayEventBody)
    });

    if (response.ok) {
      result.sundayService = existingSundayEventId ? 'updated' : 'created';
    } else {
      const errText = await response.text();
      console.error('[Google Calendar] Sunday Service creation failed:', errText);
      result.sundayService = 'failed';
    }
  } catch (err) {
    console.error('[Google Calendar] Sunday Service sync error:', err);
    result.sundayService = 'failed';
  }

  // 3. Sync Wednesday Bible Study Event
  try {
    const url = existingWednesdayEventId 
      ? `https://www.googleapis.com/calendar/v3/calendars/primary/events/${existingWednesdayEventId}`
      : 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
    
    const method = existingWednesdayEventId ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(wednesdayEventBody)
    });

    if (response.ok) {
      result.bibleStudy = existingWednesdayEventId ? 'updated' : 'created';
    } else {
      const errText = await response.text();
      console.error('[Google Calendar] Bible Study creation failed:', errText);
      result.bibleStudy = 'failed';
    }
  } catch (err) {
    console.error('[Google Calendar] Bible Study sync error:', err);
    result.bibleStudy = 'failed';
  }

  return result;
};
