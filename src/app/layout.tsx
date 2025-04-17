import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'

const monaspaceArgon = localFont({
  src: '../public/fonts/MonaspaceArgonVarVF[wght,wdth,slnt].ttf',
  weight: '400',
  style: 'normal'
})

export const metadata: Metadata = {
  title: 'IssueOps Self-Service Portal',
  description: 'A one-stop shop for all things IssueOps'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${monaspaceArgon.className} antialiased`}>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>{children}</SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  )
}
