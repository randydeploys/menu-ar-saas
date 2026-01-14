import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";
import { sendEmail } from "./email";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
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
    additionalFields: {
     role:{
      type: "string",
      input : false,
      output : true,
     } 
    }
  },
  trustedOrigins: ['http://localhost:3001'],
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;