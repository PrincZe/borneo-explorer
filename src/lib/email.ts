import { Resend } from 'resend'
import type { Booking } from '@/types/database'

const FROM_EMAIL = 'MV Celebes Explorer <bookings@celebesexplorer.com>'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://borneo-explorer-chi.vercel.app'

export async function sendBookingConfirmationEmail(booking: Booking & {
  room_type?: { name: string } | null
  package?: { name: string } | null
}) {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.startsWith('re_placeholder')) {
    console.log('[Email] Skipped — no RESEND_API_KEY configured')
    return
  }

  await getResend().emails.send({
    from: FROM_EMAIL,
    to: booking.customer_email,
    subject: `Booking Received — ${booking.booking_ref} | MV Celebes Explorer`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #0077a8; padding: 24px; text-align: center;">
          <h1 style="color: white; margin: 0;">MV Celebes Explorer</h1>
          <p style="color: #b3e5fc; margin: 8px 0 0;">Sipadan Liveaboard Diving</p>
        </div>
        <div style="padding: 32px; background: #f9f9f9;">
          <h2 style="color: #0077a8;">Booking Received!</h2>
          <p>Dear ${booking.customer_name},</p>
          <p>Thank you for booking with MV Celebes Explorer. We have received your booking request and it is currently <strong>pending payment verification</strong>.</p>

          <div style="background: white; border-radius: 8px; padding: 20px; margin: 24px 0; border-left: 4px solid #0077a8;">
            <h3 style="margin-top: 0; color: #333;">Booking Summary</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 6px 0; color: #666;">Booking Reference</td><td style="padding: 6px 0; font-weight: bold;">${booking.booking_ref}</td></tr>
              <tr><td style="padding: 6px 0; color: #666;">Status</td><td style="padding: 6px 0;"><span style="background: #fff3cd; color: #856404; padding: 2px 8px; border-radius: 4px;">Pending Verification</span></td></tr>
              ${booking.room_type ? `<tr><td style="padding: 6px 0; color: #666;">Cabin</td><td style="padding: 6px 0;">${booking.room_type.name}</td></tr>` : ''}
              ${booking.package ? `<tr><td style="padding: 6px 0; color: #666;">Package</td><td style="padding: 6px 0;">${booking.package.name}</td></tr>` : ''}
              ${booking.check_in_date ? `<tr><td style="padding: 6px 0; color: #666;">Check-in</td><td style="padding: 6px 0;">${booking.check_in_date}</td></tr>` : ''}
              ${booking.check_out_date ? `<tr><td style="padding: 6px 0; color: #666;">Check-out</td><td style="padding: 6px 0;">${booking.check_out_date}</td></tr>` : ''}
              <tr><td style="padding: 6px 0; color: #666;">Guests</td><td style="padding: 6px 0;">${booking.num_guests}</td></tr>
              ${booking.total_amount ? `<tr><td style="padding: 6px 0; color: #666;">Total Amount</td><td style="padding: 6px 0; font-weight: bold; color: #0077a8;">SGD ${booking.total_amount.toLocaleString()}</td></tr>` : ''}
            </table>
          </div>

          <h3 style="color: #0077a8;">Payment Instructions</h3>
          <div style="background: white; border-radius: 8px; padding: 20px; margin: 16px 0;">
            <p><strong>Bank Transfer Details:</strong></p>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 4px 0; color: #666;">Bank</td><td style="padding: 4px 0;">Maybank</td></tr>
              <tr><td style="padding: 4px 0; color: #666;">Account Name</td><td style="padding: 4px 0;">Celebes Explorer Sdn Bhd</td></tr>
              <tr><td style="padding: 4px 0; color: #666;">Account Number</td><td style="padding: 4px 0;">5642 1234 5678</td></tr>
              <tr><td style="padding: 4px 0; color: #666;">Reference</td><td style="padding: 4px 0; font-weight: bold;">${booking.booking_ref}</td></tr>
            </table>
            <p style="color: #666; font-size: 14px; margin-top: 16px;">Please use your booking reference as the payment reference, then upload your receipt using the button below.</p>
          </div>

          <div style="text-align: center; margin: 24px 0;">
            <a href="${SITE_URL}/book/confirmation/${booking.id}"
               style="display: inline-block; background: #0077a8; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold;">
              View Booking &amp; Upload Receipt
            </a>
            <p style="color: #999; font-size: 12px; margin-top: 8px;">
              Or copy this link: ${SITE_URL}/book/confirmation/${booking.id}
            </p>
          </div>

          <p>If you have any questions, please contact us at <a href="mailto:info@celebesexplorer.com" style="color: #0077a8;">info@celebesexplorer.com</a></p>
          <p>We look forward to diving with you!</p>
          <p>The MV Celebes Explorer Team</p>
        </div>
        <div style="background: #333; padding: 16px; text-align: center;">
          <p style="color: #999; font-size: 12px; margin: 0;">MV Celebes Explorer | Semporna, Sabah, Malaysia</p>
        </div>
      </div>
    `,
  })
}

export async function sendBookingStatusEmail(
  booking: Booking,
  newStatus: 'confirmed' | 'cancelled'
) {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.startsWith('re_placeholder')) {
    console.log('[Email] Skipped — no RESEND_API_KEY configured')
    return
  }

  const isConfirmed = newStatus === 'confirmed'

  await getResend().emails.send({
    from: FROM_EMAIL,
    to: booking.customer_email,
    subject: isConfirmed
      ? `Booking Confirmed — ${booking.booking_ref} | MV Celebes Explorer`
      : `Booking Cancelled — ${booking.booking_ref} | MV Celebes Explorer`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #0077a8; padding: 24px; text-align: center;">
          <h1 style="color: white; margin: 0;">MV Celebes Explorer</h1>
        </div>
        <div style="padding: 32px; background: #f9f9f9;">
          <h2 style="color: ${isConfirmed ? '#2e7d32' : '#c62828'};">
            ${isConfirmed ? 'Your Booking is Confirmed!' : 'Booking Cancelled'}
          </h2>
          <p>Dear ${booking.customer_name},</p>
          ${isConfirmed
            ? `<p>Great news! Your booking <strong>${booking.booking_ref}</strong> has been confirmed. We have received and verified your payment.</p>
               <p>Please bring your certification card and log book on the day of departure. Our team will meet you at the jetty.</p>`
            : `<p>We regret to inform you that your booking <strong>${booking.booking_ref}</strong> has been cancelled.</p>
               <p>If you believe this is an error or would like to rebook, please contact us at <a href="mailto:info@celebesexplorer.com" style="color: #0077a8;">info@celebesexplorer.com</a></p>`
          }
          <p>The MV Celebes Explorer Team</p>
        </div>
      </div>
    `,
  })
}
