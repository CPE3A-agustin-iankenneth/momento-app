"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"

import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { MultiSelect, MultiSelectContent, MultiSelectGroup, MultiSelectItem, MultiSelectTrigger, MultiSelectValue } from "@/components/ui/multi-select"

import Image from 'next/image'
import UploadImage from "@/components/upload-image"
import { Input } from "@/components/ui/input"
import { useImageUpload } from "@/hooks/use-image-upload"
import { useUserTags } from "@/hooks/use-user-tags"
import { createMoment } from "@/app/actions/entries"

const formSchema = z.object({
    title: z.string().min(1, "Title is required").max(70, "Title must be at most 70 characters"),
    content: z.string().min(1, "Content is required").max(200, "Content must be at most 200 characters"),
    image: z.url({ message: "Invalid image URL" }),
    tags: z.array(z.string()).min(0),
})

type CreateFormProps = {
    signedUrl?: string | null;
    filePath?: string | null;
}

export default function CreateForm({ signedUrl, filePath }: CreateFormProps) {
    const { tags: userTags } = useUserTags();

    const decodedUrl = signedUrl ? decodeURIComponent(signedUrl) : null;
    const decodedFilePath = filePath ? decodeURIComponent(filePath) : null;

    const [currentFilePath, setCurrentFilePath] = useState<string | null>(decodedFilePath);
    const [url, setUrl] = useState<string | null>(decodedUrl);
    const router = useRouter();

    const { uploading } = useImageUpload()
    const [isPending, startTransition] = useTransition()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            content: '',
            image: decodedUrl || '',
            tags: [],
        }
    });

    const handleImageUpload = (uploadedUrl: string, uploadedFilePath: string) => {
        setUrl(uploadedUrl);
        setCurrentFilePath(uploadedFilePath);
    }

    async function onSubmit(data: z.infer<typeof formSchema>) {
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('content', data.content);
        formData.append('image', currentFilePath || '');
        formData.append('tags', JSON.stringify(data.tags));
        
        startTransition(async () => {
            try {
                await createMoment(formData)
            } catch (error) {
                console.error('Error creating moment:', error)
            }
        })
    }


    useEffect(() => {
        if (url) {
            router.replace(`/create?signedUrl=${encodeURIComponent(url)}&filePath=${encodeURIComponent(currentFilePath || '')}`);
        }
    }, [url, router, currentFilePath])

    return (
        <div className="w-full h-full overflow-y-auto">
            <div className="max-w-sm mx-auto px-4 py-8">
            <Card>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit, (e) => console.log(e))}>
                            {!decodedUrl ? (
                                <div className="border-4 border-dashed border-border rounded-md p-16 mb-4">
                                    <UploadImage 
                                        onUpload={handleImageUpload}
                                    />
                                </div>

                            ) : 
                            <div className="mb-4">
                                <Image src={decodedUrl} alt="Uploaded Image" width={300} height={300} className="rounded-md" />
                            </div>
                            }
                            <FormField 
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input placeholder="Title" className="mb-4" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField 
                                control={form.control}
                                name="tags"
                                render={({ field }) => (
                                    <FormItem className="mb-4">
                                        <FormLabel>Select Tags</FormLabel>
                                        <MultiSelect
                                            onValuesChange={(field.onChange)}
                                            values={field.value || []}
                                        >
                                            <FormControl>
                                                <MultiSelectTrigger className="w-full">
                                                    <MultiSelectValue placeholder="Select tags" />
                                                </MultiSelectTrigger>
                                            </FormControl>
                                            <MultiSelectContent
                                                allowCreate={true}
                                                createLabel="Create tag"
                                                search={{ 
                                                    placeholder: "Search or create tags...",
                                                    emptyMessage: "No tags found." 
                                                }}
                                            >
                                                <MultiSelectGroup>
                                                    {userTags?.map((tag) => (
                                                        <MultiSelectItem key={tag.id} value={tag.name}>
                                                            {tag.name}
                                                        </MultiSelectItem>
                                                    ))}
                                                </MultiSelectGroup>
                                            </MultiSelectContent>
                                        </MultiSelect>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField 
                                control={form.control}
                                name="content"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Textarea className="resize-none h-32 w-full min-w-0" placeholder="What's on your mind?" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="mt-4 w-full cursor-pointer" disabled={!decodedUrl || uploading || isPending}>{uploading || isPending ? 'Creating...' : 'Create Momento'}</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
            </div>
        </div>
    )
}