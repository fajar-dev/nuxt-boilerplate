import { apiService } from "./api-service"
import { handleServiceError } from "../composables/error-helper"
import type { Contact, ContactPayload, ApiResponse } from "../types/contact"

export class ContactService {

    private get authHeaders() {
        return { headers: { Authorization: `Bearer ${useAuth().state.token}` } }
    }

    async getAll(page = 1, perPage = 10, q = ''): Promise<ApiResponse<Contact[]>> {
        try {
            const response = await apiService.client.get<ApiResponse<Contact[]>>(
                `/contact?page=${page}&perPage=${perPage}&q=${q}`,
                this.authHeaders
            )
            return response.data
        } catch (error: any) {
            return handleServiceError(error)
        }
    }

    async getById(id: number): Promise<ApiResponse<Contact>> {
        try {
            const response = await apiService.client.get<ApiResponse<Contact>>(
                `/contact/${id}`,
                this.authHeaders
            )
            return response.data
        } catch (error: any) {
            return handleServiceError(error)
        }
    }

    async create(payload: ContactPayload): Promise<ApiResponse<Contact>> {
        try {
            const response = await apiService.client.post<ApiResponse<Contact>>(
                `/contact`,
                payload,
                this.authHeaders
            )
            return response.data
        } catch (error: any) {
            return handleServiceError(error)
        }
    }

    async update(id: number, payload: ContactPayload): Promise<ApiResponse<Contact>> {
        try {
            const response = await apiService.client.put<ApiResponse<Contact>>(
                `/contact/${id}`,
                payload,
                this.authHeaders
            )
            return response.data
        } catch (error: any) {
            return handleServiceError(error)
        }
    }

    async delete(id: number): Promise<ApiResponse<null>> {
        try {
            const response = await apiService.client.delete<ApiResponse<null>>(
                `/contact/${id}`,
                this.authHeaders
            )
            return response.data
        } catch (error: any) {
            return handleServiceError(error)
        }
    }
}

export const contactService = new ContactService()
