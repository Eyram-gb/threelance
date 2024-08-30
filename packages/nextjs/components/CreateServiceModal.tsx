"use client";

import { useEffect } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
// import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { parseEther } from "viem";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { z } from "zod";
import deployedContracts from "~~/contracts/deployedContracts";

// import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const formSchema = z.object({
  price: z.string({
    required_error: "Price is required",
  }),
  name: z.string({
    required_error: "Title is required",
  }),
  description: z.string({
    required_error: "Description is required",
  }),
  image: z.string({
    required_error: "image url is required",
  }),
});

type TCreateService = z.infer<typeof formSchema>;

export function CreateServiceModal() {
  return (
    <Dialog>
      <DialogTrigger>
        <Button>Create Service</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <div>
            <ServiceForm />
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

function ServiceForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    // resolver: zodResolver(formSchema),
  });
  const {
    data: hash,
    writeContract,
    isPending,
  } = useWriteContract({
    mutation: {
      onSettled(data, error) {
        console.log(`Settled create new service, ${{ data, error }}`);
      },
    },
  });

  const { isLoading: isConfirmingTxn, isSuccess: isConfirmedTxn } = useWaitForTransactionReceipt({ hash });

  const handleCreateService = async (values: TCreateService) => {
    const { price, name, description, image } = values;
    return writeContract({
      functionName: "createService",
      abi: deployedContracts["31337"].ThreeLance.abi,
      args: [name, description, parseEther(price), [image]],
      address: deployedContracts["31337"].ThreeLance.address,
    });
  };

  useEffect(() => {
    if (isConfirmedTxn) {
      toast.success("Service created successfully!");
    }
  }, [isConfirmedTxn]);

  async function onSubmit(values: TCreateService) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
    await handleCreateService(values);
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Gig title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Gig description" {...field} className="resize-none" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input type="number" placeholder="amount in eth" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image Url</FormLabel>
              <FormControl>
                <Input type="number" placeholder="https://clodianry.afqfqf.png" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">{isPending || isConfirmingTxn ? "Creating Service" : "Create service"}</Button>
      </form>
    </Form>
  );
}
