import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Code2, Palette, Rocket, Binary, Terminal, Globe, ExternalLink, Cpu, Brain, Layers, LayoutGrid, BookOpen, Languages, Search, Sparkles } from 'lucide-react';
import SEO from '../components/SEO';
import { JsonLd } from 'react-schemaorg';

type Language = 'EN' | 'ES' | 'DE';

const content = {
    EN: {
        title: "Leonardo Torres Hernández",
        subtitle: "Architecting quintessential digital paradigms where heritage intertwines with avant-garde innovation.",
        bio: "My specialized approach to Diky was predicated on creating a bespoke digital sanctuary that venerates the meticulous manual labor inherent in Mexican craftsmanship. Every pixel is a calculated effort to synthesize the artisan's profound legacy with the sophisticated modern consumer.",
        tech: "Leveraging a panoply of state-of-the-art technologies—React, Vite, and nuanced SEO strategies—I ensured the platform transcended mere aesthetics to achieve indubitable technical supremacy.",
        precisionTitle: "Precision Engineering",
        precisionDesc: "Meticulous, scalable architectures designed for empirical performance.",
        designTitle: "Premium Aesthetics",
        designDesc: "Visual narratives that command attention and evoke visceral emotion.",
        logicTitle: "Multidisciplinary Logic",
        logicDesc: "C2 English, Native Spanish, and Higher Mathematics. Navigating the dichotomy between abstract theory and empirical implementation.",
        cognitiveTitle: "Cognitive Architecture",
        mathReasoning: "Abstract Reasoning",
        realAnalysis: "Real Analysis",
        calculus: "Calculus",
        linAlgebra: "Linear Algebra",
        prepGre: "GRE Math Prep",
        prepGerman: "C2 German Prep",
        details: {
            abstract: "Advanced logic and proof-based reasoning. Exploring the foundations of mathematical structures and axiomatic systems.",
            analysis: "Rigorous study of real numbers, Cauchy sequences, and functions. Mastering epsilon-delta proofs and convergence properties.",
            calculus: "Mastery of multivariable calculus, differential forms, and vector analysis. Application of high-level integration techniques.",
            algebra: "Linear transformations, spectral theory, and tensor products. Designing efficient algorithms for high-dimensional spaces.",
            gre: "Intensive focus on topology, abstract algebra, and differential equations in preparation for advanced subject examinations.",
            german: "Total immersion in complex German syntax, nuanced literature, and C2-level academic discourse (Goethe Großes Deutsches Sprachdiplom)."
        },
        scientificTitle: "Scientific Computing & Research",
        symbolicTitle: "Symbolic Regression System",
        symbolicDesc: "Engineered a robust symbolic regression framework from scratch in Python, dedicated to distilling mathematical truths from complex datasets without a priori assumptions.",
        taylorTitle: "Piecewise Taylor Regression",
        taylorDesc: "Architected a calculus-driven piecewise Taylor regression model to achieve localized precision in high-dimensional non-linear modeling.",
        futureTitle: "Building the Future",
        portfolio: "Interactive Portfolio",
        cta: "Establish Connection",
        pursuitsTitle: "Scholarly Endeavors",
        greTitle: "GRE Subject Mathematics",
        greDesc: "Comprehensive preparation in Real Analysis, Abstract Algebra, and Topology.",
        c2Title: "Goethe-Zertifikat C2",
        c2Desc: "Mastering German at the highest academic proficiency level (GDS).",
        statusPrep: "In Preparation"
    },
    ES: {
        title: "Leonardo Torres Hernández",
        subtitle: "Arquitecturando paradigmas digitales quintaesenciales donde el patrimonio se entrelaza con la innovación de vanguardia.",
        bio: "Mi enfoque especializado para Diky se basó en la creación de un santuario digital a medida que venera el meticuloso trabajo manual inherente a la artesanía mexicana. Cada píxel es un esfuerzo calculado para sintetizar el profundo legado del artesano con el sofisticado consumidor moderno.",
        tech: "Aprovechando una panoplia de tecnologías de vanguardia (React, Vite y estrategias de SEO matizadas), aseguré que la plataforma trascendiera la mera estética para lograr una supremacía técnica indudable.",
        precisionTitle: "Ingeniería de Precisión",
        precisionDesc: "Arquitecturas meticulosas y escalables diseñadas para un rendimiento empírico.",
        designTitle: "Estética Premium",
        designDesc: "Narrativas visuales que exigen atención y evocan una emoción visceral.",
        logicTitle: "Lógica Multidisciplinaria",
        logicDesc: "Inglés C2, Español Nativo y Matemáticas Superiores. Navegando la dicotomía entre la teoría abstracta y la implementación empírica.",
        cognitiveTitle: "Arquitectura Cognitiva",
        mathReasoning: "Razonamiento Abstracto",
        realAnalysis: "Análisis Real",
        calculus: "Cálculo",
        linAlgebra: "Álgebra Lineal",
        prepGre: "Prep GRE Math",
        prepGerman: "Prep Alemán C2",
        details: {
            abstract: "Lógica avanzada y razonamiento basado en demostraciones. Explorando las bases de las estructuras matemáticas y sistemas axiomáticos.",
            analysis: "Estudio riguroso de números reales, sucesiones de Cauchy y funciones. Dominio de demostraciones épsilon-delta y propiedades de convergencia.",
            calculus: "Dominio del cálculo multivariable, formas diferenciales y análisis vectorial. Aplicación de técnicas de integración de alto nivel.",
            algebra: "Transformaciones lineales, teoría espectral y productos tensoriales. Diseño de algoritmos eficientes para espacios de alta dimensión.",
            gre: "Enfoque intensivo en topología, álgebra abstracta y ecuaciones diferenciales en preparación para exámenes avanzados.",
            german: "Inmersión total en la sintaxis alemana compleja, literatura matizada y discurso académico de nivel C2 (Goethe GDS)."
        },
        scientificTitle: "Computación Científica e Investigación",
        symbolicTitle: "Sistema de Regresión Simbólica",
        symbolicDesc: "Diseñé un robusto marco de regresión simbólica desde cero en Python, dedicado a destilar verdades matemáticas de conjuntos de datos complejos sin suposiciones a priori.",
        taylorTitle: "Regresión de Taylor por Tramos",
        taylorDesc: "Arquitecturé un modelo de regresión de Taylor por tramos basado en cálculo para lograr precisión localizada en el modelado no lineal de alta dimensión.",
        futureTitle: "Construyendo el Futuro",
        portfolio: "Portafolio Interactivo",
        cta: "Establecer Conexión",
        pursuitsTitle: "Objetivos Académicos",
        greTitle: "GRE Subject Mathematics",
        greDesc: "Preparación integral en Análisis Real, Álgebra Abstracta y Topología.",
        c2Title: "Certificación C2 de Alemán",
        c2Desc: "Dominando el idioma alemán en el nivel de suficiencia académica más alto.",
        statusPrep: "En Preparación"
    },
    DE: {
        title: "Leonardo Torres Hernández",
        subtitle: "Architektur von essenziellen digitalen Paradigmen, in denen sich Erbe mit avantgardistischer Innovation verflicht.",
        bio: "Mein spezialisierter Ansatz für Diky basierte auf der Schaffung eines maßgeschneiderten digitalen Refugiums, das die akribische Handarbeit verehrt, die dem mexikanischen Kunsthandwerk eigen ist. Jedes Pixel ist eine kalkulierte Anstrengung, um das tiefe Erbe des Handwerkers mit dem anspruchsvollen modernen Konsumenten zu synthetisieren.",
        tech: "Durch die Nutzung einer Fülle modernster Technologien – React, Vite und nuancierte SEO-Strategien – stellte ich sicher, dass die Plattform über bloße Ästhetik hinausging, um eine unzweifelhafte technische Vorherrschaft zu erreichen.",
        precisionTitle: "Präzisionstechnik",
        precisionDesc: "Sorgfältige, skalierbare Architekturen, die für empirische Leistung konzipiert sind.",
        designTitle: "Premium-Ästhetik",
        designDesc: "Visuelle Narrative, die Aufmerksamkeit fordern und viszerale Emotionen hervorrufen.",
        logicTitle: "Multidisziplinäre Logik",
        logicDesc: "C2 Englisch, Spanisch Muttersprachler und höhere Mathematik. Navigation durch die Dichotomie zwischen abstrakter Theorie und empirischer Umsetzung.",
        cognitiveTitle: "Kognitive Architektur",
        mathReasoning: "Abstrakte Logik",
        realAnalysis: "Reelle Analysis",
        calculus: "Infinitesimalrechnung",
        linAlgebra: "Lineare Algebra",
        prepGre: "GRE Math Vorbereitung",
        prepGerman: "C2 Deutsch Vorbereitung",
        details: {
            abstract: "Fortgeschrittene Logik und beweisbasierte Argumentation. Erforschung der Grundlagen mathematischer Strukturen und axiomatischer Systeme.",
            analysis: "Strenges Studium reeller Zahlen, Cauchy-Folgen und Funktionen. Beherrschung von Epsilon-Delta-Beweisen und Konvergenzeigenschaften.",
            calculus: "Beherrschung der mehrdimensionalen Analysis, Differentialformen und Vektoranalyse. Anwendung hochgradiger Integrationstechniken.",
            algebra: "Lineare Transformationen, Spektraltheorie und Tensorprodukte. Entwicklung effizienter Algorithmen für hochdimensionale Räume.",
            gre: "Intensiver Fokus auf Topologie, abstrakte Algebra und Differentialgleichungen zur Vorbereitung auf fortgeschrittene Fachprüfungen.",
            german: "Vollständiges Eintauchen in komplexe deutsche Syntax, nuancierte Literatur und akademischen Diskurs auf C2-Niveau (Goethe GDS)."
        },
        scientificTitle: "Wissenschaftliches Rechnen & Forschung",
        symbolicTitle: "Symbolisches Regressionssystem",
        symbolicDesc: "Entwickelte ein robustes symbolisches Regressions-Framework von Grund auf in Python, das darauf abzielt, mathematische Wahrheiten aus komplexen Datensätzen ohne A-priori-Annahmen zu extrahieren.",
        taylorTitle: "Stückweise Taylor-Regression",
        taylorDesc: "Architektur eines kalkülbasierten stückweisen Taylor-Regressionsmodells zur Erzielung lokalisierter Präzision in der hochdimensionalen nichtlinearen Modellierung.",
        futureTitle: "Die Zukunft Bauen",
        portfolio: "Interaktives Portfolio",
        cta: "Verbindung Herstellen",
        pursuitsTitle: "Akademische Ziele",
        greTitle: "GRE Subject Mathematics",
        greDesc: "Umfassende Vorbereitung in reeller Analysis, abstrakter Algebra und Topologie.",
        c2Title: "Goethe-Zertifikat C2",
        c2Desc: "Beherrschung der deutschen Sprache auf höchstem akademischem Niveau (GDS).",
        statusPrep: "In Vorbereitung"
    }
};

