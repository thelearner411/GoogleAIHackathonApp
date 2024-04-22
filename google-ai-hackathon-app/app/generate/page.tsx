"use client"
import { useEffect, useState } from "react"
import Image from "next/image";
import Link from "next/link";
import Header from "@/app/components/Navigation/Header";
import Footer from "@/app/components/Navigation/Footer";
import UserPromptForm from "@/app/components/Forms/UserPromptForm";
import GeneratedContent from "@/app/components/Content/GeneratedContent";
import { UserFormProps, UserFormType } from "@/app/types/Forms";
import { GeneratedContentError, GeneratedContentSuccess, GeneratedContentWarnings } from "@/app/types/Response";

export default function GenerateScreen() {

    const [userPrompt, setUserPrompt] = useState<UserFormProps>({
        "prompt": "",
        "image": null,
        "content_type": "1"
    });

    const [contentGenerationRunning, setContentGenerationRunning] = useState<boolean>(false);

    const [generatedContent, setGeneratedContent] = useState<GeneratedContentError | GeneratedContentSuccess | GeneratedContentWarnings | null>(null);

    return (
        <>
            <div className={`page-container`}>

                {/* Header */}
                <div>
                    <Header />
                </div>

                <div>
                    <div>
                        <div className={"mx-20 mb-5 max-[450px]:mx-10"}>
                            <div className={"grid grid-cols-2 gap-20 max-[850px]:grid-cols-1"}>

                                {/* User Prompt Form */}
                                <div className={"w-full"}>

                                    <UserPromptForm
                                        userPrompt={userPrompt}
                                        setUserPrompt={setUserPrompt}
                                        contentGenerationRunning={contentGenerationRunning}
                                        setContentGenerationRunning={setContentGenerationRunning}
                                        generatedContent={generatedContent}
                                        setGeneratedContent={setGeneratedContent}
                                    />


                                </div>

                                {/* Generated Content */}
                                <div className={"w-full"}>
                                    <GeneratedContent
                                        userPrompt={userPrompt}
                                        setUserPrompt={setUserPrompt}
                                        contentGenerationRunning={contentGenerationRunning}
                                        setContentGenerationRunning={setContentGenerationRunning}
                                        generatedContent={generatedContent}
                                        setGeneratedContent={setGeneratedContent}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className={"sticky"}>
                    <Footer />
                </div>

            </div >
        </>
    );
}
