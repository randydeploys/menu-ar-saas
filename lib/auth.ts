import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";
import { sendEmail } from "./email";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  session: {
    additionalFields: {
      accounts: {
        type: "json",
        output: true,
      },
    },
  },
  socialProviders: {
    google: {
      enabled: true,
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      enabled: true,
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
  emailAndPassword: {
    enabled: true,
    async sendResetPassword({user, url}) {
      await sendEmail({
        to: user.email,
        subject: "Reset your password",
        text: `Please click on the link below to reset your password: ${url}`,
      })
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    authSignInAfterVerification: true,
    async sendVerificationEmail({user, url}) {
      await sendEmail({
        to: user.email,
        subject: "Verify your email address",
        text: `Please click on the link below to verify your email address: ${url}`,
      })
    },  
  },
  user: {
    changeEmail: {
      enabled: true,
      async sendChangeEmailVerification({user,newEmail,url}){
        await sendEmail({
          to: user.email,
          subject: "Verify your new email address",
          text: `Your email has been changed to ${newEmail}. Please click on the link below to verify your new email address: ${url}`,
        })
      }
    },
    additionalFields: {
     role:{
      type: "string",
      input : false,
      output : true,
     } 
    },
    
  },
  trustedOrigins: ['http://localhost:3001'],
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;