import NextAuth, { getServerSession } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { supabaseAdmin } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export const authOptions = {
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials: any) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required')
        }

        const { data: user, error } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('email', credentials.email)
          .single()

        if (error || !user) {
          throw new Error('Invalid credentials')
        }

        if (!user.isVerified) {
          throw new Error('Please verify your email first')
        }

        if (user.isBanned) {
          throw new Error('Your account has been banned')
        }

        if (user.isSuspended) {
          throw new Error('Your account has been suspended')
        }

        const isValid = await bcrypt.compare(credentials.password, user.password)

        if (!isValid) {
          throw new Error('Invalid credentials')
        }

        await supabaseAdmin
          .from('users')
          .update({ lastLoginAt: new Date().toISOString() })
          .eq('id', user.id)

        return {
          id: user.id,
          email: user.email,
          username: user.username,
          isAdmin: user.email === process.env.ADMIN_EMAIL,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.id = user.id
        token.username = user.username
        token.isAdmin = user.isAdmin
      }
      return token
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token) {
        session.user.id = token.id
        session.user.username = token.username
        session.user.isAdmin = token.isAdmin
      }
      return session
    },
  },
}

export { getServerSession }
export const auth = () => getServerSession(authOptions)
export default NextAuth(authOptions)
