<template>
  <UModal v-model:open="open" :ui="{ content: 'sm:max-w-sm', overlay: 'bg-black/40' }">
    <template #content>
      <UCard :ui="{ body: 'flex flex-col gap-4 relative' }">

        <!-- Modal Header -->
        <div class="flex items-start justify-between select-none">
          <div class="space-y-1.5 pr-4">
            <h3 class="text-lg font-semibold text-neutral-900 leading-none tracking-tight">
              Delete Contact
            </h3>
            <p class="text-sm text-neutral-500 leading-normal">
              Are you sure you want to delete <span class="font-medium text-neutral-700">{{ contact?.name }}</span>? This action cannot be undone.
            </p>
          </div>
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-x"
            class="text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50 p-1 rounded-md shrink-0 cursor-pointer"
            @click="open = false"
            aria-label="Close"
          />
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-3">
          <UButton
            color="neutral"
            variant="outline"
            
            class="flex-1 justify-center"
            @click="open = false"
          >
            Cancel
          </UButton>
          <UButton
            color="error"
            
            :loading="isDeleting"
            class="flex-1 justify-center"
            @click="handleDelete"
          >
            Delete
          </UButton>
        </div>

      </UCard>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { contactService } from '~/services/contact-service'
import type { Contact } from '~/types/contact'

const open = defineModel<boolean>({ default: false })

const props = defineProps<{
  contact: Contact | null
}>()

const emit = defineEmits<{ deleted: [] }>()
const toast = useToast()
const isDeleting = ref(false)

const handleDelete = async () => {
  if (!props.contact) return
  isDeleting.value = true
  try {
    const response = await contactService.delete(props.contact.id)
    if (response.success) {
      toast.add({
        title: 'Contact deleted successfully!',
        color: 'success',
        icon: 'i-lucide-circle-check'
      })
      emit('deleted')
      open.value = false
    } else {
      toast.add({
        title: response.message || 'Failed to delete contact',
        color: 'error',
        icon: 'i-lucide-circle-x'
      })
    }
  } catch (error) {
    toast.add({
      title: 'An error occurred',
      color: 'error',
      icon: 'i-lucide-circle-x'
    })
  } finally {
    isDeleting.value = false
  }
}
</script>
