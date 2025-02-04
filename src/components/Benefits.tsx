import React from 'react';
import { Leaf, Heart, Home } from 'lucide-react';

export default function Benefits() {
  const benefits = [
    {
      icon: <Leaf className="w-8 h-8" />,
      title: "Eco-Friendly Materials",
      description: "Our products are crafted with at least 30% natural fabrics, reducing environmental impact while maintaining exceptional quality."
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Handcrafted Care",
      description: "Each piece is carefully handmade, ensuring superior quality and attention to detail that mass-produced items simply can't match."
    },
    {
      icon: <Home className="w-8 h-8" />,
      title: "Supporting Mexican Artisans",
      description: "100% made in Mexico, every purchase directly supports local artisans and contributes to the growth of our national economy."
    }
  ];

  return (
    <div className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-serif tracking-tight text-primary sm:text-4xl">
            Why Choose Handmade?
          </h2>
          <p className="mt-4 text-lg text-primary/80 max-w-2xl mx-auto">
            Our commitment to handcrafted excellence goes beyond beauty – it's about 
            creating sustainable, meaningful pieces that support our community.
          </p>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit, index) => (
            <div key={index} className="text-center">
              <div className="flex justify-center">
                <div className="text-accent p-4 bg-primary-light rounded-full">
                  {benefit.icon}
                </div>
              </div>
              <h3 className="mt-6 text-xl font-serif text-primary">
                {benefit.title}
              </h3>
              <p className="mt-4 text-primary/80">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}