"use client";
//validation and server form imports
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

// ui imports
import { Button } from "@/components/ui/button";
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
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";

const formSchema = z.object({
  // username: z.string().min(2, {
  //   message: "Username must be at least 2 characters.",
  // }),
});

const CreateService = () => {
  // 1. Define your form.
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "",
      "wait-time": "",
      title: "",
      caption: "",
      price: "",
    },
  });

  function onSubmit() {
    console.log(form.getValues());
  }

  const date = new Date().toISOString().split("T")[0];

  return (
    <main className="padding-container">
      <h1 className="text-2xl font-semibold py-7 lg:ml-32">Create</h1>
      <div className="flex justify-around flex-1 text-center lg:flex-col lg:fixed top-[22.7%] left-9 gap-3 mb-7">
        <Link
          href="/create"
          className=" py-2 cursor-pointer rounded-lg transition-all sm:w-[50%] lg:w-36"
        >
          Loops
        </Link>
        <h2 className=" bg-secondary-200 py-2 cursor-pointer rounded-lg transition-all sm:w-[50%] lg:w-36">
          Service
        </h2>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="lg:ml-32">
          {/* service specific (service + wait time)*/}
          <div className="mb-7">
            <div className="flex flex-1 gap-6">
              <FormField
                control={form.control}
                name="service-type"
                render={({ field }) => (
                  <FormItem className="w-[50%]">
                    <FormLabel>Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      required
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Service type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="lab">Labs</SelectItem>
                        <SelectItem value="loops-monthly">
                          Monthly loops subscription
                        </SelectItem>
                        <SelectItem value="lifetime loops">
                          Lifetime Loops
                        </SelectItem>
                        <SelectItem value="vfx">Vfx</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="wait-time"
                render={({ field }) => (
                  <FormItem className="w-[50%]">
                    <FormLabel>Max wait time (days)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="2-3"
                        step="1"
                        required
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* title + caption */}
          <div className="border rounded-lg">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder={`Loops ${date}`}
                      {...field}
                      className="border-0 border-b border-secondary-200 rounded-none focus-visible:ring-0"
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="caption"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Loops in the style of..."
                      {...field}
                      className="border-0 focus-visible:ring-0"
                      required
                    />
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
                  <FormControl>
                    <div className="flex flex-row relative w-1/2">
                      <span className="absolute bottom-[8.5px] bg-grey-lighter rounded rounded-r-none px-3 text-grey-darker">
                        $
                      </span>
                      <Input
                        {...field}
                        type="number"
                        placeholder="0.00"
                        className="pl-7 border-0 focus-visible:ring-0"
                        step="0.01"
                        required
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button className="mt-7">Post</Button>
        </form>
      </Form>
    </main>
  );
};

export default CreateService;
