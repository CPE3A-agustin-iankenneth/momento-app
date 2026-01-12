"use client"

import { Camera } from "lucide-react";
import { Sun } from "lucide-react";
import { Calendar } from "lucide-react";
import { CircleUser } from "lucide-react";
import { Images } from "lucide-react";
import { JSX } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useImageUpload } from "@/hooks/use-image-upload";

interface View {
    href?: string;
    icon: JSX.Element;
    action?: () => void;
}

export default function BottomNav() {
    const router = useRouter();

    const handleCameraUpload = (url: string, filePath: string) => {
        router.push(`/create?signedUrl=${encodeURIComponent(url)}&filePath=${encodeURIComponent(filePath)}`);
    }

    const { triggerUpload, uploading } = useImageUpload(handleCameraUpload);

    const views: View[] = [
        {
            href: "/",
            icon: <Sun />
        },
        {
            href: "/calendar",
            icon: <Calendar />
        },
        {
            action: triggerUpload,
            icon: (
                <div className="bg-primary p-4 rounded-full">
                    <Camera className="text-primary-foreground"/>
                </div>
            )

        },
        {
            href: "/gallery",
            icon: <Images />
        },
        {
            href: "/dashboard",
            icon: <CircleUser />
        }
    ]

    return (
        <div className="flex justify-between items-center py-4 px-8">
            {views.map((view, index) => {
                if (view.action) {
                    return (
                        <button
                            key={index}
                            onClick={view.action}
                            disabled={uploading}
                            className="flex flex-col items-center justify-center text-sm disabled:cursor-not-allowed active:scale-90 active:opacity-70 transition-transform duration-100"
                        >
                            {view.icon}
                        </button>
                    )
                }
                return (
                    <Link 
                        key={index} 
                        href={view.href!} 
                        className={`flex flex-col items-center justify-center text-sm active:scale-90 active:opacity-70 transition-transform duration-100`}
                    >
                        {view.icon}
                    </Link>
                )
            })}
        </div>
    );
}