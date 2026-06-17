<template>
  <UModal 
    title="Edit Contact"
    description="Update the contact information below."
    v-model:open="open" 
    :ui="{ 
      content: 'sm:max-w-md', 
      overlay: 'bg-black/40',
      footer: 'justify-end'
    }"
  >
    <template #body>
      <UForm id="update-contact-form" :schema="schema" :state="form" @submit="handleSubmit" class="space-y-2">
        <UFormField label="Name" name="name">
          <UInput v-model="form.name" placeholder="Enter name" class="w-full" />
        </UFormField>
        <UFormField label="Email" name="email">
          <UInput v-model="form.email" type="email" placeholder="Enter email" class="w-full" />
        </UFormField>
        <UFormField label="Phone" name="phone">
          <UInput v-model="form.phone" placeholder="Enter phone number" class="w-full" />
        </UFormField>
      </UForm>
    </template>
    <template #footer>
      <div class="flex justify-end items-center gap-2 w-full">
        <UButton  label="Cancel" @click="open = false" color="neutral" variant="outline" />
        <UButton
          
          type="submit"
          form="update-contact-form"
          color="primary"
          :loading="isSubmitting"
        >
          Save Changes
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { z } from 'zod'
import { contactService } from '~/services/contact-service'
import type { Contact, ContactPayload } from '~/types/contact'

const open = defineModel<boolean>({ default: false })

const props = defineProps<{
  contact: Contact | null
}>()

const emit = defineEmits<{ updated: [] }>()
const toast = useToast()
const isSubmitting = ref(false)

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  phone: z.string().min(1, 'Phone is required')
})

const form = reactive<ContactPayload>({
  name: '',
  email: '',
  phone: ''
})

const populateForm = () => {
  if (props.contact) {
    form.name = props.contact.name
    form.email = props.contact.email
    form.phone = props.contact.phone
  }
}

const handleSubmit = async () => {
  if (!props.contact) return
  isSubmitting.value = true
  try {
    const response = await contactService.update(props.contact.id, form)
    if (response.success) {
      toast.add({
        title: 'Contact updated successfully!',
        color: 'success',
        icon: 'i-lucide-circle-check'
      })
      emit('updated')
      open.value = false
    }
  } finally {
    isSubmitting.value = false
  }
}

watch(open, (val) => {
  if (val) populateForm()
})
</script>
