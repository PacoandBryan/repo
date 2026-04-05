import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import { JsonLd } from 'react-schemaorg';
import {
  Send
} from 'lucide-react';

import API_URLS from '../config/api';

export default function ContactPage() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const businessInfo = {
    name: "Paco & Bryan",
    address: {
      streetAddress: "Av. Insurgentes Sur 1602",
      addressLocality: "Mexico City",
      addressRegion: "CDMX",
      postalCode: "03940",
      addressCountry: "MX"
    },
    email: "info@diky.mx",
    telephone: "+52 55 8698 1654",
    openingHours: ["Mo-Fr 09:00-18:00", "Sa 10:00-14:00"],
    url: "https://diky.mx"
  };

  const WhatsAppIcon = ({ className }: { className?: string }) => (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch(API_URLS.CONTACT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      setSubmitStatus({ type: 'success', message: t('contact.form.success') || 'Message sent successfully!' });
      setFormData({ firstName: '', lastName: '', email: '', message: '' });
    } catch (err: any) {
      console.error('Error sending email:', err);
      setSubmitStatus({
        type: 'error',
        message: err.message || 'There was an error sending your message. Please try again later.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <>
      <SEO
        title="Contacto y Ubicación"
        description="Visítanos en nuestra tienda en CDMX o contáctanos para pedidos personalizados. Estamos aquí para atenderte."
        canonical="https://diky.mx/contact"
        openGraph={{
          title: 'Contacto y Ubicación | Diky',
          description: 'Visítanos en nuestra tienda en CDMX o contáctanos para pedidos personalizados. Estamos aquí para atenderte.',
          images: [
            {
              url: 'https://cdn.pixabay.com/photo/2015/09/16/05/57/embroidery-942255_1280.jpg',
              alt: 'Contact Diky',
            },
          ],
        }}
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
                {submitStatus && (
                  <div className={`p-4 rounded-lg text-sm ${submitStatus.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                    {submitStatus.message}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary w-full group"
                >
                  <Send className={`w-5 h-5 mr-2 transition-transform duration-300 ${isSubmitting ? 'translate-x-2' : 'group-hover:translate-x-1'
                    }`} />
                  {isSubmitting ? t('contact.form.sending') : t('contact.form.submit')}
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-8 animate-[fade-in-up_1s_ease-out_0.2s]">
              <div className="bg-white rounded-xl p-8 shadow-soft">
                <h2 className="text-2xl font-serif text-primary mb-6">Información de Contacto</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent shrink-0">
                      <WhatsAppIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-medium text-primary">WhatsApp</h3>
                      <p className="text-primary/60 mb-2 text-sm italic">Directo y rápido para tus dudas</p>
                      <a
                        href="https://wa.me/525586981654"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-lg font-medium text-primary hover:text-accent transition-colors"
                      >
                        +52 55 8698 1654
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent shrink-0">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-primary">Correo Electrónico</h3>
                      <a
                        href="mailto:info@diky.mx"
                        className="text-lg text-primary hover:text-accent transition-colors"
                      >
                        info@diky.mx
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent shrink-0">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-primary">Horario de Atención</h3>
                      <ul className="text-primary/70 space-y-1">
                        <li>Lunes a Viernes: 09:00 - 18:00</li>
                        <li>Sábados: 10:00 - 14:00</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-primary text-white rounded-xl p-8 shadow-soft relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-accent/20 transition-all duration-500" />
                <h3 className="text-xl font-serif mb-4 relative z-10">¿Buscas algo personalizado?</h3>
                <p className="text-white/80 mb-6 relative z-10">
                  En Diky nos especializamos en hacer realidad tus ideas. Contáctanos por WhatsApp para cotizaciones especiales o pedidos al mayoreo.
                </p>
                <a
                  href="https://wa.me/525586981654"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-accent text-primary px-6 py-3 rounded-full font-medium hover:bg-white transition-all duration-300 relative z-10"
                >
                  <WhatsAppIcon className="w-5 h-5" />
                  Escríbenos ahora
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}