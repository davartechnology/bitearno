import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export async function sendResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Reset your Bitearno password',
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #ffc107;">⚡ Bitearno</h2>
        <p>You requested a password reset.</p>
        <a href="${resetUrl}" style="display:inline-block; background:#ffc107; color:#000; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:bold;">
          Reset Password
        </a>
        <p style="color:#999; font-size:12px; margin-top:16px;">
          This link expires in 1 hour. If you did not request this, ignore this email.
        </p>
      </div>
    `,
  })
}
