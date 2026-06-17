<template>
    <div class="space-y-6">
        <!-- Header -->
        <Header
          title="Contact Customer"
          description="Customer contact list and management"
        >
        </Header>

        <section class="space-y-5">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div class="flex items-center gap-2 w-full sm:w-auto">
                    <UInput v-model="search" icon="i-lucide-search" size="md" variant="outline" placeholder="Search..." class="flex-1 sm:flex-none sm:w-64" />
                    <USelect v-model="perPage" :items="limitOptions" class="w-20" />
                </div>
                <UButton
                    color="primary"
                    variant="solid"
                    icon="i-lucide-plus"
                    class="w-full sm:w-auto justify-center"
                    @click="showAddModal = true"
                >
                    Add Contact
                </UButton>
            </div>

            <div class="overflow-x-auto">
                <UTable 
                    :data="data" 
                    :columns="columns"
                    :loading="isLoading"
                    :ui="{ 
                        th: 'bg-neutral-50 py-2.5', 
                        td: 'text-neutral-900' 
                    }"
                    class="border border-neutral-200 rounded-md min-w-[640px]" 
                />
            </div>

            <div class="flex flex-col sm:flex-row items-center justify-between gap-3">
                <span class="text-sm text-muted-foreground">
                    Showing {{ meta.from || 0 }} to {{ meta.to || 0 }} of {{ meta.total }} results
                </span>
                <UPagination v-model:page="page" size="md" :total="meta.total" :items-per-page="perPage" />
            </div>
        </section>

        <!-- Modals -->
        <ContactAddModal v-model="showAddModal" @created="fetchContacts" />
        <ContactUpdateModal v-model="showUpdateModal" :contact="selectedContact" @updated="fetchContacts" />
        <DeleteModal 
          v-model="showDeleteModal" 
          title="Delete Contact" 
          :item-name="selectedContact?.name" 
          :loading="isDeleting"
          @confirm="handleDelete" 
        />
    </div>
</template>

<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import type { Row } from '@tanstack/vue-table'
import { contactService } from '~/services/contact-service'
import type { Contact } from '~/types/contact'

definePageMeta({
  layout: 'dashboard'
})

const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')

// State
const search = ref('')
const limitOptions = ref([10, 25, 50, 100])
const perPage = ref(10)
const page = ref(1)
const data = ref<Contact[]>([])
const isLoading = ref(false)
const selectedContact = ref<Contact | null>(null)

// Modal states
const showAddModal = ref(false)
const showUpdateModal = ref(false)
const showDeleteModal = ref(false)
const isDeleting = ref(false)

// Pagination meta
const meta = reactive({
  total: 0,
  from: 0,
  to: 0
})

// Fetch contacts from API
const fetchContacts = async () => {
  isLoading.value = true
  try {
    const response = await contactService.getAll(page.value, perPage.value, search.value)
    if (response.success) {
      data.value = response.data
      if (response.meta) {
        meta.total = response.meta.total
        meta.from = response.meta.from
        meta.to = response.meta.to
      }
    }
  } finally {
    isLoading.value = false
  }
}

// Watch for page & perPage changes
watch([page, perPage], () => {
  fetchContacts()
})

// Watch search with debounce
let searchTimeout: ReturnType<typeof setTimeout>
watch(search, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    page.value = 1
    fetchContacts()
  }, 300)
})

// Table columns
const columns: TableColumn<Contact>[] = [
  {
    accessorKey: 'id',
    header: '#',
    cell: ({ row }) => `#${row.getValue('id')}`
  },
  {
    accessorKey: 'name',
    header: 'Name'
  },
  {
    accessorKey: 'email',
    header: 'Email'
  },
  {
    accessorKey: 'phone',
    header: 'Phone'
  },
  {
    accessorKey: 'createdAt',
    header: 'Created At',
    cell: ({ row }) => {
      const val = row.getValue('createdAt') as string
      if (!val) return '-'
      return new Date(val).toLocaleString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    }
  },
  {
    id: 'actions',
    header: 'Action',
    meta: {
      class: {
        td: 'text-right',
        th: 'text-right'
      }
    },
    cell: ({ row }) => {
      return h(
        UDropdownMenu,
        {
          content: {
            align: 'end'
          },
          items: getRowItems(row),
          'aria-label': 'Actions dropdown'
        },
        () =>
          h(UButton, {
            icon: 'i-lucide-ellipsis-vertical',
            color: 'neutral',
            variant: 'ghost',
            'aria-label': 'Actions dropdown'
          })
      )
    }
  }
]

function getRowItems(row: Row<Contact>) {
  return [
    {
      label: 'Edit contact',
      icon: 'i-lucide-edit',
      onSelect() {
        selectedContact.value = row.original
        showUpdateModal.value = true
      }
    },
    {
      label: 'Delete contact',
      color: 'error',
      icon: 'i-lucide-trash',
      onSelect() {
        selectedContact.value = row.original
        showDeleteModal.value = true
      }
    }
  ]
}

// Handle delete
const toast = useToast()
const handleDelete = async () => {
  if (!selectedContact.value) return
  isDeleting.value = true
  try {
    const response = await contactService.delete(selectedContact.value.id)
    if (response.success) {
      toast.add({
        title: 'Contact deleted successfully!',
        color: 'success',
        icon: 'i-lucide-circle-check'
      })
    }
    showDeleteModal.value = false
    fetchContacts()
  } finally {
    isDeleting.value = false
  }
}

// Initial fetch
onMounted(() => {
  fetchContacts()
})
</script>