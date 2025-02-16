import React, { useState } from 'react';
import {
  Play,
  Code,
  BedDouble as Needle,
  Users,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  Star,
  ArrowRight,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NextSeo } from 'next-seo';
import { JsonLd } from 'react-schemaorg';

interface Course {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  instructor: {
    name: string;
    role: string;
    image: string;
    bio: string;
  };
  modules: {
    title: string;
    description: string;
  }[];
}

interface FAQItem {
  question: string;
  answer: string;
}

export default function CoursesPage() {
  const { t } = useTranslation();
  const [selectedCourse, setSelectedCourse] = useState<string>('embroidery');
  const [expandedFAQs, setExpandedFAQs] = useState<string[]>([]);

  const courses: Course[] = [
    {
      id: 'embroidery',
      title: t('courses.courses.embroidery.title'),
      subtitle: t('courses.courses.embroidery.subtitle'),
      description: t('courses.courses.embroidery.description'),
      image:
        'https://cdn.pixabay.com/photo/2020/06/01/19/52/thread-5248183_1280.jpg',
      instructor: {
        name: t('courses.courses.embroidery.instructor.name'),
        role: t('courses.courses.embroidery.instructor.role'),
        image:
          'https://cdn.pixabay.com/photo/2016/11/14/17/39/person-1824144_1280.png',
        bio: t('courses.courses.embroidery.instructor.bio'),
      },
      modules: [
        {
          title: t('courses.courses.embroidery.modules.foundations.title'),
          description: t('courses.courses.embroidery.modules.foundations.description'),
        },
        {
          title: t('courses.courses.embroidery.modules.traditional.title'),
          description: t('courses.courses.embroidery.modules.traditional.description'),
        },
        {
          title: t('courses.courses.embroidery.modules.color.title'),
          description: t('courses.courses.embroidery.modules.color.description'),
        },
        {
          title: t('courses.courses.embroidery.modules.advanced.title'),
          description: t('courses.courses.embroidery.modules.advanced.description'),
        },
      ],
    },
    {
      id: 'web-dev',
      title: t('courses.courses.webDev.title'),
      subtitle: t('courses.courses.webDev.subtitle'),
      description: t('courses.courses.webDev.description'),
      image:
        'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&q=80&w=1000',
      instructor: {
        name: t('courses.courses.webDev.instructor.name'),
        role: t('courses.courses.webDev.instructor.role'),
        image:
          'https://cdn.pixabay.com/photo/2016/11/14/17/39/person-1824144_1280.png',
        bio: t('courses.courses.webDev.instructor.bio'),
      },
      modules: [
        {
          title: t('courses.courses.webDev.modules.html.title'),
          description: t('courses.courses.webDev.modules.html.description'),
        },
        {
          title: t('courses.courses.webDev.modules.css.title'),
          description: t('courses.courses.webDev.modules.css.description'),
        },
        {
          title: t('courses.courses.webDev.modules.javascript.title'),
          description: t('courses.courses.webDev.modules.javascript.description'),
        },
        {
          title: t('courses.courses.webDev.modules.projects.title'),
          description: t('courses.courses.webDev.modules.projects.description'),
        },
      ],
    },
  ];

  const faqs: FAQItem[] = [
    {
      question: t('courses.faq.questions.experience.question'),
      answer: t('courses.faq.questions.experience.answer'),
    },
  ];

  const toggleFAQ = (question: string) => {
    setExpandedFAQs((prev) =>
      prev.includes(question)
        ? prev.filter((q) => q !== question)
        : [...prev, question]
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(price);
  };

  // Prepare structured data for courses
  const courseStructuredData = courses.map((course) => ({
    '@type': 'Course',
    name: course.title,
    description: course.description,
    provider: {
      '@type': 'Organization',
      name: 'Paco & Bryan',
      sameAs: 'https://yoursite.com',
    },
    instructor: {
      '@type': 'Person',
      name: course.instructor.name,
      jobTitle: course.instructor.role,
      description: course.instructor.bio,
    },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
      educationalLevel: 'beginner',
      inLanguage: 'es',
    },
    image: course.image,
    url: `https://yoursite.com/courses#${course.id}`,
  }));

  // Get the current selected course for the meta tags
  const currentCourse = courses.find((course) => course.id === selectedCourse);

  return (
    <>
      <NextSeo
        title="Traditional Mexican Crafts Courses | Paco & Bryan"
        description="Learn authentic Mexican crafting techniques from master artisans. Online courses in embroidery, weaving, and traditional crafts. Join our community of artisans."
        canonical="https://yoursite.com/courses"
        openGraph={{
          url: 'https://yoursite.com/courses',
          title: 'Traditional Mexican Crafts Courses | Paco & Bryan',
          description:
            'Learn authentic Mexican crafting techniques from master artisans. Online courses in embroidery, weaving, and traditional crafts.',
          images: [
            {
              url: currentCourse?.image || courses[0].image,
              width: 1200,
              height: 630,
              alt: 'Traditional Mexican Crafts Courses',
            },
          ],
          type: 'website',
        }}
        additionalMetaTags={[
          {
            name: 'keywords',
            content:
              'mexican crafts, embroidery course, traditional weaving, artisan skills, online courses',
          },
        ]}
      />
      <JsonLd
        item={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          itemListElement: courseStructuredData,
          numberOfItems: courses.length,
          name: 'Traditional Mexican Crafts Courses',
          description:
            'Learn authentic Mexican crafting techniques from master artisans',
        }}
      />
      <div className="pt-16">
        {/* Hero Section */}
        <div className="relative h-[70vh] overflow-hidden">
          <div className="absolute inset-0 grid grid-cols-2">
            <div className="relative">
              <img
                src="https://cdn.pixabay.com/photo/2020/06/01/19/52/thread-5248183_1280.jpg"
                alt={t('courses.hero.title')}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-primary/30" />
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&q=80&w=2000"
                alt={t('courses.hero.title')}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-primary/30" />
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/60 via-black/30 to-transparent">
            <div className="text-center text-white max-w-4xl px-4">
              <h1 className="text-4xl md:text-6xl font-serif mb-6 animate-[fade-in-up_1s_ease-out]">
                {t('courses.hero.title')}
              </h1>
              <p className="text-lg md:text-xl mb-8 text-white/90 animate-[fade-in-up_1s_ease-out_0.3s]">
                {t('courses.hero.subtitle')}
              </p>
              <button
                onClick={() =>
                  document
                    .getElementById('courses')
                    ?.scrollIntoView({ behavior: 'smooth' })
                }
                className="btn bg-white/90 hover:bg-white text-primary transition-all duration-300 animate-[fade-in-up_1s_ease-out_0.6s]"
              >
                {t('courses.hero.cta')}
              </button>
            </div>
          </div>
        </div>

        {/* Course Cards */}
        <div id="courses" className="bg-secondary-light py-24">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="group bg-white rounded-lg overflow-hidden shadow-soft hover:shadow-medium transition-all duration-300"
                >
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-6 text-white">
                      <h3 className="text-2xl font-serif mb-2">{course.title}</h3>
                      <p className="text-white/90">{course.subtitle}</p>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-primary/80 mb-6">{course.description}</p>
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setSelectedCourse(course.id)}
                        className="btn btn-primary"
                      >
                        {t('courses.card.learnMore')}
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Course Section */}
        {courses.map((course) => (
          <div
            key={course.id}
            className={`bg-white py-24 transition-opacity duration-500 ${
              selectedCourse === course.id ? 'opacity-100' : 'hidden'
            }`}
          >
            <div className="max-w-7xl mx-auto px-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Course Info */}
                <div className="lg:col-span-2">
                  <h2 className="text-3xl font-serif text-primary mb-6">
                    {course.title}
                  </h2>
                  <p className="text-lg text-primary/80 mb-8">
                    {course.description}
                  </p>

                  {/* Instructor */}
                  <div className="bg-secondary-light rounded-lg p-6 mb-8">
                    <div className="flex items-center space-x-4 mb-4">
                      <img
                        src={course.instructor.image}
                        alt={course.instructor.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-medium text-primary">
                          {course.instructor.name}
                        </h3>
                        <p className="text-primary/60">
                          {course.instructor.role}
                        </p>
                      </div>
                    </div>
                    <p className="text-primary/80">{course.instructor.bio}</p>
                  </div>

                  {/* Modules */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-serif text-primary mb-4">
                      {t('courses.card.modules')}
                    </h3>
                    {course.modules.map((module, index) => (
                      <div
                        key={index}
                        className="bg-white border-2 border-secondary/30 rounded-lg p-6 transition-all duration-300 hover:border-secondary"
                      >
                        <h4 className="font-medium text-primary mb-2">
                          {course.id === 'embroidery' ? (
                            <Needle className="w-5 h-5 inline-block mr-2 text-accent" />
                          ) : (
                            <Code className="w-5 h-5 inline-block mr-2 text-accent" />
                          )}
                          {module.title}
                        </h4>
                        <p className="text-primary/80">{module.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* FAQ Section */}
        <div className="bg-secondary-light py-24">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-3xl font-serif text-primary text-center mb-12">
              {t('courses.faq.title')}
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-soft overflow-hidden"
                >
                  <button
                    onClick={() => toggleFAQ(faq.question)}
                    className="w-full flex items-center justify-between p-6 text-left"
                  >
                    <span className="font-medium text-primary">
                      {faq.question}
                    </span>
                    {expandedFAQs.includes(faq.question) ? (
                      <ChevronUp className="w-5 h-5 text-primary/60" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-primary/60" />
                    )}
                  </button>
                  <div
                    className={`px-6 transition-all duration-300 ${
                      expandedFAQs.includes(faq.question)
                        ? 'max-h-48 pb-6 opacity-100'
                        : 'max-h-0 opacity-0'
                    }`}
                  >
                    <p className="text-primary/80">{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-primary text-white py-24">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-serif mb-6">
              {t('courses.testimonials.cta.title')}
            </h2>
            <p className="text-white/80 mb-8 text-lg">
              {t('courses.testimonials.cta.subtitle')}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}