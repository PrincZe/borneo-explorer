'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, Utensils, Ship, Users, Map, X } from 'lucide-react';
import { AnimateOnScroll } from '@/components/ui/animate-on-scroll';

const PhotoGallery = () => {
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

  const galleryCategories = [
    {
      id: 'diving',
      icon: <Camera className="w-4 h-4" />,
      title: 'Diving Adventures',
      description: "Experience world-class diving at Sipadan's legendary sites",
      images: [
        { src: '/images/gallery/diving/264193434_1238949199849904_2063098377465929451_n.jpg', alt: 'Divers exploring Sipadan', caption: "Daily diving at Sipadan's best sites" },
        { src: '/images/gallery/diving/265083869_971472880245574_7286558375051117909_n.jpg', alt: 'Crystal clear waters', caption: 'Crystal clear visibility year-round' },
        { src: '/images/gallery/diving/265259283_1027796784436002_3593878696376190890_n.jpg', alt: 'Underwater adventure', caption: 'Guided underwater adventures' },
        { src: '/images/gallery/diving/265289332_425930745681342_4879052177569427413_n.jpg', alt: 'Marine encounter', caption: 'Close encounters with marine life' },
        { src: '/images/gallery/diving/265674652_433298614931708_3422854805302508857_n.jpg', alt: 'Reef diving', caption: 'Pristine reef ecosystems' },
        { src: '/images/gallery/diving/266330615_6530164400390347_9051059433087133743_n.jpg', alt: 'Deep diving', caption: 'Exploring Sipadan\'s depths' },
      ]
    },
    {
      id: 'vessel',
      icon: <Ship className="w-4 h-4" />,
      title: 'MV Celebes Explorer',
      description: 'Your comfortable home at sea',
      images: [
        { src: '/images/gallery/vessel/NIC_5577.jpg', alt: 'Vessel exterior', caption: 'MV Celebes Explorer at sea' },
        { src: '/images/gallery/vessel/NIC_5616.jpg', alt: 'Vessel interior', caption: 'Modern and comfortable lounge' },
        { src: '/images/gallery/vessel/NIC_5658.jpg', alt: 'Vessel deck', caption: 'Spacious deck areas' },
        { src: '/images/gallery/vessel/NIC_5676.jpg', alt: 'Vessel facilities', caption: 'Well-maintained facilities' },
        { src: '/images/gallery/vessel/NIC_5729.jpg', alt: 'Vessel cabin', caption: 'Comfortable cabin interiors' },
        { src: '/images/gallery/vessel/NIC_5765.jpg', alt: 'Vessel dining', caption: 'Dining area with ocean views' },
        { src: '/images/gallery/vessel/NIC_5772.jpg', alt: 'Vessel sunset', caption: 'Sunset from the deck' },
        { src: '/images/gallery/vessel/263184697_4797248843643435_3655608031522742327_n.jpg', alt: 'Vessel aerial', caption: 'Aerial view of MV Celebes Explorer' },
        { src: '/images/gallery/vessel/263668185_328301125689198_5226678590749593793_n.jpg', alt: 'Cabin interior', caption: 'Well-appointed cabins' },
      ]
    },
    {
      id: 'dining',
      icon: <Utensils className="w-4 h-4" />,
      title: 'Culinary Experience',
      description: 'Delicious meals prepared fresh daily',
      images: [
        { src: '/images/gallery/dining/BF2.jpeg', alt: 'Breakfast spread', caption: 'Fresh breakfast to start your day' },
        { src: '/images/gallery/dining/Dinner3.jpeg', alt: 'Dinner dishes', caption: 'Freshly prepared dinner specialties' },
        { src: '/images/gallery/dining/Dinner4.jpeg', alt: 'Seafood dinner', caption: 'Local seafood delicacies' },
        { src: '/images/gallery/dining/Dinner5.jpeg', alt: 'Evening meal', caption: 'Gourmet evening meals' },
        { src: '/images/gallery/dining/Dinner9.jpeg', alt: 'Dinner spread', caption: 'Varied dinner selections' },
        { src: '/images/gallery/dining/Dinner10.jpeg', alt: 'Chef special', caption: 'Chef\'s special creations' },
        { src: '/images/gallery/dining/Dinner11.jpeg', alt: 'Feast', caption: 'Dining aboard Celebes Explorer' },
        { src: '/images/gallery/dining/Lunch1.jpeg', alt: 'Lunch buffet', caption: 'Varied lunch menu' },
        { src: '/images/gallery/dining/Lunch2.jpeg', alt: 'Lunch dishes', caption: 'Freshly prepared lunch' },
        { src: '/images/gallery/dining/Lunch3.jpeg', alt: 'Asian cuisine', caption: 'Local Asian specialties' },
        { src: '/images/gallery/dining/Lunch6.jpeg', alt: 'Meal spread', caption: 'Full course meals daily' },
        { src: '/images/gallery/dining/Fruit2.jpeg', alt: 'Tropical fruits', caption: 'Fresh tropical fruits' },
        { src: '/images/gallery/dining/Snack.jpeg', alt: 'Afternoon snack', caption: 'Between-dive snacks' },
      ]
    },
    {
      id: 'memories',
      icon: <Users className="w-4 h-4" />,
      title: 'Guest Memories',
      description: 'Unforgettable moments from our happy divers',
      images: [
        { src: '/images/gallery/guests/1.jpeg', alt: 'Happy divers', caption: 'Creating lasting memories' },
        { src: '/images/gallery/guests/4.jpeg', alt: 'Group fun', caption: 'Fun aboard the vessel' },
        { src: '/images/gallery/guests/5.jpeg', alt: 'Diver celebration', caption: 'Celebrating great dives' },
        { src: '/images/gallery/guests/264657560_2830465503924172_9124418256175857120_n.jpg', alt: 'Guest photo', caption: 'Happy guests on deck' },
        { src: '/images/gallery/guests/265237435_204783778510845_3398870585355547884_n.jpg', alt: 'Group photo', caption: 'Group memories' },
        { src: '/images/gallery/guests/265247510_443878743937049_1718078718622865504_n.jpg', alt: 'Divers together', caption: 'New friendships formed' },
        { src: '/images/gallery/guests/WhatsApp Image 2021-12-17 at 09.21.58.jpeg', alt: 'Guest moment', caption: 'Memorable moments' },
        { src: '/images/gallery/guests/WhatsApp Image 2021-12-18 at 11.26.49.jpeg', alt: 'Happy guests', caption: 'Smiles all around' },
        { src: '/images/gallery/guests/WhatsApp Image 2021-12-18 at 13.11.46.jpeg', alt: 'On deck', caption: 'Life on deck' },
        { src: '/images/gallery/guests/WhatsApp Image 2021-12-18 at 14.21.22.jpeg', alt: 'Group adventure', caption: 'Adventure together' },
        { src: '/images/gallery/guests/WhatsApp Image 2021-12-18 at 15.56.03.jpeg', alt: 'Sunset group', caption: 'Sunset gatherings' },
        { src: '/images/gallery/guests/WhatsApp Image 2021-12-18 at 17.09.12.jpeg', alt: 'Evening fun', caption: 'Evening on the vessel' },
      ]
    },
    {
      id: 'location',
      icon: <Map className="w-4 h-4" />,
      title: 'Sipadan Island',
      description: 'Paradise found in the Celebes Sea',
      images: [
        { src: '/images/gallery/location/261710730_433988378299090_3621221333237422314_n.jpg', alt: 'Pristine beach', caption: 'Pristine beaches of Sipadan' },
        { src: '/images/gallery/location/262990700_2977179309203597_8357394029112323886_n.jpg', alt: 'Island panorama', caption: 'Panoramic island views' },
        { src: '/images/gallery/location/264356237_231588505775082_4165810056012296612_n.jpg', alt: 'Island view', caption: 'Tropical paradise awaits' },
        { src: '/images/gallery/location/Sipadan Dive Sites.jpg', alt: 'Dive site map', caption: 'Sipadan dive site overview' },
      ]
    }
  ];

  return (
    <div className="container mx-auto px-2 sm:px-4 py-8 sm:py-16 pt-24 sm:pt-28">
      <AnimateOnScroll animation="fade-in">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4 text-center">Photo Gallery</h1>
        <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 text-center px-2">
          Dive into our world of underwater adventures and liveaboard comfort
        </p>
      </AnimateOnScroll>

      <Tabs defaultValue="diving" className="w-full">
        <TabsList className="flex sm:flex-wrap sm:justify-center mb-6 sm:mb-8 sm:gap-2 bg-muted/50 rounded-lg p-1">
          <div className="flex w-full sm:w-auto overflow-x-auto scrollbar-hide sm:overflow-visible gap-1">
            {galleryCategories.map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 py-2 sm:px-6 sm:py-2 text-center whitespace-nowrap"
              >
                {category.icon}
                <span className="text-xs sm:text-sm font-medium">{category.title}</span>
              </TabsTrigger>
            ))}
          </div>
        </TabsList>

        {galleryCategories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="mt-2 sm:mt-6">
            <div className="text-center mb-4 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-2">{category.title}</h2>
              <p className="text-sm sm:text-base text-gray-600 px-2">{category.description}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {category.images.map((image, index) => (
                <AnimateOnScroll key={index} animation="scale-up" delay={Math.min(index * 0.05, 0.4)}>
                  <Card
                    className="overflow-hidden group cursor-pointer card-hover"
                    onClick={() => setLightbox({ src: image.src, alt: image.alt })}
                  >
                    <div className="relative h-44 sm:h-56 img-zoom">
                      <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-end">
                        <p className="text-white text-sm p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                          {image.caption}
                        </p>
                      </div>
                    </div>
                  </Card>
                </AnimateOnScroll>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Lightbox Modal */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
            onClick={() => setLightbox(null)}
            aria-label="Close lightbox"
          >
            <X className="h-8 w-8" />
          </button>
          <div className="relative max-w-5xl max-h-[85vh] w-full h-full" onClick={(e) => e.stopPropagation()}>
            <Image
              src={lightbox.src}
              alt={lightbox.alt}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoGallery;
