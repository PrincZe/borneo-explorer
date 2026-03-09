'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Asterisk } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
// import Map from '../components/Maps';
import dynamic from 'next/dynamic';

const Map = dynamic(() => import('../components/Maps'), { ssr: false });

const topics = [
  'Booking Inquiry',
  'Diving Packages',
  'Group / Charter',
  'Equipment & Requirements',
  'General Inquiry',
];

function ContactPageContent() {
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    topic: '',
    message: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    const topicFromUrl = searchParams.get('topic');
    if (topicFromUrl) {
      const matchedTopic = topics.find(
        (topic) => topic.toLowerCase().replace(/\s+/g, '-') === topicFromUrl
      );
      if (matchedTopic) {
        setFormData((prev) => ({ ...prev, topic: topicFromUrl }));
      }
    }
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, topic: value }));
    console.log('formData', formData);
  };

  const isFormValid = () => {
    return Object.values(formData).every((value) => value.trim() !== '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid()) {
      toast({
        title: 'Message Sent',
        description: 'Thanks for querying. We will get back to you as soon as possible.',
      });
      // Here you would typically send the form data to your backend
      console.log(formData);
      // Reset form after submission
      setFormData({ name: '', email: '', topic: '', message: '' });
    } else {
      toast({
        title: 'Error',
        description: 'Please fill in all fields before submitting.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 pt-28">
      <h1 className="text-4xl font-bold mb-8 text-center">Contact Us</h1>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Send us a message</CardTitle>
            <CardDescription>We&apos;ll get back to you as soon as possible.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <label
                    htmlFor="name"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Name <Asterisk className="inline h-4 w-4 text-red-500" />
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Your Name"
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Email <Asterisk className="inline h-4 w-4 text-red-500" />
                  </label>
                  <Input
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Your Email"
                    type="email"
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <label
                    htmlFor="topic"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Topic <Asterisk className="inline h-4 w-4 text-red-500" />
                  </label>
                  <Select onValueChange={handleSelectChange} value={formData.topic}>
                    <SelectTrigger id="topic">
                      <SelectValue placeholder="Select a topic" />
                    </SelectTrigger>
                    <SelectContent>
                      {topics.map((topic) => (
                        <SelectItem
                          key={topic}
                          value={topic.toLowerCase().replace(/\s+/g, '-')}
                        >
                          {topic}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col space-y-1.5">
                  <label
                    htmlFor="message"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Message <Asterisk className="inline h-4 w-4 text-red-500" />
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Your Message"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <Button type="submit" disabled={!isFormValid()}>
                  Send Message
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-4 text-center">Our Location</h2>
        <div className="rounded-lg overflow-hidden">
          <Map />
        </div>
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
        <p className="text-gray-600">Email: info@celebesexplorer.com</p>
        <p className="text-gray-600">Phone: +60 12 345 6789</p>
        <p className="text-gray-600">
          Address: Semporna, Sabah, Malaysia
        </p>
      </div>

      <Toaster />
    </div>
  );
}

export default function Contact() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ContactPageContent />
    </Suspense>
  );
}
