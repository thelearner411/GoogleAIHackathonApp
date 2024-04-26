import { cookies } from 'next/headers'
import { decode } from 'next-auth/jwt';
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {

    // On home page, check if Google user session is present in order to redirect user to generate page
    if (request.nextUrl.pathname === "/") {
        const cookieStore = cookies();
        const nextAuthSessionCookie: any = cookieStore.get('next-auth.session-token');

        // Get user credentials from next-auth session token if it exsists
        let userData: any = null;
        if (nextAuthSessionCookie !== undefined && nextAuthSessionCookie && "value" in nextAuthSessionCookie) {
            userData = await decode({
                token: nextAuthSessionCookie.value,
                secret: process.env.NEXTAUTH_SECRET!,
            });

            // If valid Google user session is found, redirect to /generate page
            return NextResponse.redirect(new URL('/generate', request.url))
        } else {
            userData = null;
        }
    }

}