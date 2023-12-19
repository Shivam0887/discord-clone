"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { ModalData, onClose } from "@/features/modalSlice";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/file-upload";

import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";

const formSchema = z.object({
  fileUrl: z.string().min(1, {
    message: "Attachment is required",
  }),
});

const MessageFileModal = () => {
  const { isOpen, type, data } = useAppSelector((state) => state.modal);
  const dispatch = useAppDispatch();

  const router = useRouter();
  const form = useForm({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {
      fileUrl: "",
    },
  });

  const { apiUrl, query } = data as ModalData;
  const isModalOpen = isOpen && type === "messageFile";
  const isFormSubmitting = form.formState.isSubmitting;

  const onSumbit = async (values: z.infer<typeof formSchema>) => {
    try {
      const url = `${apiUrl}?serverId=${query?.serverId}&channelId=${query?.channelId}`;
      await fetch(url, {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(values),
      });

      form.reset();
      router.refresh();
      handleClose();
    } catch (error: any) {
      console.log(error.message);
    }
  };

  const handleClose = () => {
    form.reset();
    dispatch(onClose());
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Add an attachment
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            Send a file as a message
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSumbit)} className="space-y-8">
            <div className="space-y-8 px-6">
              <div className="flex items-center justify-center text-center">
                <FormField
                  control={form.control}
                  name="fileUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FileUpload
                          endpoint="attachedFile"
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <DialogFooter className="bg-gray-100 px-6 py-4">
              <Button variant="primary" disabled={isFormSubmitting}>
                Send
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default MessageFileModal;
