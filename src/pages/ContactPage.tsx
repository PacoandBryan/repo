import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NextSeo } from 'next-seo';
import { JsonLd } from 'react-schemaorg';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send, 
  Instagram, 
  Facebook, 
  MessageCircle,
  ChevronDown
} from 'lucide-react';

export default function ContactPage() {
  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const businessInfo = {
    name: "Paco & Bryan",
    address: {
      streetAddress: "Av. Insurgentes Sur 1602",
      addressLocality: "Mexico City",
      addressRegion: "CDMX",
      postalCode: "03940",
      addressCountry: "MX"
    },
    email: "contact@pacoandbryan.com",
    telephone: "+52 (55) 5555-5555",
    openingHours: ["Mo-Fr 09:00-18:00", "Sa 10:00-14:00"],
    url: "https://yoursite.com"
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setFormData({ firstName: '', lastName: '', email: '', message: '' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <>
      <NextSeo
        title="Contact Us | Paco & Bryan"
        description="Get in touch with Paco & Bryan. We're here to help with your questions about our handcrafted products and artisan courses. Visit our store in Mexico City or reach out online."
        canonical="https://yoursite.com/contact"
        openGraph={{
          url: 'https://yoursite.com/contact',
          title: 'Contact Us | Paco & Bryan',
          description: 'Get in touch with Paco & Bryan. Visit our store in Mexico City or reach out online.',
          images: [
            {
              url: 'https://cdn.pixabay.com/photo/2015/09/16/05/57/embroidery-942255_1280.jpg',
              width: 1200,
              height: 630,
              alt: 'Contact Paco & Bryan',
            },
          ],
        }}
        additionalMetaTags={[
          {
            name: 'keywords',
            content: 'contact, mexican crafts, artisan products, store location, customer support'
          }
        ]}
      />
      <JsonLd
        item={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          name: "Contact Paco & Bryan",
          description: "Get in touch with Paco & Bryan",
          mainEntity: {
            "@type": "Organization",
            name: businessInfo.name,
            address: {
              "@type": "PostalAddress",
              ...businessInfo.address
            },
            email: businessInfo.email,
            telephone: businessInfo.telephone,
            openingHours: businessInfo.openingHours,
            url: businessInfo.url,
            sameAs: [
              "https://instagram.com/pacoandbryan",
              "https://facebook.com/pacoandbryan"
            ]
          }
        }}
      />
      <div className="pt-16 min-h-screen bg-secondary-light">
        {/* Hero Section */}
        <div className="relative h-[40vh] overflow-hidden">
          <img
            src="https://cdn.pixabay.com/photo/2015/09/16/05/57/embroidery-942255_1280.jpg"
            alt="Contact Us"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="text-4xl md:text-5xl font-serif mb-4 animate-[fade-in-up_1s_ease-out]">
                {t('contact.title')}
              </h1>
              <p className="text-lg md:text-xl text-white/90 animate-[fade-in-up_1s_ease-out_0.3s]">
                {t('contact.subtitle')}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white rounded-xl p-8 shadow-soft animate-[fade-in-up_1s_ease-out]">
              <h2 className="text-2xl font-serif text-primary mb-6">
                {t('contact.form.title')}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-primary/80 mb-2">
                      {t('contact.form.firstName')}
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="input"
                      placeholder={t('contact.form.firstNamePlaceholder')}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-primary/80 mb-2">
                      {t('contact.form.lastName')}
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="input"
                      placeholder={t('contact.form.lastNamePlaceholder')}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-primary/80 mb-2">
                    {t('contact.form.email')}
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input"
                    placeholder={t('contact.form.emailPlaceholder')}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-primary/80 mb-2">
                    {t('contact.form.message')}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={5}
                    className="input resize-none"
                    placeholder={t('contact.form.messagePlaceholder')}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary w-full group"
                >
                  <Send className={`w-5 h-5 mr-2 transition-transform duration-300 ${
                    isSubmitting ? 'translate-x-2' : 'group-hover:translate-x-1'
                  }`} />
                  {isSubmitting ? t('contact.form.sending') : t('contact.form.submit')}
                </button>
              </form>
            </div>
            
          </div>
        </div>
      </div>
    </>
  );
}