export default function DeveloperPage() {
    const [lang, setLang] = useState<Language>('EN');
    const [selectedNode, setSelectedNode] = useState<number | null>(null);
    const languages: Language[] = ['EN', 'ES', 'DE'];

    const nextLang = () => {
        const currentIndex = languages.indexOf(lang);
        setLang(languages[(currentIndex + 1) % languages.length]);
    };

    const current = content[lang];

    return (
        <>
            <SEO
                title={`Developer | ${current.title}`}
                description={current.subtitle}
                canonical="https://diky.com/developer"
            />
            <JsonLd
                item={{
                    "@context": "https://schema.org",
                    "@type": "Person",
                    name: "Leonardo Torres Hernández",
                    jobTitle: "Full Stack Developer",
                    url: "https://diky.com/developer",
                    email: "leonardo.torres.hernandez@gmail.com",
                    description: current.logicDesc
                }}
            />
            <div className="min-h-screen bg-[#0A0A0A] text-white pt-32 pb-20 px-4 transition-colors duration-500">
                <div className="max-w-4xl mx-auto relative z-10">

                    {/* Global Floating Background Geometry - Fixed Layer */}
                    <div className="fixed inset-0 flex items-center justify-center z-0 pointer-events-none overflow-hidden">
                        <motion.div
                            animate={{
                                rotateZ: 360,
                                rotateX: [5, -5, 5],
                                rotateY: [-10, 10, -10],
                                scale: [1, 1.1, 1],
                            }}
                            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                            className="w-[120vh] h-[120vh] border-2 border-accent/10 rounded-full flex items-center justify-center transform-style-3d opacity-20 shadow-[0_0_100px_rgba(var(--accent-rgb),0.15)]"
                        >
                            <div className="w-[80vh] h-[80vh] border border-accent/5 rounded-full flex items-center justify-center">
                                <div className="w-[50vh] h-[50vh] border border-accent/10 rounded-full rotate-45" />
                            </div>

                            {/* Light Rays */}
                            <div className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-accent/10 to-transparent rotate-[45deg]" />
                            <div className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-accent/10 to-transparent rotate-[135deg]" />

                            {/* Abstract Symbols Layer - High Complexity & Starker Contrast */}
                            {[
                                { s: "ζ(s) = ∑_{n=1}^∞ n^{-s}", x: "10%", y: "15%", z: 150, size: "text-3xl" },
                                { s: "∀ε>0 ∃N: ∀n,m≥N ⇒ |xₙ-xₘ|<ε", x: "55%", y: "8%", z: 100, size: "text-2xl" },
                                { s: "lim sup xₙ = inf_{k≥1} sup_{n≥k} xₙ", x: "75%", y: "50%", z: 80, size: "text-xl" },
                                { s: "P ∧ (P → Q) ⊢ Q", x: "15%", y: "80%", z: 200, size: "text-3xl" },
                                { s: "[x**2 for x in f if x % 2 == 0]", x: "70%", y: "88%", z: -50, size: "text-lg" },
                                { s: "async def λ_calc(x: T) -> T:", x: "5%", y: "50%", z: 140, size: "text-xl" },
                                { s: "det(A - λI) = 0", x: "40%", y: "5%", z: 180, size: "text-2xl" },
                                { s: "¬(P ∧ Q) ≡ ¬P ∨ ¬Q", x: "85%", y: "25%", z: -80, size: "text-xl" },
                                { s: "∫_{a}^{b} f(x) dx", x: "25%", y: "92%", z: 40, size: "text-2xl" },
                                { s: "∇f(a)·(x-a)", x: "90%", y: "70%", z: -60, size: "text-xl" },
                                { s: "λx, y: x @ y", x: "50%", y: "95%", z: -100, size: "text-lg" }
                            ].map((sym, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0 }}
                                    animate={{
                                        opacity: [0.3, 0.8, 0.3],
                                        y: [0, -40, 0],
                                    }}
                                    transition={{
                                        duration: 8 + Math.random() * 8,
                                        repeat: Infinity,
                                        delay: i * 0.5
                                    }}
                                    className={`absolute font-mono text-white/40 ${sym.size} font-black whitespace-nowrap drop-shadow-[0_0_20px_rgba(var(--accent-rgb),0.5)]`}
                                    style={{ left: sym.x, top: sym.y, transform: `translateZ(${sym.z}px)` }}
                                >
                                    {sym.s}
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Language Roulette Switcher */}
                    <div className="flex justify-center mb-16">
                        <button
                            onClick={nextLang}
                            className="group relative flex items-center gap-4 px-6 py-3 rounded-full bg-white/5 border border-white/10 hover:border-accent/50 transition-all duration-500 overflow-hidden"
                        >
                            <Globe className="w-5 h-5 text-accent animate-spin-slow" />
                            <div className="relative h-6 w-8 flex flex-col overflow-hidden">
                                <AnimatePresence mode="wait">
                                    <motion.span
                                        key={lang}
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        exit={{ y: -20, opacity: 0 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                        className="absolute font-mono text-lg text-accent"
                                    >
                                        {lang}
                                    </motion.span>
                                </AnimatePresence>
                            </div>
                            <span className="text-sm font-light text-white/40 group-hover:text-white/80 transition-colors uppercase tracking-widest">
                                Switch Dialect
                            </span>
                            <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                    </div>

                    {/* Header Section */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={lang + 'header'}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.02 }}
                            transition={{ duration: 0.5 }}
                            className="text-center mb-24"
                        >
                            <h1 className="text-5xl md:text-8xl font-serif mb-8 tracking-tighter bg-gradient-to-br from-white via-white to-white/20 bg-clip-text text-transparent">
                                {current.title}
                            </h1>
                            <p className="text-lg md:text-2xl text-white/50 font-light max-w-2xl mx-auto leading-relaxed italic px-4">
                                "{current.subtitle}"
                            </p>
                        </motion.div>
                    </AnimatePresence>

                    {/* Portfolio & External Link */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-center mb-20"
                    >
                        <a
                            href="https://leonardotorreshernandez.github.io/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 px-8 py-4 rounded-full bg-white text-black hover:bg-accent hover:text-primary transition-all duration-300 group"
                        >
                            <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                <Cpu className="w-4 h-4" />
                            </div>
                            <span className="font-medium tracking-wide prose">{current.portfolio}</span>
                            <ExternalLink className="w-4 h-4" />
                        </a>
                    </motion.div>

                    {/* Stats/Focus Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
                        {[
                            { icon: Code2, title: current.precisionTitle, desc: current.precisionDesc },
                            { icon: Palette, title: current.designTitle, desc: current.designDesc },
                            { icon: Rocket, title: current.logicTitle, desc: current.logicDesc }
                        ].map((item, i) => (
                            <motion.div
                                key={i + lang}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: i * 0.1 }}
                                className="p-8 md:p-10 rounded-[2rem] md:rounded-[2.5rem] bg-[#111] border border-white/5 hover:border-accent/20 transition-all duration-500 group relative overflow-hidden"
                            >
                                <div className="relative z-10">
                                    <item.icon className="w-10 h-10 md:w-12 md:h-12 text-accent mb-6 md:mb-8 group-hover:scale-110 transition-transform duration-500" />
                                    <h3 className="text-lg md:text-xl font-medium mb-4">{item.title}</h3>
                                    <p className="text-white/40 font-light leading-relaxed text-sm group-hover:text-white/70 transition-colors">
                                        {item.desc}
                                    </p>
                                </div>
                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Detailed Narrative Section */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={lang + 'narrative'}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.6 }}
                            className="prose prose-invert max-w-none mb-24"
                        >
                            <div className="p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] bg-gradient-to-br from-[#111] to-transparent border border-white/10 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
                                <h2 className="text-3xl md:text-4xl font-serif mb-8 md:mb-10 text-white tracking-tight">The Diky Paradigm</h2>
                                <p className="text-lg md:text-xl text-white/50 leading-relaxed font-light mb-8">
                                    {current.bio}
                                </p>
                                <p className="text-lg md:text-xl text-white/50 leading-relaxed font-light">
                                    {current.tech}
                                </p>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Specialized Projects Section */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                        className="mb-24"
                    >
                        <h2 className="text-4xl font-serif mb-16 text-center tracking-tighter text-white/90">
                            {current.scientificTitle}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <motion.div
                                whileHover={{ y: -5 }}
                                className="p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] bg-[#111] border border-white/5 hover:border-accent/30 transition-all duration-500"
                            >
                                <Binary className="w-10 h-10 text-accent mb-8" />
                                <h3 className="text-xl md:text-2xl font-medium mb-6">{current.symbolicTitle}</h3>
                                <p className="text-white/50 font-light leading-relaxed text-sm md:text-base">
                                    {current.symbolicDesc}
                                </p>
                            </motion.div>
                            <motion.div
                                whileHover={{ y: -5 }}
                                className="p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] bg-[#111] border border-white/5 hover:border-accent/30 transition-all duration-500"
                            >
                                <Terminal className="w-10 h-10 text-accent mb-8" />
                                <h3 className="text-xl md:text-2xl font-medium mb-6">{current.taylorTitle}</h3>
                                <p className="text-white/50 font-light leading-relaxed text-sm md:text-base">
                                    {current.taylorDesc}
                                </p>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* 3D Cognitive Architecture Section */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                        className="mb-32 relative"
                    >
                        <h2 className="text-4xl font-serif mb-20 text-center tracking-tighter text-white/90">
                            {current.cognitiveTitle}
                        </h2>

                        <div className="relative h-auto md:h-[950px] w-full perspective-2000 flex items-center justify-center">
                            {/* 3D Cards Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-12 p-4 md:p-10 transform-style-3d w-full max-w-7xl relative z-10">
                                {[
                                    { id: 0, title: current.mathReasoning, icon: Brain, x: -30, y: -20, z: 100, color: "text-blue-400", descId: 'abstract' },
                                    { id: 1, title: current.realAnalysis, icon: Search, x: 30, y: -40, z: 80, color: "text-purple-400", descId: 'analysis' },
                                    { id: 2, title: current.calculus, icon: Layers, x: -50, y: 10, z: 120, color: "text-emerald-400", descId: 'calculus' },
                                    { id: 3, title: current.linAlgebra, icon: LayoutGrid, x: 50, y: 20, z: 140, color: "text-orange-400", descId: 'algebra' },
                                    { id: 4, title: current.prepGre, icon: BookOpen, x: -20, y: 50, z: 180, color: "text-accent", status: current.statusPrep, descId: 'gre' },
                                    { id: 5, title: current.prepGerman, icon: Languages, x: 40, y: 40, z: 160, color: "text-red-400", status: current.statusPrep, descId: 'german' }
                                ].map((node) => (
                                    <motion.div
                                        key={node.id + lang}
                                        onClick={() => setSelectedNode(node.id)}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        whileInView={{
                                            opacity: 1,
                                            scale: 1,
                                            rotateX: window.innerWidth < 768 ? 0 : node.y / 6,
                                            rotateY: window.innerWidth < 768 ? 0 : node.x / 6,
                                            z: window.innerWidth < 768 ? 0 : node.z,
                                            y: window.innerWidth < 768 ? 0 : -node.z / 15
                                        }}
                                        whileHover={{
                                            scale: window.innerWidth < 768 ? 1.05 : 1.18,
                                            z: window.innerWidth < 768 ? 0 : 300,
                                            rotateX: 0,
                                            rotateY: 0,
                                            y: window.innerWidth < 768 ? -10 : -40,
                                            transition: { type: "spring", stiffness: 20000, damping: 100, mass: 0.5 }
                                        }}
                                        className={`relative p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] bg-neutral-900/90 backdrop-blur-3xl border border-white/10 hover:border-accent shadow-[0_30px_60px_-15px_rgba(0,0,0,0.95)] md:shadow-[0_60px_120px_-30px_rgba(0,0,0,0.95)] flex flex-col items-center justify-center text-center group cursor-pointer overflow-hidden transform-style-3d hover:z-[100] transition-all duration-500`}
                                    >
                                        <div className={`mb-6 md:mb-8 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] bg-white/5 ${node.color} group-hover:bg-accent/20 transition-all duration-500 shadow-inner`}>
                                            <node.icon className="w-10 h-10 md:w-12 md:h-12 group-hover:scale-110 transition-transform duration-700" />
                                        </div>
                                        <h3 className="text-base md:text-xl font-serif tracking-tight text-white/90 group-hover:text-white transition-colors">
                                            {node.title}
                                        </h3>
                                        {node.status && (
                                            <div className="mt-4 md:mt-5 flex items-center gap-2 md:gap-3 px-3 md:px-5 py-1.5 md:py-2 rounded-full bg-accent/20 border border-accent/30 shadow-lg">
                                                <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-accent" />
                                                <span className="text-[8px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] text-accent font-black">
                                                    {node.status}
                                                </span>
                                            </div>
                                        )}
                                        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-3/4 h-6 bg-black/60 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Popup Detail Window */}
                        <AnimatePresence>
                            {selectedNode !== null && (
                                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        onClick={() => setSelectedNode(null)}
                                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                                    />
                                    <motion.div
                                        layoutId={`node-${selectedNode}`}
                                        initial={{ opacity: 0, scale: 0.9, y: 20, rotateX: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
                                        exit={{ opacity: 0, scale: 0.9, y: 20, rotateX: -20 }}
                                        className="relative w-full max-w-lg bg-neutral-900 border border-white/10 rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-12 shadow-2xl overflow-hidden transform-style-3d"
                                    >
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent" />

                                        {(() => {
                                            const nodes = [
                                                { title: current.mathReasoning, icon: Brain, color: "text-blue-400", desc: current.details.abstract },
                                                { title: current.realAnalysis, icon: Search, color: "text-purple-400", desc: current.details.analysis },
                                                { title: current.calculus, icon: Layers, color: "text-emerald-400", desc: current.details.calculus },
                                                { title: current.linAlgebra, icon: LayoutGrid, color: "text-orange-400", desc: current.details.algebra },
                                                { title: current.prepGre, icon: BookOpen, color: "text-accent", desc: current.details.gre },
                                                { title: current.prepGerman, icon: Languages, color: "text-red-400", desc: current.details.german }
                                            ];
                                            const node = nodes[selectedNode];
                                            return (
                                                <>
                                                    <div className="flex items-center gap-4 md:gap-6 mb-8 md:mb-10">
                                                        <div className={`p-4 md:p-5 rounded-2xl md:rounded-3xl bg-white/5 ${node.color}`}>
                                                            <node.icon className="w-8 h-8 md:w-10 md:h-10" />
                                                        </div>
                                                        <h3 className="text-2xl md:text-3xl font-serif text-white">{node.title}</h3>
                                                    </div>
                                                    <p className="text-lg md:text-xl text-white/60 leading-relaxed font-light mb-8 md:mb-12 italic">
                                                        "{node.desc}"
                                                    </p>
                                                    <button
                                                        onClick={() => setSelectedNode(null)}
                                                        className="w-full py-4 md:py-5 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 text-white/40 hover:bg-white/10 hover:text-white transition-all uppercase tracking-widest text-[10px] md:text-xs font-bold"
                                                    >
                                                        Dismiss Intelligence Node
                                                    </button>
                                                </>
                                            );
                                        })()}
                                    </motion.div>
                                </div>
                            )}
                        </AnimatePresence>
                    </motion.div>


                    {/* Final Contact CTA */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="text-center bg-accent/5 p-10 md:p-20 rounded-[2.5rem] md:rounded-[4rem] border border-accent/10"
                    >
                        <h2 className="text-3xl md:text-4xl font-serif mb-8 md:mb-10 text-white">{current.futureTitle}</h2>
                        <div className="flex flex-wrap justify-center gap-6 md:gap-8">
                            <a
                                href="mailto:leonardo.torres.hernandez@gmail.com"
                                className="group relative flex items-center gap-4 px-8 md:px-10 py-4 md:py-5 rounded-full bg-accent text-primary hover:scale-[1.02] transition-all duration-500 font-bold tracking-widest uppercase overflow-hidden text-sm md:text-base"
                            >
                                <div className="relative z-10 flex items-center gap-3">
                                    <Mail className="w-5 h-5 md:w-6 md:h-6" />
                                    {current.cta}
                                </div>
                                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
                            </a>
                        </div>
                    </motion.div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 12s linear infinite;
                }
                .font-serif {
                    font-family: 'Cormorant Garamond', serif;
                }
                .perspective-2000 {
                    perspective: 2000px;
                }
                .transform-style-3d {
                    transform-style: preserve-3d;
                }
            `}} />
        </>
    );
}
