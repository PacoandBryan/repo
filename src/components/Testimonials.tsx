import React from 'react';
import { Star, Quote } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Testimonials() {
  const { t } = useTranslation();

  const testimonials = [
    {
      name: t('testimonials.people.maria.name'),
      location: t('testimonials.people.maria.location'),
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400",
      text: t('testimonials.people.maria.text'),
      rating: 5
    },
    {
      name: t('testimonials.people.isabella.name'),
      location: t('testimonials.people.isabella.location'),
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=400",
      text: t('testimonials.people.isabella.text'),
      rating: 5
    },
    {
      name: t('testimonials.people.sofia.name'),
      location: t('testimonials.people.sofia.location'),
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
      text: t('testimonials.people.sofia.text'),
      rating: 5
    }
  ];

  return (
    <div className="bg-gradient-to-b from-[#fdf6f8] to-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-serif tracking-tight text-primary sm:text-4xl">
            {t('testimonials.title')}
          </h2>
          <p className="mt-4 text-lg text-primary/80 max-w-2xl mx-auto">
            {t('testimonials.subtitle')}
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="relative bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <Quote 
                size={32} 
                className="absolute top-6 right-6 text-[#fcdce4]"
              />
              
              <div className="flex items-center space-x-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  loading="lazy"
                  decoding="async"
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#fcdce4]"
                />
                <div>
                  <h3 className="text-lg font-medium text-primary">
                    {testimonial.name}
                  </h3>
                  <p className="text-sm text-primary/60">
                    {testimonial.location}
                  </p>
                </div>
              </div>

              <div className="flex mt-4 text-[#fcc4d4]">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={16} fill="#fcc4d4" />
                ))}
              </div>

              <p className="mt-4 text-primary/80 leading-relaxed">
                {testimonial.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}