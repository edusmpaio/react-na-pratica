import { Check, Loader2 } from 'lucide-react'
import { Button } from './ui/button'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import * as Dialog from '@radix-ui/react-dialog'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const createTagSchema = z.object({
  title: z.string().min(3, { message: 'Minimum 3 characteres' }),
})

type CreateTagSchema = z.infer<typeof createTagSchema>

function getSlugFromString(input: string): string {
  return input
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, '-')
}

export function CreateTagForm() {
  const queryClient = useQueryClient()

  const { register, handleSubmit, watch, formState } = useForm<CreateTagSchema>(
    {
      resolver: zodResolver(createTagSchema),
    },
  )

  const slug = watch('title') ? getSlugFromString(watch('title')) : ''

  const { mutateAsync } = useMutation({
    mutationFn: async ({ title }: CreateTagSchema) => {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      await fetch('http://localhost:3333/tags', {
        method: 'POST',
        body: JSON.stringify({ title, slug, amountOfVideos: 0 }),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['get-tags'],
      })
    },
  })

  async function createTag({ title }: CreateTagSchema) {
    await mutateAsync({ title })
  }

  return (
    <form onSubmit={handleSubmit(createTag)} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium">
          Tag name
        </label>
        <input
          className="border border-zinc-800 rounded-lg px-3 h-10 w-full bg-zinc-800/20 text-sm outline-none focus:ring-1 focus:ring-zinc-700"
          type="text"
          id="title"
          {...register('title')}
        />
        {formState.errors?.title && (
          <p className="text-xs text-red-400">
            {formState.errors.title.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="slug" className="text-sm font-medium">
          Slug
        </label>
        <input
          className="border border-zinc-800 rounded-lg px-3 h-10 w-full bg-zinc-800/20 text-sm outline-none focus:ring-1 focus:ring-zinc-700"
          type="text"
          id="slug"
          readOnly
          value={slug}
        />
      </div>

      <div className="flex items-center justify-end gap-2.5">
        <Dialog.Close asChild>
          <Button className="bg-transparent border-zinc-800 text-zinc-500">
            Cancel
          </Button>
        </Dialog.Close>

        <Button
          type="submit"
          className="bg-teal-400 text-teal-950 hover:bg-teal-500"
          disabled={formState.isSubmitting}
        >
          {formState.isSubmitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Check className="size-4" />
          )}
          Save
        </Button>
      </div>
    </form>
  )
}
