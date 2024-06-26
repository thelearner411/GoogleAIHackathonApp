import { NextRequest, NextResponse } from "next/server"
import { decode } from 'next-auth/jwt';
import { uuidv7 } from "uuidv7";
import { getUserIdFromEmail } from "@/app/api/db/Users"
import { addLiteraturePrompt, addGeneratedLiteratureContent, getLiteratureContentTypeById } from "@/app/api/db/Literature"
import { getNowUtc } from "@/app/utils/Dates"
import { generateTextFromTextPrompt } from "@/app/api/genAi/GenerativeAIFunctions"
import { getCookieData } from "@/app/api/cookies/cookies"

export async function POST(request: NextRequest, response: NextResponse) {
    try {
        const request_timestamp: any = getNowUtc();
        const payload = await request.json();

        if (payload.prompt.trim() === "") {
            return NextResponse.json({
                "input_error": "Prompt cannot be empty",
            }, {
                status: 400
            });
        } else {
            if (payload.prompt.trim().length > 300) {
                return NextResponse.json({
                    "input_error": "Prompt must be 300 characters maximum.",
                }, {
                    status: 400
                });
            }
        }

        // Get content type from database
        const literatureContentTypeRes: any = await getLiteratureContentTypeById(payload.content_type)
        let contentType: string = "story";
        if ("response" in literatureContentTypeRes && literatureContentTypeRes.response.length > 0) {
            contentType = literatureContentTypeRes.response[0].content_type.toLowerCase();
        }

        // Generate content with only text prompt
        const generatedContentJson = await generateTextFromTextPrompt(contentType, payload.prompt);

        // Check cookies to see if next-auth session token exists
        const cookieStore: any = await getCookieData();
        const nextAuthSessionCookie: any = cookieStore.get('next-auth.session-token');

        // Get user credentials from next-auth session token if it exsists
        let userData: any = null;
        let userId: string = "";
        if (nextAuthSessionCookie !== undefined && nextAuthSessionCookie && "value" in nextAuthSessionCookie) {
            userData = await decode({
                token: nextAuthSessionCookie.value,
                secret: process.env.NEXTAUTH_SECRET!,
            });

            // Get user Id for email decoded in next-auth sessiont token
            const userIdFromEmail = await getUserIdFromEmail(userData.email);

            if ("response" in userIdFromEmail) {
                userId = userIdFromEmail.response[0].id
            }
        } else {
            userData = null;
        }

        // If there is a present Google session, save literature prompt and generated content to database
        if (userData && userId !== "" && "response" in generatedContentJson) {
            const promptId: string = uuidv7();
            const finalPayload = {
                ...payload,
                "image": null
            }

            // Save literature prompt to database
            const addLiteraturePromptRes = await addLiteraturePrompt(promptId, userId, request_timestamp, payload, generatedContentJson);

            // Use generated id for literature prompt to save generated literature content in database
            if ("prompt_id" in addLiteraturePromptRes) {
                const addGeneratedLiteratureContentRes = await addGeneratedLiteratureContent(userId, promptId, payload, generatedContentJson);
            }

        }

        const status: number = "warnings" in generatedContentJson ? 400 : "error" in generatedContentJson ? 500 : 200;

        return NextResponse.json(generatedContentJson, { status: status });

    } catch (error: any) {
        console.log(`Error generating text content from prompt :${error.message}.`)
        return NextResponse.json({
            "error": error.message,
        }, {
            status: 500
        });
    }
}