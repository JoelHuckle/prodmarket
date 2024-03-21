"use client";
//validation and server form imports
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";

// ui imports
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
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

const formSchema = z.object({
  // username: z.string().min(2, {
  //   message: "Username must be at least 2 characters.",
  // }),
});

const Create = () => {
  const [loopSelected, setLoopSelected] = useState(true);

  // 1. Define your form.
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      caption: "",
      price: "",
    },
  });

  function onSubmit(formData) {
    // Access form data from the object provided by the form hook
    // You might need to adjust the properties depending on your form structure
    const { title, caption, price } = formData;

    // Log the form data
    console.log("Title:", title);
    console.log("Caption:", caption);
    console.log("Price:", price);
  }

  const date = new Date().toISOString().split("T")[0];

  return (
    <main className="padding-container">
      <h1 className="text-2xl font-semibold py-7 lg:ml-32">Create</h1>
      <div className="flex justify-around flex-1 text-center lg:flex-col lg:fixed top-[23%] left-9 gap-3 mb-7">
        <h2
          className={`${
            loopSelected ? "bg-secondary-200" : ""
          } py-2 cursor-pointer rounded-lg transition-all sm:w-[50%] lg:w-36`}
          onClick={() => setLoopSelected(true)}
        >
          Loops
        </h2>
        <h2
          className={`${
            loopSelected ? "" : "bg-secondary-200"
          } py-2 cursor-pointer rounded-lg transition-all sm:w-[50%] lg:w-36`}
          onClick={() => setLoopSelected(false)}
        >
          Service
        </h2>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 lg:ml-32"
        >
          {/* Loop specific (link + preview)*/}
          <div className={`${loopSelected ? "static" : "hidden"}`}>
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
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          {/* service specific (wait time)*/}
          <div className={`${loopSelected ? "hidden" : "static"}`}>
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
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="wait type"
                render={({ field }) => (
                  <FormItem className="w-[50%]">
                    <FormLabel>Max wait time (days)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="0"
                        step="1"
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
                      placeholder="Title"
                      {...field}
                      className="border-0 border-b border-secondary-200 rounded-none focus-visible:ring-0"
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
                      placeholder={`${
                        loopSelected
                          ? "Loops in the style of..."
                          : "my service provides..."
                      } `}
                      {...field}
                      className="border-0 focus-visible:ring-0"
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
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button>Post</Button>
        </form>
      </Form>
    </main>
  );
};

export default Create;
