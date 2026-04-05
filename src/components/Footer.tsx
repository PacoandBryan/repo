import { Instagram, Facebook, Mail, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="relative bg-[#1A1A1A] text-white overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[120px] -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[120px] translate-y-1/2" />

      <div className="relative max-w-7xl mx-auto pt-20 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          {/* Brand Section */}
          <div className="md:col-span-4 flex flex-col items-center md:items-start text-center md:text-left">
            <Logo variant="light" />
            <p className="mt-6 text-white/60 font-light leading-relaxed max-w-xs">
              Celebrando el alma de la tradición mexicana a través de bolsos meticulosamente elaborados a mano y dulces premium. Cada pieza cuenta una historia.
            </p>
            <div className="flex gap-4 mt-8">
              {[
                { Icon: Instagram, href: '#' },
                { Icon: Facebook, href: '#' },
                {
                  Icon: ({ className }: { className: string }) => (
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className={className}
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  ),
                  href: 'https://wa.me/525586981654'
                },
                { Icon: Mail, href: 'mailto:info@diky.mx' }
              ].map((item, i) => (
                <a key={i} href={item.href} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 hover:bg-accent hover:text-primary transition-all duration-300">
                  <item.Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2 text-center md:text-left">
            <h4 className="text-lg font-serif mb-6 text-accent">Experiencia</h4>
            <ul className="space-y-4">
              {[
                { label: 'Colección', path: '/catalog' },
                { label: 'La Historia', path: '/' },
                { label: 'Artesanos', path: '/' },
                { label: 'Contacto', path: '/contact' }
              ].map((link, i) => (
                <li key={i}>
                  <Link to={link.path} className="text-white/60 hover:text-white hover:translate-x-1 transition-all duration-300 inline-block font-light">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div className="md:col-span-2 text-center md:text-left">
            <h4 className="text-lg font-serif mb-6 text-accent">Curadurías</h4>
            <ul className="space-y-4 font-light text-white/60">
              <li><Link to="/purses" className="hover:text-white transition-colors">Bolsos Hechos a Mano</Link></li>
              <li><Link to="/sweets" className="hover:text-white transition-colors">Dulces Artesanales</Link></li>
              <li><Link to="/stitched-teddies" className="hover:text-white transition-colors">Osos de Peluche</Link></li>
              <li><Link to="/courses" className="hover:text-white transition-colors">Talleres</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="md:col-span-4 text-center md:text-left">
            <h4 className="text-lg font-serif mb-6 text-accent">Contacto</h4>
            <ul className="space-y-6">
              <li className="flex flex-col md:flex-row items-center md:items-start gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-accent/50 transition-colors">
                  <Mail className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-white/40 uppercase tracking-widest mb-1">Correo</p>
                  <a href="mailto:info@diky.mx" className="text-white/80 font-light transition-colors group-hover:text-accent">info@diky.mx</a>
                </div>
              </li>
              <li className="flex flex-col md:flex-row items-center md:items-start gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-accent/50 transition-colors">
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5 text-accent"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-white/40 uppercase tracking-widest mb-1">WhatsApp</p>
                  <a
                    href="https://wa.me/525586981654"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/80 font-light transition-colors group-hover:text-accent"
                  >
                    +52 55 8698 1654
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-8 text-sm font-light">
          <div className="flex flex-col items-center md:items-start gap-2">
            <p className="text-white/40 text-center md:text-left">
              © 2025 Diky. Todos los derechos reservados.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end gap-3 text-white/40">
            <div className="flex items-center gap-2 group justify-center md:justify-end">
              <span>Hecho con</span>
              <Heart className="w-4 h-4 text-accent fill-accent animate-pulse" />
              <span>por</span>
              <span className="text-white/80 font-medium">Leonardo Torres Hernández</span>
            </div>

            <div className="flex flex-wrap justify-center md:justify-end items-center gap-x-4 gap-y-2">
              <a
                href="mailto:leonardo.torres.hernandez@gmail.com"
                className="hover:text-accent transition-colors flex items-center gap-2"
              >
                <Mail className="w-3.5 h-3.5" />
                leonardo.torres.hernandez@gmail.com
              </a>
              <span className="hidden md:inline text-white/20">•</span>
              <Link
                to="/developer"
                className="bg-accent/10 text-accent px-4 py-1.5 rounded-full border border-accent/20 hover:bg-accent hover:text-primary transition-all duration-300 font-medium flex items-center gap-2"
              >
                Ver Perfil de Desarrollador
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}