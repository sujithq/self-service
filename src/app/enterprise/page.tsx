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
import { getIssueCreationUrl } from '@/lib/utils'

export default function Home() {
  const filteredIssueOps = AvailableIssueOps.filter(
    (issueOp) => issueOp.category === Category.ENTERPRISE
  )

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="min-h-[100px] rounded-xl bg-muted/50 items-center justify-items-center text-center pt-5 pb-5">
        <h1 className="text-5xl font-bold">IssueOps Self-Service Portal</h1>
      </div>
      <hr />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-min">
        {filteredIssueOps.map((issueOp) => (
          <div
            className="rounded-xl bg-muted/50 min-w-[200px] max-w-full w-full mx-auto"
            key={issueOp.name}>
            <Card className="h-full flex flex-col min-h-[200px]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <issueOp.icon className="h-6 w-6 text-blue-500" />
                  {issueOp.name}
                </CardTitle>
                <CardDescription>{issueOp.description}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto flex justify-end items-end">
                <Button
                  className="bg-blue-500 text-white py-2 px-4 rounded"
                  onClick={() =>
                    window.open(
                      getIssueCreationUrl({
                        issueFormTemplate: issueOp.issueFormTemplate,
                        labels: [issueOp.label, 'issue-ops']
                      }),
                      '_blank'
                    )
                  }>
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
