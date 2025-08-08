'use client'

import { useState, useEffect } from 'react'

interface Section {
  _id: string
  key: string
  title: string
  description: string
  image_url?: string
  link_url?: string
}

interface PegawaiItem {
  id: string;
  nama: string;
  jabatan: string;
  foto_url?: string;
  deskripsi?: string;
}

interface DusunGalleryItem {
  id: string;
  title: string;
  description: string;
  image_url: string;
  uploaded_at: string;
}

interface DusunItem {
  key: string;
  name: string;
  deskripsi: string;
  link_gambar?: string;
  link_kadus?: string; // New field for kadus photo
  nama_kadus?: string; // New field for kadus name
  gallery?: DusunGalleryItem[]; // New field for dusun gallery
}

interface GalleryItem {
  id: string;
  title: string;
  description: string;
  image_url: string;
  uploaded_at: string;
}

interface ContentData {
  sections: Section[];
  pegawai: PegawaiItem[];
  dusun?: DusunItem[];
  gallery?: GalleryItem[];
}

export default function Home() {
  const [heroData, setHeroData] = useState<Section | null>(null);
  const [sectionsData, setSectionsData] = useState<Section[]>([]);
  const [pegawaiData, setPegawaiData] = useState<PegawaiItem[]>([]);
  const [dusunData, setDusunData] = useState<DusunItem[]>([]);
  const [galleryData, setGalleryData] = useState<GalleryItem[]>([]);
  const [galeriKKNData, setGaleriKKNData] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [backgroundImageLoaded, setBackgroundImageLoaded] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [currentDusunSlide, setCurrentDusunSlide] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentLightboxImage, setCurrentLightboxImage] = useState<string | null>(null);
  const [showAllGallery, setShowAllGallery] = useState(false);
  const [showAllGaleriKKN, setShowAllGaleriKKN] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Fungsi untuk smooth scroll ke section
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  // Fungsi untuk scroll ke atas
  const scrollToTop = () => {
    // Add haptic feedback for mobile devices
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
    
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    
    // Optional: Add focus to top of page for accessibility
    const firstFocusableElement = document.querySelector('h1, [tabindex="0"]');
    if (firstFocusableElement instanceof HTMLElement) {
      setTimeout(() => {
        firstFocusableElement.focus();
      }, 500);
    }
  };

  useEffect(() => {
    // Fetch hero section data from API
    fetch("/api/content")
      .then((res) => res.json())
      .then((data: ContentData) => {
        console.log('✅ Data fetched from API:', data);
        
        const hero = data.sections?.find(section => section.key === 'hero');
        const heroData = hero || {
          _id: 'fallback-hero',
          key: 'hero',
          title: 'Selamat Datang di Kelurahan Sangpiak Salu',
          description: 'Website resmi Kelurahan Sangpiak Salu. Temukan informasi tentang Kelurahan, penduduk, potensi, dan berita terkini.',
          image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop&q=80'
        };
        
        console.log('✅ Hero data:', heroData);
        
        // Get all other sections (excluding hero)
        const otherSections = data.sections?.filter(section => 
          section.key !== 'hero'
        ) || [];
        
        console.log('✅ Other sections:', otherSections);
        
        setHeroData(heroData);
        setSectionsData(otherSections);
        
        // Set pegawai data
        if (data.pegawai) {
          setPegawaiData(data.pegawai);
          console.log('✅ Pegawai data set:', data.pegawai);
        }
        
        // Set dusun data
        if (data.dusun && Array.isArray(data.dusun)) {
          setDusunData(data.dusun);
          console.log('✅ Dusun data set:', data.dusun);
        }
        
        // Set gallery data
        if (data.gallery && Array.isArray(data.gallery)) {
          setGalleryData(data.gallery);
          console.log('✅ Gallery data set:', data.gallery);
        }
        
        setLoading(false);
        
        // Preload background image
        if (heroData.image_url) {
          const img = new Image();
          img.onload = () => setBackgroundImageLoaded(true);
          img.onerror = () => {
            console.error('❌ Hero background image failed to load:', heroData.image_url);
            setBackgroundImageLoaded(true); // Still set to true to show fallback
          };
          img.src = heroData.image_url;
        } else {
          setBackgroundImageLoaded(true);
        }
      })
      .catch((error) => {
        console.error("Error fetching hero data:", error);
        const fallbackHeroData = {
          _id: 'fallback-hero',
          key: 'hero',
          title: 'Selamat Datang di Kelurahan Sangpiak Salu',
          description: 'Website resmi Kelurahan Sangpiak Salu. Temukan informasi tentang Kelurahan, penduduk, potensi, dan berita terkini.',
          image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop&q=80'
        };
        setHeroData(fallbackHeroData);
        setSectionsData([]);
        setLoading(false);
        
        // Preload fallback background image
        const img = new Image();
        img.onload = () => setBackgroundImageLoaded(true);
        img.onerror = () => setBackgroundImageLoaded(true);
        img.src = fallbackHeroData.image_url;
      });
  }, []);

  // Auto-play untuk carousel staff
  useEffect(() => {
    if (!isAutoPlaying || pegawaiData.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % pegawaiData.length);
    }, 4000); // Ganti slide setiap 4 detik

    return () => clearInterval(interval);
  }, [isAutoPlaying, pegawaiData.length]);

  // Back to top button visibility control and scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollPercentage = (scrollTop / scrollHeight) * 100;
      
      setShowBackToTop(scrollTop > 300); // Show button after scrolling 300px
      setScrollProgress(Math.min(scrollPercentage, 100)); // Cap at 100%
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch Galeri KKN data
  useEffect(() => {
    fetch('/api/content')
      .then(res => res.json())
      .then(data => {
        // Check if galeri_kkn exists in the response
        if (data.galeri_kkn && Array.isArray(data.galeri_kkn)) {
          setGaleriKKNData(data.galeri_kkn);
          console.log('✅ Galeri KKN data set:', data.galeri_kkn);
        } else {
          // Fallback: try to fetch from a different endpoint or use mock data
          console.log('⚠️ No galeri_kkn found in main API response');
        }
      })
      .catch(error => {
        console.error('❌ Error fetching galeri KKN data:', error);
      });
  }, []);

  // Fungsi navigasi carousel
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % pegawaiData.length);
    // Pause auto-play sementara ketika user melakukan navigasi manual
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 8000); // Resume setelah 8 detik
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + pegawaiData.length) % pegawaiData.length);
    // Pause auto-play sementara ketika user melakukan navigasi manual
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 8000); // Resume setelah 8 detik
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    // Pause auto-play sementara ketika user melakukan navigasi manual
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 8000); // Resume setelah 8 detik
  };

  // Fungsi untuk lightbox gallery
  const openLightbox = (imageUrl: string) => {
    setCurrentLightboxImage(imageUrl);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden'; // Prevent scrolling
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setCurrentLightboxImage(null);
    document.body.style.overflow = 'unset'; // Restore scrolling
  };

  // Fungsi untuk toggle tampil semua gallery
  const toggleShowAllGallery = () => {
    setShowAllGallery(!showAllGallery);
  };

  // Function untuk menentukan berapa banyak foto yang ditampilkan
  const getDisplayedGallery = () => {
    if (showAllGallery) {
      return galleryData;
    }
    // Tampilkan 6 foto pertama jika ada lebih dari 6, atau semua jika 6 atau kurang
    return galleryData.length <= 6 ? galleryData : galleryData.slice(0, 6);
  };

  // Fungsi untuk toggle tampil semua galeri KKN
  const toggleShowAllGaleriKKN = () => {
    setShowAllGaleriKKN(!showAllGaleriKKN);
  };

  // Function untuk menentukan berapa banyak foto galeri KKN yang ditampilkan
  const getDisplayedGaleriKKN = () => {
    if (showAllGaleriKKN) {
      return galeriKKNData;
    }
    // Tampilkan 6 foto pertama jika ada lebih dari 6, atau semua jika 6 atau kurang
    return galeriKKNData.length <= 6 ? galeriKKNData : galeriKKNData.slice(0, 6);
  };

  return (
    <>
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(2rem);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes scroll-horizontal {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        .custom-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          display: none;
        }
        
        .auto-scroll {
          animation: scroll-horizontal 20s linear infinite;
        }
        
        .auto-scroll:hover {
          animation-play-state: paused;
        }
        
        /* Gradient border animation */
        @keyframes gradient-border {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        .gradient-border {
          background: linear-gradient(45deg, #3B82F6, #06B6D4, #8B5CF6, #EC4899);
          background-size: 400% 400%;
          animation: gradient-border 3s ease infinite;
        }
      `}</style>
      <div 
        className="min-h-screen"
        style={{
          backgroundImage: (heroData?.image_url && backgroundImageLoaded) 
            ? `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url("${heroData.image_url}")` 
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          transition: 'background-image 0.5s ease-in-out'
        }}
      >
      {/* Hero Section with Background Image - Full Screen */}
      <section className="relative min-h-screen flex flex-col text-white">

        {/* Sticky Header/Navbar - Always Transparent */}
        <header className="sticky top-0 z-50 bg-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-white drop-shadow-lg">
                  Kelurahan Sangpiak Salu
                </h1>
              </div>
              <nav className="hidden md:flex space-x-8">
                <button 
                  onClick={scrollToTop}
                  className="text-white hover:text-yellow-300 transition-colors font-medium drop-shadow-lg"
                >
                  Home
                </button>
                <button 
                  onClick={() => scrollToSection('dusun-section')}
                  className="text-white hover:text-yellow-300 transition-colors font-medium drop-shadow-lg"
                >
                  Dusun
                </button>
                <button 
                  onClick={() => scrollToSection('hubungi-section')}
                  className="text-white hover:text-yellow-300 transition-colors font-medium flex items-center drop-shadow-lg"
                >
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                  Kontak
                </button>
                <a 
                  href="/admin" 
                  className="text-white hover:text-yellow-300 transition-colors font-medium drop-shadow-lg"
                >
                  Admin Panel
                </a>
              </nav>
              
              {/* Mobile menu button */}
              <div className="md:hidden">
                <button className="text-white hover:text-yellow-300 transition-colors">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </header>
        
        {/* Hero Content - Centered */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-5xl">
            {loading ? (
              <div className="text-white">
                <div className="animate-pulse">
                  <div className="h-16 bg-white bg-opacity-20 rounded mb-4"></div>
                  <div className="h-6 bg-white bg-opacity-20 rounded"></div>
                </div>
              </div>
            ) : (
              <>
                <h1 id="home" className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight drop-shadow-2xl mb-6">
                  {heroData?.title || 'Kelurahan SANGPIAK SALU'}
                </h1>
                <p className="text-lg md:text-xl lg:text-2xl text-white mb-8 drop-shadow-lg max-w-3xl mx-auto">
                  {heroData?.description || 'Menelusiri keindahan alam dan kekayaan budaya Toraja'}
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => scrollToSection('about')}
                    className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    PROFIL DESA
                  </button>
                  <button
                    onClick={() => scrollToSection('hubungi-section')}
                    className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-full border-2 border-white text-white bg-transparent hover:bg-white hover:text-blue-600 transition-all duration-300"
                  >
                    LOKASI KAMI
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Features Section */}
          <div className="mt-20" id="about">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-800 sm:text-4xl">
                Keunggulan Kelurahan Kami
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-700">
                Sangpiak Salu memiliki berbagai keunggulan yang membanggakan
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900 text-center">Lokasi Strategis</h3>
                <p className="mt-2 text-base text-gray-600 text-center">
                  Terletak di lokasi yang strategis dengan akses mudah ke berbagai fasilitas umum.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white mx-auto">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900 text-center">Masyarakat Harmonis</h3>
                <p className="mt-2 text-base text-gray-600 text-center">
                  Masyarakat yang gotong royong dan menjaga keharmonisan dalam kehidupan sehari-hari.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-yellow-500 text-white mx-auto">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900 text-center">Potensi Berkembang</h3>
                <p className="mt-2 text-base text-gray-600 text-center">
                  Memiliki potensi besar untuk berkembang di berbagai sektor ekonomi dan pariwisata.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Sections from Database */}
      {sectionsData.map((section, index) => {
        // Section kata_sambutan khusus: gambar kiri, teks kanan
        const isKataSambutan = section.key === 'kata_sambutan';
        // Section 3 khusus: gambar kanan sebagai link, teks kiri
        const isSection3 = section.key === 'section3' || index === 2;
        
        return (
          <div 
            key={section.key} 
            className={`py-20 ${index === 0 ? 'pt-32' : ''}`}
            style={{ 
              backgroundColor: isKataSambutan ? '#e2e9ff' : '#ffffff'
            }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  
                  {/* Layout untuk Kata Sambutan: Gambar Kiri, Teks Kanan */}
                  {isKataSambutan ? (
                    <>
                      {/* Image - Kiri */}
                      <div className="h-80 lg:h-96 rounded-lg overflow-hidden shadow-lg">
                        {section.image_url ? (
                          <div className="relative h-full">
                            <div 
                              className="w-full h-full bg-cover bg-center bg-no-repeat"
                              style={{
                                backgroundImage: `url("${section.image_url}")`
                              }}
                            />
                            <img
                              src={section.image_url}
                              alt={section.title}
                              className="w-full h-full object-cover opacity-0"
                              onLoad={(e) => {
                                (e.target as HTMLImageElement).style.opacity = '1';
                              }}
                              onError={(e) => {
                                console.error('❌ Kata sambutan image failed to load:', section.image_url);
                                // Hide the failed image and show placeholder
                                const target = e.target as HTMLImageElement;
                                target.style.opacity = '0';
                                const backgroundDiv = target.previousElementSibling as HTMLElement;
                                if (backgroundDiv) {
                                  backgroundDiv.style.backgroundImage = 'linear-gradient(135deg, #dbeafe 0%, #c7d2fe 100%)';
                                  backgroundDiv.innerHTML = `
                                    <div class="flex items-center justify-center h-full">
                                      <div class="text-center">
                                        <svg class="mx-auto h-16 w-16 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                        </svg>
                                        <p class="mt-2 text-blue-600 font-medium">Gambar Kepala Kelurahan tidak dapat dimuat</p>
                                      </div>
                                    </div>
                                  `;
                                }
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center">
                            <div className="text-center">
                              <svg className="mx-auto h-16 w-16 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <p className="mt-2 text-blue-600 font-medium">Foto Kepala Kelurahan tidak tersedia</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Text Content - Kanan */}
                      <div className="space-y-6">
                        <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl leading-tight">
                          {section.title}
                        </h2>
                        <p className="text-lg text-gray-600 leading-relaxed sm:text-xl">
                          {section.description}
                        </p>
                      </div>
                    </>
                  ) : isSection3 ? (
                    <>
                      {/* Text Content - Kiri */}
                      <div className="space-y-6">
                        <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl leading-tight">
                          {section.title}
                        </h2>
                        <p className="text-lg text-gray-600 leading-relaxed sm:text-xl">
                          {section.description}
                        </p>
                      </div>

                      {/* Image - Kanan sebagai Link */}
                      <div className="h-80 lg:h-96 rounded-lg overflow-hidden shadow-lg">
                        {section.image_url ? (
                          section.link_url ? (
                            // Gambar dapat diklik sebagai link
                            <a 
                              href={section.link_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block relative h-full group cursor-pointer hover:shadow-xl transition-all duration-300"
                              title={`Kunjungi: ${section.title}`}
                            >
                              <img
                                src={section.image_url}
                                alt={section.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onLoad={(e) => {
                                  console.log('✅ Section image loaded successfully');
                                }}
                                onError={(e) => {
                                  console.error('❌ Section image failed to load:', section.image_url);
                                  // Hide the failed image and show placeholder
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const parent = target.parentElement;
                                  if (parent) {
                                    parent.innerHTML = `
                                      <div class="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center">
                                        <div class="text-center">
                                          <svg class="mx-auto h-16 w-16 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                          </svg>
                                          <p class="mt-2 text-blue-600 font-medium">Gambar tidak dapat dimuat</p>
                                        </div>
                                      </div>
                                    `;
                                  }
                                }}
                              />
                              {/* Link indicator overlay */}
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white rounded-full p-3">
                                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                </div>
                              </div>
                            </a>
                          ) : (
                            // Gambar biasa tanpa link
                            <img
                              src={section.image_url}
                              alt={section.title}
                              className="w-full h-full object-cover"
                              onLoad={(e) => {
                                console.log('✅ Section image loaded successfully');
                              }}
                              onError={(e) => {
                                console.error('❌ Section image failed to load:', section.image_url);
                              }}
                            />
                          )
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center">
                            <div className="text-center">
                              <svg className="mx-auto h-16 w-16 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <p className="mt-2 text-blue-600 font-medium">Gambar tidak tersedia</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Layout Default untuk section lain: Teks Kiri, Gambar Kanan */}
                      <div className="space-y-6">
                        <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl leading-tight">
                          {section.title}
                        </h2>
                        <p className="text-lg text-gray-600 leading-relaxed sm:text-xl">
                          {section.description}
                        </p>
                      </div>

                      <div className="h-80 lg:h-96 rounded-lg overflow-hidden shadow-lg">
                        {section.image_url ? (
                          <div className="relative h-full">
                            <div 
                              className="w-full h-full bg-cover bg-center bg-no-repeat"
                              style={{
                                backgroundImage: `url("${section.image_url}")`
                              }}
                            />
                            <img
                              src={section.image_url}
                              alt={section.title}
                              className="w-full h-full object-cover opacity-0"
                              onLoad={(e) => {
                                (e.target as HTMLImageElement).style.opacity = '1';
                              }}
                              onError={(e) => {
                                console.error('❌ Section image failed to load:', section.image_url);
                                // Hide the failed image and show placeholder
                                const target = e.target as HTMLImageElement;
                                target.style.opacity = '0';
                                const backgroundDiv = target.previousElementSibling as HTMLElement;
                                if (backgroundDiv) {
                                  backgroundDiv.style.backgroundImage = 'linear-gradient(135deg, #dbeafe 0%, #c7d2fe 100%)';
                                  backgroundDiv.innerHTML = `
                                    <div class="flex items-center justify-center h-full">
                                      <div class="text-center">
                                        <svg class="mx-auto h-16 w-16 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                        </svg>
                                        <p class="mt-2 text-blue-600 font-medium">Gambar tidak dapat dimuat</p>
                                      </div>
                                    </div>
                                  `;
                                }
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center">
                            <div className="text-center">
                              <svg className="mx-auto h-16 w-16 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <p className="mt-2 text-blue-600 font-medium">Gambar tidak tersedia</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}

      {/* Staff Pegawai Section */}
      {pegawaiData.length > 0 && (
        <div style={{ backgroundColor: '#00052d' }} className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header Section */}
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">
                Staff Kelurahan
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Berkenalan dengan para pegawai yang berkomitmen melayani masyarakat Kelurahan Sangpiak Salu
              </p>
            </div>

            {/* Carousel Container */}
            <div className="relative max-w-4xl mx-auto">
              {/* Navigation Buttons */}
              <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-3 bg-white shadow-lg rounded-full hover:bg-gray-50 transition-all duration-200 transform hover:scale-110"
                disabled={pegawaiData.length <= 1}
              >
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-3 bg-white shadow-lg rounded-full hover:bg-gray-50 transition-all duration-200 transform hover:scale-110"
                disabled={pegawaiData.length <= 1}
              >
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Cards Container */}
              <div className="flex justify-center items-center space-x-8 px-16">
                {pegawaiData.length >= 3 ? (
                  /* Show 3 cards when we have 3 or more staff */
                  [-1, 0, 1].map((offset) => {
                    const index = (currentSlide + offset + pegawaiData.length) % pegawaiData.length;
                    const staff = pegawaiData[index];
                    const isCenter = offset === 0;

                    return (
                      <div
                        key={`${staff.id}-${index}`}
                        className={`transition-all duration-500 ease-in-out cursor-pointer ${
                          isCenter 
                            ? 'scale-110 z-10 shadow-2xl' 
                            : 'scale-90 opacity-70 hover:opacity-90'
                        }`}
                        onClick={() => !isCenter && goToSlide(index)}
                      >
                        <div className={`bg-white rounded-2xl overflow-hidden ${
                          isCenter 
                            ? 'ring-4 ring-blue-500 ring-opacity-50' 
                            : 'hover:shadow-lg'
                        }`}>
                          {/* Staff Photo */}
                          <div className="aspect-w-3 aspect-h-4 bg-gradient-to-br from-gray-100 to-gray-200">
                            <div className="w-80 h-96 overflow-hidden">
                              {staff.foto_url ? (
                                <img
                                  src={staff.foto_url}
                                  alt={staff.nama}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    console.error('❌ Staff photo failed to load:', staff.foto_url);
                                    const target = e.target as HTMLImageElement;
                                    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjM4NCIgdmlld0JveD0iMCAwIDMyMCAzODQiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMzg0IiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjE2MCIgY3k9IjEyMCIgcj0iNDAiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTgwIDMwNEM4MCAyNTcuMDU4IDExNy4wNTggMjIwIDE2NCAyMjBIMjEyQzI1OC45NDIgMjIwIDI5NiAyNTcuMDU4IDI5NiAzMDRIODBaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=';
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                  <div className="text-center">
                                    <svg className="mx-auto h-20 w-20 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                    <p className="mt-2 text-gray-500 font-medium text-sm">Foto Tidak Tersedia</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Staff Info */}
                          <div className="p-6">
                            <h3 className={`font-bold text-gray-900 text-center mb-2 ${
                              isCenter ? 'text-xl' : 'text-lg'
                            }`}>
                              {staff.nama}
                            </h3>
                            <p className={`text-blue-600 font-medium text-center mb-3 ${
                              isCenter ? 'text-base' : 'text-sm'
                            }`}>
                              {staff.jabatan}
                            </p>
                            
                            {/* Description - only show on center card */}
                            {isCenter && staff.deskripsi && (
                              <p className="text-sm text-gray-600 text-center leading-relaxed mb-4">
                                {staff.deskripsi}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  /* Show all cards when we have less than 3 staff */
                  pegawaiData.map((staff, index) => {
                    const isCenter = index === currentSlide;
                    
                    return (
                      <div
                        key={staff.id}
                        className={`transition-all duration-500 ease-in-out cursor-pointer ${
                          isCenter 
                            ? 'scale-110 z-10 shadow-2xl' 
                            : 'scale-90 opacity-70 hover:opacity-90'
                        }`}
                        onClick={() => !isCenter && goToSlide(index)}
                      >
                        <div className={`bg-white rounded-2xl overflow-hidden ${
                          isCenter 
                            ? 'ring-4 ring-blue-500 ring-opacity-50' 
                            : 'hover:shadow-lg'
                        }`}>
                          {/* Staff Photo */}
                          <div className="aspect-w-3 aspect-h-4 bg-gradient-to-br from-gray-100 to-gray-200">
                            <div className="w-80 h-96 overflow-hidden">
                              {staff.foto_url ? (
                                <img
                                  src={staff.foto_url}
                                  alt={staff.nama}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    console.error('❌ Staff photo failed to load:', staff.foto_url);
                                    const target = e.target as HTMLImageElement;
                                    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjM4NCIgdmlld0JveD0iMCAwIDMyMCAzODQiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMzg0IiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjE2MCIgY3k9IjEyMCIgcj0iNDAiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTgwIDMwNEM4MCAyNTcuMDU4IDExNy4wNTggMjIwIDE2NCAyMjBIMjEyQzI1OC45NDIgMjIwIDI5NiAyNTcuMDU4IDI5NiAzMDRIODBaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=';
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                  <div className="text-center">
                                    <svg className="mx-auto h-20 w-20 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                    <p className="mt-2 text-gray-500 font-medium text-sm">Foto Tidak Tersedia</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Staff Info */}
                          <div className="p-6">
                            <h3 className={`font-bold text-gray-900 text-center mb-2 ${
                              isCenter ? 'text-xl' : 'text-lg'
                            }`}>
                              {staff.nama}
                            </h3>
                            <p className={`text-blue-600 font-medium text-center mb-3 ${
                              isCenter ? 'text-base' : 'text-sm'
                            }`}>
                              {staff.jabatan}
                            </p>
                            
                            {/* Description - only show on center card */}
                            {isCenter && staff.deskripsi && (
                              <p className="text-sm text-gray-600 text-center leading-relaxed mb-4">
                                {staff.deskripsi}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Staff Counter */}
              <div className="text-center mt-12">
                <p className="text-sm text-gray-400 mb-2">
                  {currentSlide + 1} dari {pegawaiData.length} pegawai
                </p>
                {/* Auto-play indicator */}
                {isAutoPlaying && pegawaiData.length > 1 && (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-blue-400">Auto-play aktif</span>
                  </div>
                )}
                {/* Manual control hint */}
                {!isAutoPlaying && pegawaiData.length > 1 && (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="text-xs text-gray-400">Klik untuk navigasi manual</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Location Section */}
      <div className="bg-gray-50 py-20" id="location">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Lokasi Kelurahan Sangpiak Salu
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Temukan keindahan Kelurahan Sangpiak Salu yang berlokasi di Kecamatan Nanggala, Kabupaten Toraja Utara, Sulawesi Selatan
            </p>
          </div>

          {/* Main Content - Maps and Info Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Maps - Left Side (2/3 width) */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl overflow-hidden shadow-xl border border-gray-200">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3975.123456789!2d119.8123456!3d-3.0123456!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2d93e5f3b4a5c7d9%3A0x1234567890abcdef!2sSangpiak%20Salu%2C%20Makale%2C%20Tana%20Toraja%20Regency%2C%20South%20Sulawesi!5e0!3m2!1sen!2sid!4v1234567890123!5m2!1sen!2sid"
                  width="100%"
                  height="450"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Peta Lokasi Kelurahan Sangpiak Salu"
                  className="w-full"
                />
              </div>
            </div>

            {/* Location Info - Right Side (1/3 width) */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-xl p-8 border border-gray-200 h-full">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                  Informasi Lokasi
                </h3>
                
                <div className="space-y-6">
                  {/* Address */}
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h4 className="font-semibold text-gray-900 mb-1">Alamat</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        Kelurahan Sangpiak Salu, Kec. Nanggala, Kabupaten Toraja Utara, Sulawesi Selatan
                      </p>
                    </div>
                  </div>

                  {/* Distance */}
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h4 className="font-semibold text-gray-900 mb-1">Jarak</h4>
                      <p className="text-gray-600 text-sm">
                        ± 15 km dari Pusat Kota Rantepao
                      </p>
                    </div>
                  </div>

                  {/* Travel Time */}
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h4 className="font-semibold text-gray-900 mb-1">Waktu Tempuh</h4>
                      <p className="text-gray-600 text-sm">
                        ± 30 menit dari Pusat Kota Rantepao
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <a
                    href="https://maps.app.goo.gl/7CSnLcocHnxGLHMi8"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 font-medium shadow-md hover:shadow-lg"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Buka di Google Maps
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Potensi Sangpiak Salu Section */}
      <div className="py-20" style={{ backgroundColor: '#e2e9ff' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-block">
              <div className="flex items-center justify-center mb-4">
                <div className="h-1 w-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mr-4"></div>
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                <div className="h-1 w-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full ml-4"></div>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Potensi Sangpiak Salu
              </h2>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
                Mengenal kekayaan budaya dan wisata alam yang menjadi kebanggaan Kelurahan Sangpiak Salu
              </p>
            </div>
          </div>

          {/* Content Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Rambu Solo Card */}
            <div className="group relative overflow-hidden rounded-2xl shadow-xl bg-white hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
              {/* Image Container */}
              <div className="relative h-72 overflow-hidden">
                <img
                  src="/RambuSolo.jpg"
                  alt="Rambu Solo - Upacara Adat Toraja"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent group-hover:from-black/40 transition-all duration-500"></div>
                
                {/* Badge */}
                <div className="absolute top-4 left-4">
                  <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <span className="text-sm font-semibold text-gray-800">Budaya</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-indigo-600 transition-colors duration-300">
                  Rambu Solo
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Upacara adat pemakaman tradisional Toraja yang menjadi warisan budaya tak ternilai. 
                  Rambu Solo menggambarkan rasa hormat dan cinta kepada leluhur dengan prosesi yang megah dan penuh makna simbolis.
                </p>
                
                {/* Features */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-gray-700">
                    <svg className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Upacara adat turun temurun</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <svg className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Nilai filosofis dan spiritual tinggi</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <svg className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Daya tarik wisata budaya</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Potensi Wisata Card */}
            <div className="group relative overflow-hidden rounded-2xl shadow-xl bg-white hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
              {/* Image Container */}
              <div className="relative h-72 overflow-hidden">
                <img
                  src="/PotensiAlam.jpg"
                  alt="Potensi Wisata Alam Sangpiak Salu"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent group-hover:from-black/40 transition-all duration-500"></div>
                
                {/* Badge */}
                <div className="absolute top-4 left-4">
                  <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                      <span className="text-sm font-semibold text-gray-800">Wisata</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-green-600 transition-colors duration-300">
                  Potensi Wisata
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Keindahan alam pegunungan Toraja dengan hamparan sawah terasering, hutan pinus yang asri, 
                  dan panorama alam yang memukau menjadikan Sangpiak Salu destinasi wisata alam yang menarik.
                </p>
                
                {/* Features */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-gray-700">
                    <svg className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Panorama alam pegunungan</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <svg className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Wisata eco-tourism berkelanjutan</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <svg className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Udara sejuk dan lingkungan asri</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dusun Section */}
      {dusunData.length > 0 && (
        <div id="dusun-section" style={{ backgroundColor: '#00052d' }} className="py-20 relative overflow-hidden">
          {/* Subtle Background Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl"></div>
            <div className="absolute top-60 right-20 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl"></div>
            <div className="absolute bottom-40 left-1/4 w-20 h-20 bg-indigo-500/5 rounded-full blur-2xl"></div>
            <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-purple-500/5 rounded-full blur-2xl"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Header Section */}
            <div className="text-center mb-16">
              <div className="inline-block">
                <div className="flex items-center justify-center mb-6">
                  <div className="h-px w-12 bg-gradient-to-r from-transparent to-blue-400 mr-4"></div>
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="h-px w-12 bg-gradient-to-l from-transparent to-blue-400 ml-4"></div>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Dusun di Sangpiak Salu
                </h2>
                <p className="text-gray-300 max-w-2xl mx-auto leading-relaxed">
                  Mengenal lebih dekat kepala dusun dan keindahan setiap kawasan di Kelurahan Sangpiak Salu
                </p>
              </div>
            </div>

            {/* Dusun Cards */}
            <div className="space-y-8">
              {dusunData.map((dusun, index) => (
                <div key={dusun.key || `dusun-${index}`} className="group">
                  {/* Enhanced Card Container */}
                  <div className="bg-white/8 backdrop-blur-md rounded-3xl overflow-hidden border border-white/20 hover:border-blue-400/50 transition-all duration-700 hover:shadow-2xl hover:shadow-blue-500/20 hover:bg-white/10">
                    
                    {/* Top Section - Image and Content Horizontal */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
                      {/* Card Image Section - Left (2 columns) */}
                      <div className="relative h-64 lg:h-72 lg:col-span-2 overflow-hidden">
                        {dusun.link_gambar ? (
                          <img
                            src={dusun.link_gambar}
                            alt={dusun.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-700 via-gray-600 to-gray-800 flex items-center justify-center">
                            <div className="text-center text-gray-300">
                              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <p className="text-sm font-medium">Foto {dusun.name}</p>
                            </div>
                          </div>
                        )}
                        
                        {/* Enhanced Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent"></div>
                        
                        {/* Stylish Number Badge */}
                        <div className="absolute top-5 left-5">
                          <div className="relative">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-2xl border border-blue-400/30">
                              {index + 1}
                            </div>
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-2xl opacity-20 blur-sm"></div>
                          </div>
                        </div>

                        {/* Enhanced Category Badge */}
                        <div className="absolute bottom-5 left-5">
                          <div className="relative">
                            <div className="inline-flex items-center bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                              <div className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></div>
                              <svg className="w-3 h-3 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span className="text-white text-sm font-semibold">Dusun</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card Content Section - Right (3 columns) */}
                      <div className="lg:col-span-3 p-8 flex flex-col justify-center space-y-6">
                        {/* Dusun Info with Enhanced Typography */}
                        <div className="space-y-4">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-blue-400/50 to-transparent"></div>
                            <span className="text-blue-400 text-xs font-semibold tracking-widest uppercase">Kawasan</span>
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-blue-400/50 to-transparent"></div>
                          </div>
                          
                          <h3 className="text-3xl lg:text-4xl font-bold text-white group-hover:text-blue-300 transition-colors duration-500 leading-tight">
                            {dusun.name}
                          </h3>
                          
                          <p className="text-gray-300 text-base leading-relaxed line-clamp-4 max-w-2xl">
                            {dusun.deskripsi}
                          </p>
                        </div>

                        {/* Enhanced Kepala Dusun Info */}
                        {(dusun.nama_kadus || dusun.link_kadus) && (
                          <div className="relative">
                            <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-500">
                              <div className="flex items-center space-x-4">
                                {/* Enhanced Profile Picture */}
                                <div className="relative flex-shrink-0">
                                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 p-1">
                                    <div className="w-full h-full rounded-xl overflow-hidden bg-gray-800">
                                      {dusun.link_kadus ? (
                                        <img
                                          src={dusun.link_kadus}
                                          alt={dusun.nama_kadus}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                          </svg>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  {/* Status Indicator */}
                                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-gray-800 flex items-center justify-center">
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                  </div>
                                </div>
                                
                                {/* Enhanced Profile Info */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <div className="flex items-center space-x-1">
                                      <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                      </svg>
                                      <span className="text-yellow-500 text-sm font-semibold">Kepala Dusun</span>
                                    </div>
                                  </div>
                                  <h4 className="text-white font-bold text-lg mb-1">
                                    {dusun.nama_kadus || 'Akan diperbarui'}
                                  </h4>
                                  <p className="text-blue-300 text-sm font-medium">Pemimpin {dusun.name}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Enhanced Gallery Section - Full Width */}
                    {dusun.gallery && dusun.gallery.length > 0 && (
                      <div className="border-t border-white/10 bg-black/20">
                        <div className="p-8">
                          <div className="space-y-6">
                            {/* Gallery Header */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                                <div>
                                  <h4 className="text-white font-bold text-lg">Galeri Dusun</h4>
                                  <p className="text-gray-400 text-sm">Koleksi foto kawasan</p>
                                </div>
                              </div>
                              <div className="bg-blue-500/20 px-4 py-2 rounded-full border border-blue-500/30">
                                <span className="text-blue-300 text-sm font-semibold">
                                  {dusun.gallery.length} foto
                                </span>
                              </div>
                            </div>
                            
                            {/* Enhanced Gallery Grid */}
                            <div className="flex space-x-4 overflow-x-auto pb-4 custom-scrollbar">
                              {dusun.gallery.map((galleryItem, galleryIndex) => (
                                <div 
                                  key={galleryItem.id}
                                  className="group/gallery flex-none relative"
                                >
                                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-700 cursor-pointer transform transition-all duration-500 hover:scale-110 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/25 border-2 border-transparent hover:border-blue-400/50"
                                    onClick={() => openLightbox(galleryItem.image_url)}
                                  >
                                    <img
                                      src={galleryItem.image_url}
                                      alt={galleryItem.title}
                                      className="w-full h-full object-cover group-hover/gallery:brightness-110 transition-all duration-500"
                                    />
                                    
                                    {/* Enhanced Hover Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/gallery:opacity-100 transition-all duration-300 flex items-center justify-center">
                                      <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Photo Number Badge */}
                                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                                    {galleryIndex + 1}
                                  </div>
                                </div>
                              ))}
                              
                              {/* View More Card */}
                              {dusun.gallery.length > 8 && (
                                <div className="flex-none w-24 h-24 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border-2 border-dashed border-white/20 flex flex-col items-center justify-center hover:border-blue-400/50 transition-all duration-300 cursor-pointer">
                                  <svg className="w-6 h-6 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                  </svg>
                                  <span className="text-gray-400 text-xs font-medium">
                                    +{dusun.gallery.length - 8}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Stats */}
            <div className="mt-16 pt-8 border-t border-white/10">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto text-center">
                <div className="space-y-2">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg mx-auto flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-bold text-white">{dusunData.length}</h4>
                  <p className="text-gray-300 text-sm">Total Dusun</p>
                </div>
                
                <div className="space-y-2">
                  <div className="w-10 h-10 bg-green-600 rounded-lg mx-auto flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-bold text-white">
                    {dusunData.filter(d => d.nama_kadus).length}
                  </h4>
                  <p className="text-gray-300 text-sm">Kepala Dusun</p>
                </div>
                
                <div className="space-y-2">
                  <div className="w-10 h-10 bg-purple-600 rounded-lg mx-auto flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-bold text-white">
                    {dusunData.reduce((total, d) => total + (d.gallery?.length || 0), 0)}
                  </h4>
                  <p className="text-gray-300 text-sm">Foto Galeri</p>
                </div>
                
                <div className="space-y-2">
                  <div className="w-10 h-10 bg-orange-600 rounded-lg mx-auto flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-bold text-white">Aktif</h4>
                  <p className="text-gray-300 text-sm">Status</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gallery Section */}
      {galleryData.length > 0 && (
        <div className="bg-white py-12 sm:py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center mb-8 sm:mb-12 md:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
                Galeri Kelurahan
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
                Momen-momen indah dan kegiatan di Kelurahan Sangpiak Salu
              </p>
            </div>

            {/* Gallery Grid */}
            <div className="flex justify-center">
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4 max-w-xs sm:max-w-lg md:max-w-3xl lg:max-w-5xl w-full px-2">
                {getDisplayedGallery().map((item, index) => (
                  <div 
                    key={item.id}
                    className="group relative aspect-square overflow-hidden rounded-lg sm:rounded-xl cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl w-full"
                    onClick={() => openLightbox(item.image_url)}
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animation: `fadeInUp 0.6s ease-out ${index * 100}ms both`
                    }}
                  >
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover transition-all duration-300 group-hover:brightness-110"
                      onError={(e) => {
                        console.error('❌ Gallery image failed to load:', item.image_url);
                        const target = e.target as HTMLImageElement;
                        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjE1MCIgY3k9IjEyMCIgcj0iMzAiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTkwIDI0MEgxMjBMMTgwIDI0MEgyMTBWMjEwSDI0MEgyNzBWMjQwSDI0MEwyNzAgMjcwSDE4MEgxMjBIOTBWMjEwSDEyMFYyNDBaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=';
                      }}
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-50 group-hover:scale-100">
                        <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Show More Button - Only show if there are more than 6 photos */}
            {galleryData.length > 6 && (
              <div className="text-center mt-6 sm:mt-8">
                <button
                  onClick={toggleShowAllGallery}
                  className="group inline-flex items-center px-4 sm:px-6 md:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-indigo-700 transform transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl text-sm sm:text-base"
                >
                  {showAllGallery ? (
                    <>
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 transform transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                      <span className="hidden sm:inline">Tampilkan Lebih Sedikit</span>
                      <span className="sm:hidden">Lebih Sedikit</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 transform transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                      <span className="hidden sm:inline">Tampilkan Semua Galeri ({galleryData.length} foto)</span>
                      <span className="sm:hidden">Semua ({galleryData.length} foto)</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Gallery Count */}
            <div className="text-center mt-6 sm:mt-8">
              <p className="text-gray-500 text-sm sm:text-base px-4">
                {showAllGallery || galleryData.length <= 6 
                  ? `${galleryData.length} foto dalam galeri`
                  : `Menampilkan 6 dari ${galleryData.length} foto`
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxOpen && currentLightboxImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-2 sm:p-4"
          onClick={closeLightbox}
        >
          <div className="relative max-w-full max-h-full w-full flex items-center justify-center">
            <img
              src={currentLightboxImage}
              alt="Gallery Image"
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors duration-200"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Instruction Text */}
            <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2">
              <p className="text-white/70 text-xs sm:text-sm bg-black/30 px-3 py-1 sm:px-4 sm:py-2 rounded-full backdrop-blur-sm">
                <span className="hidden sm:inline">Klik di luar gambar atau tombol ✕ untuk menutup</span>
                <span className="sm:hidden">Tap di luar untuk menutup</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Hubungi Section */}
      <div 
        id="hubungi-section"
        className="relative bg-cover bg-center bg-no-repeat py-20 sm:py-24 md:py-32"
        style={{
          backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/Hubungi.png')"
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Main Title */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 sm:mb-8">
              Siap mengunjungi
            </h2>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 sm:mb-12">
              Sangpiak Salu?
            </h2>
            
            {/* CTA Button */}
            <div className="flex justify-center">
              <button className="group inline-flex items-center px-8 sm:px-10 md:px-12 py-4 sm:py-5 md:py-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg sm:text-xl md:text-2xl rounded-full hover:from-blue-700 hover:to-indigo-700 transform transition-all duration-300 hover:scale-105 shadow-2xl hover:shadow-3xl border-2 border-white/20 hover:border-white/40">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 mr-3 sm:mr-4 transform transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Hubungi Kami
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Galeri KKN Section */}
      {galeriKKNData.length > 0 && (
        <div className="py-12 sm:py-16 md:py-20" style={{ backgroundColor: '#00052d' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center mb-8 sm:mb-12 md:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-4">
                Galeri KKN 114
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-blue-100 max-w-3xl mx-auto px-4">
                Dokumentasi kegiatan KKN 114 di Kelurahan Sangpiak Salu
              </p>
            </div>

            {/* Gallery Grid */}
            <div className="flex justify-center">
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4 max-w-xs sm:max-w-lg md:max-w-3xl lg:max-w-5xl w-full px-2">
                {getDisplayedGaleriKKN().map((item, index) => (
                  <div 
                    key={item.id}
                    className="group relative aspect-square overflow-hidden rounded-lg sm:rounded-xl cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/25 w-full"
                    onClick={() => openLightbox(item.image_url)}
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animation: `fadeInUp 0.6s ease-out ${index * 100}ms both`
                    }}
                  >
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover transition-all duration-300 group-hover:brightness-110"
                      onError={(e) => {
                        console.error('❌ Galeri KKN image failed to load:', item.image_url);
                        const target = e.target as HTMLImageElement;
                        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjE1MCIgY3k9IjEyMCIgcj0iMzAiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTkwIDI0MEgxMjBMMTgwIDI0MEgyMTBWMjEwSDI0MEgyNzBWMjQwSDI0MEwyNzAgMjcwSDE4MEgxMjBIOTBWMjEwSDEyMFYyNDBaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=';
                      }}
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-50 group-hover:scale-100">
                        <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center border border-blue-300/50">
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Show More Button - Only show if there are more than 6 photos */}
            {galeriKKNData.length > 6 && (
              <div className="text-center mt-6 sm:mt-8">
                <button
                  onClick={toggleShowAllGaleriKKN}
                  className="group inline-flex items-center px-4 sm:px-6 md:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg sm:rounded-xl transform transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl hover:shadow-blue-500/25 text-sm sm:text-base border border-blue-400/30"
                >
                  {showAllGaleriKKN ? (
                    <>
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 transform transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                      <span className="hidden sm:inline">Tampilkan Lebih Sedikit</span>
                      <span className="sm:hidden">Lebih Sedikit</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 transform transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                      <span className="hidden sm:inline">Tampilkan Semua Galeri ({galeriKKNData.length} foto)</span>
                      <span className="sm:hidden">Semua ({galeriKKNData.length} foto)</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Gallery Count */}
            <div className="text-center mt-6 sm:mt-8">
              <p className="text-blue-200 text-sm sm:text-base px-4">
                {showAllGaleriKKN || galeriKKNData.length <= 6 
                  ? `${galeriKKNData.length} foto dalam galeri KKN`
                  : `Menampilkan 6 dari ${galeriKKNData.length} foto KKN`
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-black text-white mt-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-base text-gray-300">
              © 2025 Kelurahan Sangpiak Salu. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Back to Top Button with Progress Ring */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full shadow-lg hover:shadow-2xl transform transition-all duration-300 hover:scale-110 active:scale-95 group relative ${
          showBackToTop ? 'translate-y-0 opacity-100 visible' : 'translate-y-16 opacity-0 invisible pointer-events-none'
        }`}
        aria-label="Kembali ke atas"
        title="Kembali ke atas"
      >
        {/* Progress Ring */}
        <svg 
          className="absolute inset-0 w-full h-full -rotate-90 transform" 
          viewBox="0 0 48 48"
        >
          <circle
            cx="24"
            cy="24"
            r="20"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="2"
            fill="none"
          />
          <circle
            cx="24"
            cy="24"
            r="20"
            stroke="rgba(255, 255, 255, 0.8)"
            strokeWidth="2"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 20}`}
            strokeDashoffset={`${2 * Math.PI * 20 * (1 - scrollProgress / 100)}`}
            className="transition-all duration-150 ease-out"
          />
        </svg>
        
        {/* Arrow Icon */}
        <svg 
          className="w-5 h-5 sm:w-6 sm:h-6 mx-auto transform transition-transform duration-200 group-hover:-translate-y-0.5 relative z-10" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2.5} 
            d="M5 10l7-7m0 0l7 7m-7-7v18" 
          />
        </svg>
        
        {/* Ripple Effect on Click */}
        <div className="absolute inset-0 rounded-full bg-white opacity-0 group-active:opacity-20 transform scale-0 group-active:scale-100 transition-all duration-200"></div>
      </button>
    </div>
    </>
  );
}
