import React, { useState } from 'react';
import { Play, Code, BedDouble as Needle, Users, Calendar, Clock, ChevronDown, ChevronUp, Star, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Course {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  duration: string;
  startDate: string;
  students: number;
  price: number;
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

const courses: Course[] = [
  {
    id: 'embroidery',
    title: 'Embroidery Mastery',
    subtitle: 'Stitching Tradition & Art',
    description: 'Immerse yourself in the rich tradition of Mexican embroidery. From basic stitches to complex patterns, learn how to create stunning pieces that tell stories through thread and fabric.',
    duration: '8 weeks',
    startDate: 'March 15, 2024',
    students: 234,
    price: 2800,
    image: 'https://images.unsplash.com/photo-1590927793796-c6cc0c97e7b4?auto=format&fit=crop&q=80&w=1000',
    instructor: {
      name: 'María González',
      role: 'Master Artisan',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400',
      bio: 'With over 20 years of experience in traditional Mexican embroidery, María brings a wealth of knowledge and passion to her teaching.'
    },
    modules: [
      {
        title: 'Foundations of Embroidery',
        description: 'Learn essential tools, materials, and basic stitches that form the foundation of embroidery.'
      },
      {
        title: 'Traditional Mexican Patterns',
        description: 'Explore the rich history and techniques behind traditional Mexican embroidery patterns.'
      },
      {
        title: 'Color Theory & Design',
        description: 'Master the art of color combination and pattern design for stunning visual impact.'
      },
      {
        title: 'Advanced Techniques',
        description: 'Take your skills to the next level with complex stitches and professional finishing methods.'
      }
    ]
  },
  {
    id: 'web-dev',
    title: 'Web Development Fundamentals',
    subtitle: 'HTML, CSS & JavaScript Essentials',
    description: 'Begin your journey into web development with this comprehensive introduction to the core technologies that power the modern web.',
    duration: '10 weeks',
    startDate: 'April 1, 2024',
    students: 456,
    price: 3200,
    image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&q=80&w=1000',
    instructor: {
      name: 'Alex Rivera',
      role: 'Senior Web Developer',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400',
      bio: 'A passionate educator with 10+ years of industry experience, Alex specializes in making complex concepts accessible to beginners.'
    },
    modules: [
      {
        title: 'HTML5 Fundamentals',
        description: 'Learn the building blocks of web pages and proper semantic markup.'
      },
      {
        title: 'CSS Styling & Layout',
        description: 'Master modern CSS techniques for creating beautiful, responsive designs.'
      },
      {
        title: 'JavaScript Basics',
        description: 'Introduction to programming concepts and interactive web development.'
      },
      {
        title: 'Building Real Projects',
        description: 'Apply your skills by building practical, real-world websites.'
      }
    ]
  }
];

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'Do I need any prior experience?',
    answer: 'No prior experience is needed for either course. Our programs are designed to take you from beginner to confident practitioner.'
  },
  {
    question: 'What materials do I need?',
    answer: 'For the embroidery course, we provide a starter kit with all necessary materials. For web development, you\'ll need a computer with internet access.'
  },
  {
    question: 'Are the courses self-paced?',
    answer: 'While you can review materials at your own pace, we follow a weekly structure to ensure you stay on track and can interact with fellow students.'
  },
  {
    question: 'Is there a certificate upon completion?',
    answer: 'Yes, both courses provide a certificate of completion once you\'ve finished all required modules and projects.'
  }
];

