"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { useParams, useRouter } from "next/navigation";

import { onClose } from "@/features/modalSlice";
import { useAppDispatch, useAppSelector } from "@/store";

const ChannelType = ["TEXT", "AUDIO", "VIDEO"] as const;

const formSchema = z.object({
  channelName: z
    .string()
    .min(1, {
      message: "Channel name is required.",
    })
    .refine((name) => name.toLowerCase() !== "general", {
      message: "Channel name cannot be 'general'",
    }),
  channelType: z.string(),
});

const CreateChannelModal = () => {
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {
      channelName: "",
      channelType: "TEXT",
    },
  });

  const { isOpen, type } = useAppSelector((state) => state.modal);
  const dispatch = useAppDispatch();
  const params = useParams();

  const isModalOpen = isOpen && type === "createChannel";
  const isFormSubmitting = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await fetch(`/api/channel?serverId=${params?.serverId}`, {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(values),
      });

      form.reset();
      router.refresh();
      dispatch(onClose());
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
            Create Channel
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-8 px-6">
              <FormField
                control={form.control}
                name="channelName"
                render={({ field }) => (
                  <FormItem
                    className="uppercase text-xs font-bold text-zinc-500
                      dark:text-secondary/70"
                  >
                    <FormLabel>Channel name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isFormSubmitting}
                        className="bg-zinc-300/50 border-0 text-black
                          focus-visible:ring-0 focus-visible:ring-offset-0"
                        placeholder="Enter channel name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="channelType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Channel Type</FormLabel>
                    <Select
                      disabled={isFormSubmitting}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-zinc-500/50 border-0 focus:ring-0 text-black ring-offset-0 focus:ring-offset-0 capitalize outline-none">
                          <SelectValue placeholder="Select a channel type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ChannelType.map((type) => (
                          <SelectItem
                            key={type}
                            value={type}
                            className="capitalize"
                          >
                            {type.toLowerCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="bg-gray-100 px-6 py-4">
              <Button variant="primary" disabled={isFormSubmitting}>
                Create
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateChannelModal;
