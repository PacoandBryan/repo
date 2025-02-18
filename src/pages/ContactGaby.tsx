import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NextSeo } from 'next-seo';
import { JsonLd } from 'react-schemaorg';
import logo from "../../Images/GabyLogo.jpg";
import { 
  Send, 
  Instagram, 
  Facebook, 
  MessageCircle,
} from 'lucide-react';


export default function ContactGaby() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const businessInfo = {
    name: "Delittia - Gaby Manzano",
    email: "gaby@delittia.com",
    url: "https://delittia.com",
    social: {
      instagram: "https://instagram.com/delittia",
      facebook: "https://facebook.com/delittia"
    }
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
        title={`${t('contact.gabyTitle')} | Delittia`}
        description={t('contact.gabySubtitle')}
        canonical="https://delittia.com/contact-gaby"
      />
      <JsonLd
        item={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          name: t('contact.gabyTitle'),
          description: t('contact.gabySubtitle'),
          mainEntity: {
            "@type": "Person",
            name: businessInfo.name,
            email: businessInfo.email,
            url: businessInfo.url
          }
        }}
      />
      <div className="pt-16 min-h-screen bg-secondary-light">
        {/* Hero Section */}
        <div className="relative h-[40vh] overflow-hidden">
          <img
            src={logo}
            alt="Delittia by Gaby Manzano"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="text-4xl md:text-5xl font-serif mb-4 animate-[fade-in-up_1s_ease-out]">
                {t('contact.gabyTitle')}
              </h1>
              <p className="text-lg md:text-xl text-white/90 animate-[fade-in-up_1s_ease-out_0.3s]">
                {t('contact.gabySubtitle')}
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
                {t('contact.form.titleGaby')}
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

            {/* Social Media Links */}
            <div className="space-y-8">
              <div className="bg-white rounded-xl p-8 shadow-soft">
                <h3 className="text-xl font-serif text-primary mb-4">
                  {t('contact.social.titleGaby')}
                </h3>
                <p className="text-primary/80 mb-6">
                  {t('contact.social.subtitleGaby')}
                </p>
                <div className="space-y-4">
                  <a
                    href={businessInfo.social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 text-primary/80 hover:text-primary transition-colors duration-300"
                  >
                    <Instagram className="w-6 h-6" />
                    <span>{t('contact.social.instagram')}</span>
                  </a>
                  <a
                    href={businessInfo.social.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 text-primary/80 hover:text-primary transition-colors duration-300"
                  >
                    <Facebook className="w-6 h-6" />
                    <span>{t('contact.social.facebook')}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 