export default function CoursesPage() {
  const { t } = useTranslation();
  const [selectedCourse, setSelectedCourse] = useState<string>('embroidery');
  const [expandedFAQs, setExpandedFAQs] = useState<string[]>([]);

  const toggleFAQ = (question: string) => {
    setExpandedFAQs(prev =>
      prev.includes(question)
        ? prev.filter(q => q !== question)
        : [...prev, question]
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price);
  };

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <div className="relative h-[70vh] overflow-hidden">
        <div className="absolute inset-0 grid grid-cols-2">
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1590927793796-c6cc0c97e7b4?auto=format&fit=crop&q=80&w=2000"
              alt="Embroidery"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-primary/30" />
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&q=80&w=2000"
              alt="Web Development"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-primary/30" />
          </div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/60 via-black/30 to-transparent">
          <div className="text-center text-white max-w-4xl px-4">
            <h1 className="text-4xl md:text-6xl font-serif mb-6 animate-[fade-in-up_1s_ease-out]">
              Learn Art & Technology with Dikí
            </h1>
            <p className="text-lg md:text-xl mb-8 text-white/90 animate-[fade-in-up_1s_ease-out_0.3s]">
              Whether you're drawn to the tactile beauty of embroidery or eager to master the basics of web development, 
              our courses blend creativity with practical skills.
            </p>
            <button 
              onClick={() => document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn bg-white/90 hover:bg-white text-primary transition-all duration-300 animate-[fade-in-up_1s_ease-out_0.6s]"
            >
              Explore Courses
            </button>
          </div>
        </div>
      </div>

      {/* Course Cards */}
      <div id="courses" className="bg-secondary-light py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {courses.map(course => (
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
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <Clock className="w-6 h-6 text-accent mx-auto mb-2" />
                      <p className="text-sm text-primary/60">{course.duration}</p>
                    </div>
                    <div className="text-center">
                      <Calendar className="w-6 h-6 text-accent mx-auto mb-2" />
                      <p className="text-sm text-primary/60">Starts {course.startDate}</p>
                    </div>
                    <div className="text-center">
                      <Users className="w-6 h-6 text-accent mx-auto mb-2" />
                      <p className="text-sm text-primary/60">{course.students}+ students</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-serif text-primary">{formatPrice(course.price)}</span>
                    <button
                      onClick={() => setSelectedCourse(course.id)}
                      className="btn btn-primary"
                    >
                      Learn More
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
      {courses.map(course => (
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
                <h2 className="text-3xl font-serif text-primary mb-6">{course.title}</h2>
                <p className="text-lg text-primary/80 mb-8">{course.description}</p>
                
                {/* Instructor */}
                <div className="bg-secondary-light rounded-lg p-6 mb-8">
                  <div className="flex items-center space-x-4 mb-4">
                    <img
                      src={course.instructor.image}
                      alt={course.instructor.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-medium text-primary">{course.instructor.name}</h3>
                      <p className="text-primary/60">{course.instructor.role}</p>
                    </div>
                  </div>
                  <p className="text-primary/80">{course.instructor.bio}</p>
                </div>

                {/* Modules */}
                <div className="space-y-4">
                  <h3 className="text-xl font-serif text-primary mb-4">Course Modules</h3>
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

              {/* Enrollment Card */}
              <div className="lg:col-span-1">
                <div className="bg-white border-2 border-secondary rounded-lg p-6 sticky top-24">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-serif text-primary mb-2">{formatPrice(course.price)}</h3>
                    <p className="text-primary/60">Full course access</p>
                  </div>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center text-primary/80">
                      <Clock className="w-5 h-5 mr-3 text-accent" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center text-primary/80">
                      <Calendar className="w-5 h-5 mr-3 text-accent" />
                      <span>Starts {course.startDate}</span>
                    </div>
                    <div className="flex items-center text-primary/80">
                      <Users className="w-5 h-5 mr-3 text-accent" />
                      <span>{course.students}+ enrolled</span>
                    </div>
                  </div>

                  <button className="btn btn-primary w-full mb-4">
                    Enroll Now
                  </button>
                  <button className="btn btn-outline w-full">
                    Download Syllabus
                  </button>
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
            Frequently Asked Questions
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
                  <span className="font-medium text-primary">{faq.question}</span>
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

      {/* Testimonials */}
      <div className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-serif text-primary text-center mb-12">
            What Our Students Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sofia Rodriguez',
                course: 'Embroidery Mastery',
                image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
                text: 'The course exceeded my expectations. María is an amazing instructor who brings both expertise and patience to her teaching.'
              },
              {
                name: 'Juan Morales',
                course: 'Web Development',
                image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400',
                text: 'As someone with no prior coding experience, this course provided the perfect foundation. The hands-on projects were especially valuable.'
              },
              {
                name: 'Ana Martinez',
                course: 'Embroidery Mastery',
                image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400',
                text: 'Learning traditional techniques while exploring modern applications was exactly what I was looking for. Highly recommended!'
              }
            ].map((testimonial, index) => (
              <div
                key={index}
                className="bg-secondary-light/50 rounded-lg p-6"
              >
                <div className="flex text-accent mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5" fill="currentColor" />
                  ))}
                </div>
                <p className="text-primary/80 mb-6">{testimonial.text}</p>
                <div className="flex items-center space-x-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-primary">{testimonial.name}</p>
                    <p className="text-sm text-primary/60">{testimonial.course}</p>
                  </div>
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
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-white/80 mb-8 text-lg">
            Join our community of learners and start mastering new skills today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="btn bg-white text-primary hover:bg-white/90">
              <Play className="w-5 h-5 mr-2" />
              Get Started
            </button>
            <button className="btn border-2 border-white text-white hover:bg-white/10">
              View Course Calendar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}