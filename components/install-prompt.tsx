'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Download, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showIOSDialog, setShowIOSDialog] = useState(false)

  useEffect(() => {
    // Check if iOS
    setIsIOS(
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream
    )

    // Check if already installed
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches)

    // Listen for the beforeinstallprompt event (Android/Desktop)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSDialog(true)
      return
    }

    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setDeferredPrompt(null)
      }
    }
  }

  // Don't show if already installed
  if (isStandalone) {
    return null
  }

  // Don't show on non-iOS if no install prompt available
  if (!isIOS && !deferredPrompt) {
    return null
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleInstallClick}
        title="Install app"
      >
        <Download className="size-5" />
      </Button>

      {/* iOS Installation Dialog */}
      <Dialog open={showIOSDialog} onOpenChange={setShowIOSDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Install Momento</DialogTitle>
            <DialogDescription className="space-y-3 pt-2">
              <p>To install this app on your iOS device:</p>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>
                  Tap the share button{' '}
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-muted rounded">
                    ⎋
                  </span>
                </li>
                <li>
                  Scroll down and tap{' '}
                  <span className="font-medium">&quot;Add to Home Screen&quot;</span>{' '}
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-muted rounded">
                    ➕
                  </span>
                </li>
                <li>
                  Tap <span className="font-medium">&quot;Add&quot;</span> to confirm
                </li>
              </ol>
            </DialogDescription>
          </DialogHeader>
          <Button
            variant="outline"
            onClick={() => setShowIOSDialog(false)}
            className="mt-2"
          >
            <X className="size-4 mr-2" />
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </>
  )
}
