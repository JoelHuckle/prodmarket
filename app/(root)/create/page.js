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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";

const formSchema = z.object({
  // username: z.string().min(2, {
  //   message: "Username must be at least 2 characters.",
  // }),
});

const Create = () => {
  // 1. Define your form.
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      preview: "",
      link: "",
      title: "",
      caption: "",
      price: 0,
    },
  });

  function onSubmit() {
    const formData = form.getValues();
    console.log(formData);
  }

  const date = new Date().toISOString().split("T")[0];
  return (
    <main className="padding-container">
      <h1 className="text-2xl font-semibold py-7 lg:ml-32">Create</h1>
      <div className="flex justify-around flex-1 text-center lg:flex-col lg:fixed top-[22.7%] left-9 gap-3 mb-7">
        <h2 className="bg-secondary-200 py-2 cursor-pointer rounded-lg transition-all sm:w-[50%] lg:w-36">
          Loops
        </h2>
        <Link
          href="/create/service"
          className="py-2 cursor-pointer rounded-lg transition-all sm:w-[50%] lg:w-36"
        >
          Service
        </Link>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="lg:ml-32">
          {/* Loop specific (link + preview)*/}
          <div className="mb-7">
            <div className="flex flex-1 gap-6">
              <FormField
                control={form.control}
                name="preview"
                render={({ field }) => (
                  <FormItem className="w-[50%]">
                    <FormLabel>Preview</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Title"
                        type="File"
                        {...field}
                        className=""
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="link"
                render={({ field }) => (
                  <FormItem className="w-[50%]">
                    <FormLabel>Link (required)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="dropbox, google drive, etc..."
                        {...field}
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

export default Create;
