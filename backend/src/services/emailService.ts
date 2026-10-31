import { Resend } from 'resend'
import env from '../../env.ts'

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null

export interface SendVerificationEmailParams {
  to: string
  displayName: string
  code: string
}

export const sendVerificationEmail = async ({
  to,
  displayName,
  code,
}: SendVerificationEmailParams) => {
  if (!resend || !env.RESEND_API_KEY || env.RESEND_API_KEY.trim() === '') {
    console.warn(
      `⚠️ [EMAIL SIMULATION] RESEND_API_KEY is not set in backend/.env.\n` +
      `   Real email was NOT dispatched. Verification code for ${to} is: 👉 [ ${code} ]`
    )
    return { success: false, simulated: true, code }
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Verify your TES Hub Account</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f6f4; margin: 0; padding: 30px 10px; }
        .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8e2; }
        .header { background: #012D1D; padding: 32px 24px; text-align: center; }
        .header h1 { color: #ffffff; font-size: 24px; margin: 0; font-weight: 800; letter-spacing: -0.5px; }
        .header p { color: #84cc9a; font-size: 13px; margin: 6px 0 0 0; font-weight: 500; }
        .content { padding: 36px 32px; color: #1f2937; }
        .greeting { font-size: 17px; font-weight: 600; color: #111827; margin-bottom: 12px; }
        .message { font-size: 14px; line-height: 1.6; color: #4b5563; margin-bottom: 24px; }
        .code-box { background: #f0fdf4; border: 2px dashed #16a34a; border-radius: 12px; padding: 20px; text-align: center; margin: 28px 0; }
        .code-title { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #15803d; font-weight: 700; margin-bottom: 8px; }
        .code-value { font-size: 36px; font-weight: 800; color: #012D1D; letter-spacing: 8px; font-family: 'Courier New', Courier, monospace; }
        .note { font-size: 12px; color: #6b7280; line-height: 1.5; margin-top: 24px; }
        .footer { background: #fafbfa; padding: 20px 32px; text-align: center; font-size: 11px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🌱 TES Knowledge Hub</h1>
          <p>Agricultural Innovation & Climate Knowledge Platform</p>
        </div>
        <div class="content">
          <div class="greeting">Hello, ${displayName || 'Farmer'}!</div>
          <p class="message">
            Thank you for registering on <strong>TES Knowledge Hub</strong>. To complete your account activation and access agricultural guides, courses, and expert sessions, please enter this 6-digit verification code:
          </p>
          <div class="code-box">
            <div class="code-title">Your 6-Digit Verification Code</div>
            <div class="code-value">${code}</div>
          </div>
          <p class="note">
            ⏱️ This code will expire in <strong>15 minutes</strong>.<br>
            🔒 If you did not create an account on TES Knowledge Hub, you can safely disregard this message.
          </p>
        </div>
        <div class="footer">
          &copy; 2026 TES Knowledge Hub &bull; Empowering Central Asian Sustainable Agriculture
        </div>
      </div>
    </body>
    </html>
  `

  const plainText = `Hello ${displayName || 'Farmer'},\n\nYour TES Knowledge Hub verification code is: ${code}\n\nThis code will expire in 15 minutes.\n\nIf you did not request this registration, please ignore this email.\n\n--\nTES Knowledge Hub Team`

  try {
    const { data, error } = await resend.emails.send({
      from: env.EMAIL_FROM,
      to,
      subject: `${code} is your TES Knowledge Hub verification code`,
      html: htmlContent,
      text: plainText,
    })

    if (error) {
      console.error('❌ [RESEND ERROR]', error)
      return { success: false, error }
    }

    console.log(`✅ [RESEND SUCCESS] Real verification email delivered to ${to}! Message ID: ${data?.id}`)
    return { success: true, id: data?.id }
  } catch (err) {
    console.error('❌ [EMAIL EXCEPTION]', err)
    return { success: false, error: err }
  }
}
