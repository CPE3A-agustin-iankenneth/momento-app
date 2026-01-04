"use client"

import { forgotPassword } from '@/app/auth/actions'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useForm } from "react-hook-form"
import Link from 'next/link'
import { useState } from 'react'

import { Button } from "@/components/ui/button"
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
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"

const formSchema = z.object({
  email: z.email(),
})

export default function ForgotPasswordForm() {
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
   })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setMessage(null)
    setError(null)

    const formData = new FormData();
    formData.append('email', data.email);
    formData.append('callbackUrl', `${window.location.origin}/auth/callback?next=/reset-password`);
    
    const result = await forgotPassword(formData)
    
    if (result?.error) {
      setError(result.error)
    } else {
      setMessage('Check your email for the password reset link.')
    }
    setIsLoading(false)
  }

  return (
    <div className='flex flex-col w-lg items-center justify-center min-h-screen gap-4'>
      <h1 className='text-3xl'>momento</h1>
      <Card className='w-full max-w-sm'>
        <CardHeader>
            <CardTitle>Forgot Password</CardTitle>
            <CardDescription>Enter your email to reset your password</CardDescription>
        </CardHeader>
        <CardContent>
          {message ? (
             <div className="text-green-600 text-center mb-4">{message}</div>
          ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className='mb-6'>
                <FormField 
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="name@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
              <Button type='submit' className='w-full mb-2' disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>
          </Form>
          )}
          <div className='flex flex-col gap-2 items-center mt-4'>
            <Button asChild variant="link">
              <Link href="/login">Back to Login</Link>
            </Button>
          </div>
        </CardContent>
      </Card>   
    </div>
  )
}
