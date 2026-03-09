'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Ship, Users } from 'lucide-react';
import { AnimateOnScroll } from '@/components/ui/animate-on-scroll';

export default function Availability() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <AnimateOnScroll animation="fade-in">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Ship Availability</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Check real-time availability for MV Celebes Explorer and secure your spot on our next diving adventure.
            </p>
          </div>
        </AnimateOnScroll>

        {/* Quick Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { icon: Ship, title: 'Vessel Capacity', desc: 'Up to 10 divers' },
            { icon: Users, title: 'Group Bookings', desc: 'Private charters available' },
            { icon: Calendar, title: 'Booking Window', desc: 'Book up to 12 months ahead' },
          ].map((info, i) => (
            <AnimateOnScroll key={i} animation="slide-up" delay={i * 0.1}>
              <Card className="text-center p-6 card-hover">
                <info.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h3 className="font-bold mb-1">{info.title}</h3>
                <p className="text-gray-600">{info.desc}</p>
              </Card>
            </AnimateOnScroll>
          ))}
        </div>

        {/* Legend */}
        <AnimateOnScroll animation="fade-in">
          <div className="flex flex-wrap justify-center gap-6 mb-6">
            {[
              { color: 'bg-green-500', label: 'Available' },
              { color: 'bg-yellow-500', label: 'Limited Spots' },
              { color: 'bg-red-500', label: 'Fully Booked' },
              { color: 'bg-gray-400', label: 'Not Scheduled' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${item.color}`} />
                <span className="text-sm text-gray-600">{item.label}</span>
              </div>
            ))}
          </div>
        </AnimateOnScroll>

        {/* Availability Calendar */}
        <AnimateOnScroll animation="scale-up">
          <Card className="mb-12 overflow-hidden shadow-md">
            <CardHeader className="ocean-gradient text-white">
              <CardTitle className="text-2xl">Real-Time Availability Calendar</CardTitle>
              <p className="text-blue-100">
                This calendar shows the current booking status for MV Celebes Explorer.
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="w-full overflow-hidden">
                <iframe
                  src="https://docs.google.com/spreadsheets/d/e/2PACX-1vQsfWQxp909tu3T8D8e5SnlWJvtjLeITuFS1Z3zoi1G-IXqk3oyC7AqWS04bWdoQVq9c_2SNaoMLSFI/pubhtml?widget=true&amp;headers=false"
                  width="100%"
                  height="600"
                  frameBorder="0"
                  title="MV Celebes Explorer Availability Calendar"
                  className="min-h-[600px]"
                />
              </div>
            </CardContent>
          </Card>
        </AnimateOnScroll>

        {/* Booking Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <AnimateOnScroll animation="slide-left">
            <Card className="card-hover h-full">
              <CardHeader>
                <CardTitle>How to Book</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { num: '1', title: 'Check Availability', desc: 'Use the calendar above to find available dates for your preferred trip duration.' },
                  { num: '2', title: 'Submit Booking Request', desc: 'Fill out our booking form with your preferred dates and package.' },
                  { num: '3', title: 'Confirmation', desc: "We'll confirm availability and send you payment details within 24 hours." },
                ].map((step, i) => (
                  <div key={i} className="flex items-start space-x-3">
                    <div className="bg-primary/10 text-primary rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mt-0.5 flex-shrink-0">
                      {step.num}
                    </div>
                    <div>
                      <h4 className="font-semibold">{step.title}</h4>
                      <p className="text-gray-600 text-sm">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </AnimateOnScroll>

          <AnimateOnScroll animation="slide-right">
            <Card className="card-hover h-full">
              <CardHeader>
                <CardTitle>Important Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { title: 'Sipadan Permits', desc: 'All our packages include guaranteed Sipadan diving permits.' },
                  { title: 'Group Discounts', desc: 'Special rates available for groups of 4 or more divers.' },
                  { title: 'Weather Considerations', desc: 'Diving schedules may be adjusted due to weather conditions for safety.' },
                ].map((note, i) => (
                  <div key={i} className="flex items-start space-x-3">
                    <div className="bg-yellow-100 text-yellow-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mt-0.5 flex-shrink-0">
                      !
                    </div>
                    <div>
                      <h4 className="font-semibold">{note.title}</h4>
                      <p className="text-gray-600 text-sm">{note.desc}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </AnimateOnScroll>
        </div>

        {/* CTA Section */}
        <AnimateOnScroll animation="scale-up">
          <div className="text-center mt-16">
            <h2 className="text-3xl font-bold mb-4">Ready to Book Your Adventure?</h2>
            <p className="text-xl text-gray-600 mb-8">Secure your spot on our next diving expedition</p>
            <Link
              href="/book-now"
              className="bg-primary text-white px-8 py-4 rounded-full font-bold hover:bg-primary/90 transition-all duration-300 hover:scale-105 inline-block"
            >
              Book Your Dive Trip
            </Link>
          </div>
        </AnimateOnScroll>
      </div>
    </div>
  );
}
