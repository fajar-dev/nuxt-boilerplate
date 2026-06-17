<template>
  <UModal 
    title="Add Contact"
    description="Fill in the details to create a new contact."
    v-model:open="open" 
    :ui="{ 
      content: 'sm:max-w-md', 
      overlay: 'bg-black/40',
      footer: 'justify-end'
    }"
  >
    <template #body>
      <UForm id="add-contact-form" :schema="schema" :state="form" @submit="handleSubmit" class="space-y-2">
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
        <UButton label="Cancel"  @click="open = false" color="neutral" variant="outline" />
        <UButton
          
          type="submit"
          form="add-contact-form"
          color="primary"
          :loading="isSubmitting"
        >
          Save
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { z } from 'zod'
import { contactService } from '~/services/contact-service'
import type { ContactPayload } from '~/types/contact'

const open = defineModel<boolean>({ default: false })
const emit = defineEmits<{ created: [] }>()
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

const resetForm = () => {
  form.name = ''
  form.email = ''
  form.phone = ''
}

const handleSubmit = async () => {
  isSubmitting.value = true
  try {
    const response = await contactService.create(form)
    if (response.success) {
      toast.add({
        title: 'Contact created successfully!',
        color: 'success',
        icon: 'i-lucide-circle-check'
      })
      emit('created')
      open.value = false
      resetForm()
    } 
  } finally {
    isSubmitting.value = false
  }
}

watch(open, (val) => {
  if (!val) resetForm()
})
</script>
