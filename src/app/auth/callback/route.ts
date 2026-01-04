import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      
      // Update these to your actual Gmail addresses
      const allowedEmails = ["andreicatigan@gmail.com", "shantalclairesuening@gmail.com"]

      if (user?.email && !allowedEmails.includes(user.email)) {
        await supabase.auth.signOut()
        return NextResponse.redirect(`${origin}/?error=unauthorized`)
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/?error=auth-failed`)
}