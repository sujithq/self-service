'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Form, FormControl, FormField } from '@/components/ui/form'
import { Toggle } from '@/components/ui/toggle'
import { AvailableIssueOps } from '@/lib/data'
import { Category } from '@/lib/enums'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const FormSchema = z.object({
  showEnterprise: z.boolean().default(true),
  showOrganization: z.boolean().default(true),
  showRepository: z.boolean().default(true)
})

export default function Home() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema) as any,
    defaultValues: {
      showEnterprise: true,
      showOrganization: true,
      showRepository: true
    }
  })

  const [showEnterprise, setShowEnterprise] = useState(true)
  const [showOrganization, setShowOrganization] = useState(true)
  const [showRepository, setShowRepository] = useState(true)

  const filteredIssueOps = AvailableIssueOps.filter((issueOp) => {
    if (issueOp.category === Category.ENTERPRISE && !showEnterprise)
      return false
    if (issueOp.category === Category.ORGANIZATION && !showOrganization)
      return false
    if (issueOp.category === Category.REPOSITORY && !showRepository)
      return false
    return true
  })

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="min-h-[100px] rounded-xl bg-muted/50 items-center justify-items-center text-center pt-5 pb-5">
        <h1 className="text-5xl font-bold">IssueOps Self-Service Portal</h1>
      </div>
      <hr />
      <div className="rounded-xl bg-muted/50 p-4">
        <Form {...form}>
          <form className="w-full space-y-6">
            <div>
              <div className="flex flex-row gap-4">
                <div className="flex-1">
                  <FormField
                    control={form.control}
                    name="showEnterprise"
                    render={({ field }) => (
                      <FormControl className="w-full">
                        <Toggle
                          variant="outline"
                          pressed={field.value}
                          onPressedChange={(checked) => {
                            field.onChange(checked)
                            setShowEnterprise(checked)
                          }}
                          className="hover:bg-blue-500 data-[state=on]:hover:bg-blue-500">
                          Enterprise
                        </Toggle>
                      </FormControl>
                    )}
                  />
                </div>
                <div className="flex-1">
                  <FormField
                    control={form.control}
                    name="showOrganization"
                    render={({ field }) => (
                      <FormControl className="w-full">
                        <Toggle
                          variant="outline"
                          pressed={field.value}
                          onPressedChange={(checked) => {
                            field.onChange(checked)
                            setShowOrganization(checked)
                          }}
                          className="hover:bg-blue-500 data-[state=on]:hover:bg-blue-500">
                          Organization
                        </Toggle>
                      </FormControl>
                    )}
                  />
                </div>
                <div className="flex-1">
                  <FormField
                    control={form.control}
                    name="showRepository"
                    render={({ field }) => (
                      <FormControl className="w-full">
                        <Toggle
                          variant="outline"
                          pressed={field.value}
                          onPressedChange={(checked) => {
                            field.onChange(checked)
                            setShowRepository(checked)
                          }}
                          className="hover:bg-blue-500 data-[state=on]:hover:bg-blue-500">
                          Repository
                        </Toggle>
                      </FormControl>
                    )}
                  />
                </div>
              </div>
            </div>
          </form>
        </Form>
      </div>
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
