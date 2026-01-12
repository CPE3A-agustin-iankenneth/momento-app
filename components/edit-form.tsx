"use client"

import { useState, useTransition } from "react"
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useForm } from "react-hook-form"
import { Entry } from "@/lib/types" 

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent } from "@/components/ui/card"
import Image from 'next/image'
import { Input } from "@/components/ui/input"
import { MultiSelect, MultiSelectContent, MultiSelectGroup, MultiSelectItem, MultiSelectTrigger, MultiSelectValue } from "@/components/ui/multi-select"
import { useUserTags } from "@/hooks/use-user-tags"
import { ArrowLeft, Trash2 } from "lucide-react"
import Link from "next/link"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { updateEntry, deleteEntry } from "@/app/actions/entries"

const formSchema = z.object({
    title: z.string().min(1, "Title is required").max(70, "Title must be at most 70 characters"),
    content: z.string().min(1, "Content is required").max(200, "Content must be at most 200 characters"),
    image: z.url({ message: "Invalid image URL" }).optional(),
    tags: z.array(z.string()).min(0),
})



export default function EditForm({ entry }: { entry: Entry }) {
    const [isPending, startTransition] = useTransition()
    const [deleting, setDeleting] = useState<boolean>(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
    const { tags: userTags } = useUserTags();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),

        defaultValues: {
            title: entry.title || '',
            content: entry.text || '',
            image: entry.image_url || '',
            tags: entry.tags?.map(tag => tag.name) || [], 
        }
    });

    async function handleDelete() {
        setDeleting(true);
        try {
            await deleteEntry(entry.id)
        } catch (error) {
            console.error('Error deleting momento:', error);
            setDeleting(false);
            setShowDeleteDialog(false);
        }
    }

    

    async function onSubmit(data: z.infer<typeof formSchema>) {
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('content', data.content);
        formData.append('tags', JSON.stringify(data.tags));

        startTransition(async () => {
            try {
                await updateEntry(entry.id, formData)
            } catch (error) {
                console.error('Error updating moment:', error)
            }
        })
    }

    return (
        <div className="w-full h-full overflow-y-auto">
            <div className="max-w-sm mx-auto px-4 py-8">
            {/* Back Button */}
            <nav className="mb-6">
                <Link href={`/entry/${entry.id}`} className="flex items-center text-muted-foreground hover:text-foreground active:opacity-70 transition-all duration-100">
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    <span>Back to entry</span>
                </Link>
            </nav>

            <Card>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="mb-4">
                                <Image src={entry.image_url} alt="Uploaded Image" width={300} height={300} className="rounded-md" />
                            </div>
                            <FormField 
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Title" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField 
                                control={form.control}
                                name="tags"
                                render={({ field }) => (
                                    <FormItem>
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
                                                    {/* Map tags associated with the user */}
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
                                        <FormLabel>Content</FormLabel>
                                        <FormControl>
                                            <Textarea className="resize-none h-32 w-full min-w-0" placeholder="What's on your mind?" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="mt-4 w-full" disabled={isPending}>
                                {isPending ? 'Updating...' : 'Update Momento'}
                            </Button>
                        </form>
                    </Form>

                    {/* Delete Button */}
                    <div className="mt-6 pt-6 border-t border-border">
                        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                            <DialogTrigger asChild>
                                <Button variant="ghost" className="w-full text-destructive hover:text-destructive hover:bg-destructive/10">
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Momento
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Delete this momento?</DialogTitle>
                                    <DialogDescription>
                                        This action cannot be undone. This will permanently delete your momento and its associated image.
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter className="gap-2 sm:gap-0">
                                    <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                                        Cancel
                                    </Button>
                                    <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                                        {deleting ? 'Deleting...' : 'Delete'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardContent>
            </Card>
            </div>
        </div>
    );
}