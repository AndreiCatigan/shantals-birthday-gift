import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  callbacks: {
    async signIn({ user }) {
      const allowedEmails = [
        "andreicatigan@gmail.com", 
        "shantalclairesuening@gmail.com"
      ];
      
      if (user.email && allowedEmails.includes(user.email)) {
        return true;
      }
      return false; // Denies access to everyone else
    },
  },
  pages: {
    signIn: "/", // Redirect users to the home page to sign in
  }
})