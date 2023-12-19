"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/file-upload";

import { useRouter } from "next/navigation";

import { onClose } from "@/features/modalSlice";
import { useAppDispatch, useAppSelector } from "@/store";
import { useEffect } from "react";
import { ServerType } from "@/types";

const formSchema = z.object({
  serverName: z.string().min(1, {
    message: "Server name is required.",
  }),
  imageUrl: z.string().min(1, {
    message: "Server image is required.",
  }),
});

const EditServerModal = () => {
  const { isOpen, type, data } = useAppSelector((state) => state.modal);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {
      serverName: "",
      imageUrl: "",
    },
  });

  let server: ServerType | undefined;
  if (data) server = data.server;

  useEffect(() => {
    form.setValue("serverName", server?.name || "");
    form.setValue("imageUrl", server?.imageUrl || "");
  }, [server, form]);

  const isModalOpen = isOpen && type === "editServer";
  const isFormSubmitting = form.formState.isSubmitting;

  const onSumbit = async (values: z.infer<typeof formSchema>) => {
    try {
      await fetch(`/api/server/${server?._id?.toString()}/edit`, {
        headers: {
          "Content-Type": "application/json",
        },
        method: "PATCH",
        body: JSON.stringify(values),
      });

      form.reset();
      router.refresh();
      dispatch(onClose());
    } catch (error: any) {
      console.log(error.message);
    }
  };

  const handleClose = (open: boolean) => {
    form.reset();
    dispatch(onClose());
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Customize your server
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            Give your server a personality with a name and an image. You can
            always change it later.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSumbit)} className="space-y-8">
            <div className="space-y-8 px-6">
              <div className="flex items-center justify-center text-center">
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FileUpload
                          endpoint="serverImage"
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="serverName"
                render={({ field }) => (
                  <FormItem
                    className="uppercase text-xs font-bold text-zinc-500
                      dark:text-secondary/70"
                  >
                    <FormLabel>Server name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isFormSubmitting}
                        className="bg-zinc-300/50 border-0 text-black
                          focus-visible:ring-0 focus-visible:ring-offset-0"
                        placeholder="Enter server name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="bg-gray-100 px-6 py-4">
              <Button variant="primary" disabled={isFormSubmitting}>
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditServerModal;
