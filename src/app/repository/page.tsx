'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { AvailableIssueOps } from '@/lib/data'
import { Category } from '@/lib/enums'

export default function Home() {
  const filteredIssueOps = AvailableIssueOps.filter(
    (issueOp) => issueOp.category === Category.REPOSITORY
  )

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="min-h-[100px] rounded-xl bg-muted/50 items-center justify-items-center pt-5 pb-5">
        <h1 className="text-5xl font-bold">IssueOps Self-Service Portal</h1>
      </div>
      <hr />
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        {filteredIssueOps.map((issueOp) => (
          <div
            className="aspect-video rounded-xl bg-muted/50"
            key={issueOp.name}>
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <issueOp.icon className="h-6 w-6 text-blue-500" />
                  {issueOp.name}
                </CardTitle>
                <CardDescription>{issueOp.description}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto flex justify-end items-end">
                <Button className="bg-blue-500 text-white py-2 px-4 rounded">
                  Go
                </Button>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}
