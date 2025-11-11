/**
 * Analytics API Route
 * Receives and processes analytics events
 */

import { createErrorResponse, logError } from '@/lib/errors/index'
import { generateRequestId } from '@/lib/utils'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const requestId = generateRequestId()

  try {
    const event = await request.json()

    // Validate event structure
    if (!event.name || !event.properties || !event.timestamp) {
      const response = createErrorResponse(
        400,
        'INVALID_EVENT',
        'Invalid event structure',
        requestId
      )
      return NextResponse.json(response, { status: 400 })
    }

    // Log analytics event
    // In production, send to analytics service (Mixpanel, Segment, etc.)
    console.log('Analytics Event:', {
      name: event.name,
      properties: event.properties,
      timestamp: new Date(event.timestamp).toISOString()
    })

    // Return success
    return NextResponse.json(
      {
        success: true,
        message: 'Event recorded',
        requestId
      },
      { status: 200 }
    )
  } catch (error) {
    logError(error, {
      requestId,
      endpoint: '/api/analytics',
      method: 'POST'
    })

    const response = createErrorResponse(
      500,
      'ANALYTICS_ERROR',
      'Failed to record event',
      requestId
    )
    return NextResponse.json(response, { status: 500 })
  }
}
