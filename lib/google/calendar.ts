/**
 * Google Calendar utilities.
 * Creates meeting events in:
 *  1. The shared company calendar (GOOGLE_CALENDAR_ID)
 *  2. Each participant's personal calendar (as invited guests)
 */
import { google } from 'googleapis'
import { getServiceAccountAuth } from './auth'

export interface MeetingParticipant {
  email: string
  displayName?: string
}

export interface CreateMeetingEventParams {
  title: string
  description?: string
  /** ISO 8601 datetime string, e.g. "2024-05-10T14:00:00-03:00" */
  startDateTime: string
  /** ISO 8601 datetime string */
  endDateTime: string
  participants: MeetingParticipant[]
  /** Google Meet link will be automatically created */
  createMeet?: boolean
}

/**
 * Creates a Google Calendar event in the shared company calendar and
 * sends invites to all participants.
 *
 * @returns The created event ID
 */
export async function createMeetingEvent(params: CreateMeetingEventParams): Promise<string> {
  const calendarId = process.env.GOOGLE_CALENDAR_ID

  if (!calendarId) {
    throw new Error('GOOGLE_CALENDAR_ID não configurado no .env.local')
  }

  const auth = getServiceAccountAuth()
  const calendar = google.calendar({ version: 'v3', auth })

  const attendees = params.participants.map((p) => ({
    email: p.email,
    displayName: p.displayName,
  }))

  const eventBody: any = {
    summary: params.title,
    description: params.description || '',
    start: {
      dateTime: params.startDateTime,
      timeZone: 'America/Sao_Paulo',
    },
    end: {
      dateTime: params.endDateTime,
      timeZone: 'America/Sao_Paulo',
    },
    attendees,
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 }, // 1 day before
        { method: 'popup', minutes: 30 },       // 30 min before
      ],
    },
    guestsCanModify: false,
    guestsCanSeeOtherGuests: true,
    sendUpdates: 'all', // Sends invites to all attendees
  }

  // Add Google Meet conference
  if (params.createMeet !== false) {
    eventBody.conferenceData = {
      createRequest: {
        requestId: `duasmaos-${Date.now()}`,
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    }
  }

  const res = await calendar.events.insert({
    calendarId,
    requestBody: eventBody,
    conferenceDataVersion: params.createMeet !== false ? 1 : 0,
    sendNotifications: true,
  })

  return res.data.id!
}

/**
 * Updates an existing Google Calendar event.
 */
export async function updateMeetingEvent(
  eventId: string,
  updates: Partial<CreateMeetingEventParams>
): Promise<void> {
  const calendarId = process.env.GOOGLE_CALENDAR_ID
  if (!calendarId) throw new Error('GOOGLE_CALENDAR_ID não configurado.')

  const auth = getServiceAccountAuth()
  const calendar = google.calendar({ version: 'v3', auth })

  const patch: any = {}
  if (updates.title) patch.summary = updates.title
  if (updates.description) patch.description = updates.description
  if (updates.startDateTime) patch.start = { dateTime: updates.startDateTime, timeZone: 'America/Sao_Paulo' }
  if (updates.endDateTime) patch.end = { dateTime: updates.endDateTime, timeZone: 'America/Sao_Paulo' }
  if (updates.participants) {
    patch.attendees = updates.participants.map((p) => ({ email: p.email, displayName: p.displayName }))
  }

  await calendar.events.patch({
    calendarId,
    eventId,
    requestBody: patch,
    sendUpdates: 'all',
  })
}

/**
 * Deletes a Google Calendar event.
 */
export async function deleteMeetingEvent(eventId: string): Promise<void> {
  const calendarId = process.env.GOOGLE_CALENDAR_ID
  if (!calendarId) throw new Error('GOOGLE_CALENDAR_ID não configurado.')

  const auth = getServiceAccountAuth()
  const calendar = google.calendar({ version: 'v3', auth })

  await calendar.events.delete({
    calendarId,
    eventId,
    sendUpdates: 'all',
  })
}
