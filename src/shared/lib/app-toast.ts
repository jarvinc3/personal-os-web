import { toast } from 'sonner';

type ToastPayload = {
  text1: string;
  text2?: string;
};

export const appToast = {
  success({ text1, text2 }: ToastPayload) {
    toast.success(text1, { description: text2 });
  },
  error({ text1, text2 }: ToastPayload) {
    toast.error(text1, { description: text2 });
  },
  info({ text1, text2 }: ToastPayload) {
    toast.info(text1, { description: text2 });
  },
  warning({ text1, text2 }: ToastPayload) {
    toast.warning(text1, { description: text2 });
  },
};
