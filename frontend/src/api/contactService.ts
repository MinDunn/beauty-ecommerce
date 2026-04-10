import axiosInstance from './axiosInstance';

export interface ContactData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export const contactService = {
  createContact: async (data: ContactData) => {
    const response = await axiosInstance.post('/contacts', data);
    return response.data;
  }
};
